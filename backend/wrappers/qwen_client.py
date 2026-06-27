import json
import logging
from typing import Dict, Any, Optional
from openai import OpenAI
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.services.llm_budget import LLMBudgetGuard, BudgetExceededError
from backend.services.cancellation import WorkflowCancellationRequested, raise_if_cancelled
from backend.services.errors import sanitize_error_message

logger = logging.getLogger(__name__)

class QwenClient:
    def __init__(self, project_id: str = None, agent_name: str = "UnknownAgent", db: Session = None):
        self.use_mock = settings.effective_mock_llm or not settings.QWEN_API_KEY
        self.project_id = project_id
        self.agent_name = agent_name
        self.db = db
        self.budget_guard = LLMBudgetGuard(db, project_id) if (db and project_id) else None

        self.model = settings.QWEN_MODEL
        if not self.use_mock:
            self.client = OpenAI(
                api_key=settings.QWEN_API_KEY,
                base_url=settings.QWEN_BASE_URL,
            )

    def generate_json(self, prompt: str, system_prompt: str = "You are a helpful assistant. Output JSON only.", _retry_count: int = 0) -> Dict[Any, Any]:
        """
        Calls Qwen and expects a JSON response, logging the tool call safely.
        """
        import time
        from backend.services.workflow_logger import log_tool_call

        start_time = time.time()
        status = "success"
        output_summary = ""
        mode = "mock" if self.use_mock else "real"
        input_summary = f"Mode: {mode}, Model: {self.model}, Agent: {self.agent_name}, PromptLen: {len(prompt)}, SystemPromptLen: {len(system_prompt)}"

        try:
            result = self._generate_json_impl(prompt, system_prompt, _retry_count)
            if isinstance(result, dict):
                output_summary = f"Keys generated: {list(result.keys())}"
            else:
                output_summary = "Non-dict response generated"
            return result
        except Exception as e:
            status = "error"
            output_summary = f"Error: {str(e)}"
            raise e
        finally:
            latency_ms = int((time.time() - start_time) * 1000)
            if self.db and self.project_id:
                log_tool_call(
                    db=self.db,
                    project_id=self.project_id,
                    tool_name=f"QwenClient.{self.agent_name}.generate_json",
                    input_summary=input_summary,
                    output_summary=output_summary,
                    status=status,
                    latency_ms=latency_ms
                )

    def _generate_json_impl(self, prompt: str, system_prompt: str = "You are a helpful assistant. Output JSON only.", _retry_count: int = 0) -> Dict[Any, Any]:
        """
        Calls Qwen and expects a JSON response.
        """
        if self.use_mock:
            logger.info("Using MOCK Qwen Client for generate_json")
            return self._get_mock_response(prompt)

        logger.info(f"Using REAL Qwen Client (model: {self.model}) for generate_json")

        # Cancellation and budget pre-checks happen before any network execution.
        estimated_input = len(prompt) // 4 + len(system_prompt) // 4
        if self.db and self.project_id:
            raise_if_cancelled(self.db, self.project_id, f"{self.agent_name}.generate_json")

        if self.budget_guard:
            try:
                self.budget_guard.check_budget(estimated_input_tokens=estimated_input)
            except BudgetExceededError as e:
                logger.error(f"Budget blocked call: {e}")
                self.budget_guard.record_usage(self.agent_name, self.model, estimated_input, 0, "blocked", str(e))
                if settings.QWEN_STOP_ON_BUDGET_EXCEEDED:
                    raise e
                else:
                    return self._get_mock_response(prompt)

        try:
            # Ensure the word "json" (case-insensitive) is in either the system prompt or user prompt when response_format is used
            adjusted_system_prompt = system_prompt
            if "json" not in system_prompt.lower() and "json" not in prompt.lower():
                adjusted_system_prompt = system_prompt + "\nOutput JSON format."

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": adjusted_system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )

            # Post-call usage recording
            input_tokens = getattr(response.usage, "prompt_tokens", estimated_input) if hasattr(response, "usage") else estimated_input
            output_tokens = getattr(response.usage, "completion_tokens", 0) if hasattr(response, "usage") else 0
            if self.budget_guard:
                self.budget_guard.record_usage(self.agent_name, self.model, input_tokens, output_tokens, "success")

            content = response.choices[0].message.content
            try:
                if content is None:
                    raise ValueError("Received empty content from Qwen.")
                return json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Qwen JSON decoding error: {e}. Content was: {content}")
                if _retry_count < 1:
                    logger.info("Retrying JSON generation due to parsing error...")
                    return self.generate_json(prompt, system_prompt, _retry_count=_retry_count + 1)
                raise Exception(f"Failed to parse JSON after retry: {e}") from e

        except WorkflowCancellationRequested:
            raise
        except Exception as e:
            logger.error(f"Qwen API error: {e}")
            if self.budget_guard and not isinstance(e, BudgetExceededError):
                 self.budget_guard.record_usage(self.agent_name, self.model, estimated_input, 0, "error", sanitize_error_message(e))

            if not settings.ALLOW_LLM_FALLBACK:
                logger.error("ALLOW_LLM_FALLBACK is false. Raising error.")
                raise Exception(f"Qwen API error and fallback disabled: {e}") from e

            logger.warning("Falling back to MOCK Qwen Client due to API error (ALLOW_LLM_FALLBACK=true).")
            # Fallback to mock on error to keep workflow running if possible
            return self._get_mock_response(prompt)

    def _get_mock_response(self, prompt: str) -> Dict[Any, Any]:
        """
        Deterministic mock responses based on prompt keywords.
        """
        if self.budget_guard:
            # Mock mode tracks usage but doesn't block
            estimated_input = len(prompt) // 4
            self.budget_guard.record_usage(self.agent_name, "mock", estimated_input, 100, "success")

        lower_prompt = prompt.lower()

        # Check if slots are provided in the prompt
        if "slots json:" in lower_prompt:
            try:
                start_idx = prompt.lower().find("slots json:") + len("slots json:")
                slots_str = prompt[start_idx:].strip()
                slots_data = json.loads(slots_str)
                
                try:
                    from backend.wrappers.mock_data import VIETNAMESE_BENCHMARK_SAMPLES
                except ImportError:
                    VIETNAMESE_BENCHMARK_SAMPLES = []

                samples = []
                for idx, slot in enumerate(slots_data):
                    category = slot.get("category", "general")
                    difficulty = slot.get("difficulty", "medium")
                    sample_type = slot.get("sample_type", "single_hop")
                    preferred_chunks = slot.get("preferred_chunk_ids", [])
                    
                    matched_sample = None
                    for ms in VIETNAMESE_BENCHMARK_SAMPLES:
                        if ms.get("category") == category and ms.get("sample_type") == sample_type:
                            matched_sample = ms
                            break
                    
                    if not matched_sample:
                        for ms in VIETNAMESE_BENCHMARK_SAMPLES:
                            if ms.get("category") == category:
                                matched_sample = ms
                                break
                                
                    if not matched_sample:
                        for ms in VIETNAMESE_BENCHMARK_SAMPLES:
                            if ms.get("sample_type") == sample_type:
                                matched_sample = ms
                                break

                    if not matched_sample and VIETNAMESE_BENCHMARK_SAMPLES:
                        matched_sample = VIETNAMESE_BENCHMARK_SAMPLES[idx % len(VIETNAMESE_BENCHMARK_SAMPLES)]
                        
                    if matched_sample:
                        question = matched_sample.get("question", "Mock Question?")
                        expected_answer = matched_sample.get("expected_answer", "Mock Answer.")
                        existing_count = sum(1 for s in samples if s["question"].startswith(question))
                        if existing_count > 0:
                            question = f"{question} (Var {existing_count})"
                    else:
                        question = f"Mock Question for category '{category}', type '{sample_type}'?"
                        expected_answer = f"Mock Answer for category '{category}', type '{sample_type}'."
                        
                    samples.append({
                        "category": category,
                        "difficulty": difficulty,
                        "sample_type": sample_type,
                        "question": question,
                        "expected_answer": expected_answer,
                        "source_chunk_ids": preferred_chunks if preferred_chunks else [f"mock_{category}_chunk_001"]
                    })
                
                return {"samples": samples}
            except Exception as e:
                logger.error(f"Error parsing slots from mock prompt: {e}")

        # Check for specific Vietnamese demo
        is_vietnamese_demo = "vietnamese rag benchmark" in lower_prompt or "vietnamese" in lower_prompt

        if "extract" in lower_prompt and "categories" in lower_prompt:
            if is_vietnamese_demo:
                return {
                    "categories": ["refund policy", "shipping policy", "warranty", "order cancellation", "payment policy"]
                }
            return {
                "categories": ["general", "specific"]
            }

        if "plan" in lower_prompt or "benchmark request" in lower_prompt:
            quality_rules_mock = ["Answerable samples must be grounded in the source documents. Intentional unanswerable samples are allowed when clearly labeled as unanswerable and the expected answer states that the documents do not contain enough information."]

            if is_vietnamese_demo:
                return {
                    "goal": "Evaluate whether a customer support chatbot can answer refund, shipping, warranty, cancellation, and payment questions based on the Vietnamese ecommerce policy documents.",
                    "language": "Vietnamese",
                    "sample_count": {"total": 30, "easy": 10, "medium": 10, "hard": 10},
                    "categories": ["refund policy", "shipping policy", "warranty", "order cancellation", "payment policy"],
                    "quality_rules": ["Questions must be in natural Vietnamese.", quality_rules_mock[0]],
                    "source_summary": "Vietnamese ecommerce policy documents covering refunds, shipping, warranty, cancellations, and payments.",
                    "source_warnings": []
                }
            return {
                "goal": "Evaluate RAG system on test documents.",
                "language": "English",
                "sample_count": {"total": 5, "easy": 2, "medium": 2, "hard": 1},
                "categories": ["general", "specific"],
                "quality_rules": quality_rules_mock,
                "source_summary": "Test source documents.",
                "source_warnings": []
            }
        elif "evaluate" in lower_prompt or "score" in lower_prompt or "evaluation" in lower_prompt:
            # Deterministic evaluation based on the question to simulate pass, repair, human_review, reject

            is_unanswerable = "sample type: unanswerable" in lower_prompt
            is_multi_hop = "sample type: multi_hop" in lower_prompt
            is_edge_case = "sample type: edge_case" in lower_prompt
            is_hard = "difficulty: hard" in lower_prompt or "difficulty: 'hard'" in lower_prompt
            is_retry = "retry count: 0" not in lower_prompt and ("retry count: 1" in lower_prompt or "retry count: 2" in lower_prompt or "attempt" in lower_prompt)

            if is_hard and is_multi_hop and not is_retry:
                # Trigger repair
                from backend.wrappers.mock_data import MOCK_EVALUATION_LOW_SCORE
                return MOCK_EVALUATION_LOW_SCORE.copy()
            elif "hoàn tiền" in lower_prompt and "14 ngày" not in lower_prompt and not is_retry:
                 # Trigger repair once
                 return {
                    "faithfulness_score": 0.5,
                    "answer_relevance_score": 0.8,
                    "context_precision_score": 0.8,
                    "context_recall_score": 0.5,
                    "hallucination_risk_score": 0.1,
                    "answerability_score": 0.9,
                    "clarity_score": 0.9,
                    "difficulty_match_score": 0.8,
                    "overall_score": 0.65,
                    "decision": "repair",
                    "issues": ["Answer lacks specific details about the 14-day limit."],
                    "evaluator_notes": "Needs repair.",
                    "repair_instruction": "Include the 14-day time limit mentioned in the source."
                }
            elif is_edge_case and "campuchia" in lower_prompt:
                # Trigger human review
                 return {
                    "faithfulness_score": 0.8,
                    "answer_relevance_score": 0.7,
                    "context_precision_score": 0.8,
                    "context_recall_score": 0.6,
                    "hallucination_risk_score": 0.4,
                    "answerability_score": 0.7,
                    "clarity_score": 0.6,
                    "difficulty_match_score": 0.9,
                    "overall_score": 0.75,
                    "decision": "human_review",
                    "issues": ["Uncertain if this is a trick question or valid hard question."],
                    "evaluator_notes": "Sending to human review.",
                    "repair_instruction": "Clarify the boundary condition."
                }
            elif "reject me" in lower_prompt:
                 return {
                    "faithfulness_score": 0.1,
                    "answer_relevance_score": 0.1,
                    "context_precision_score": 0.1,
                    "context_recall_score": 0.1,
                    "hallucination_risk_score": 0.9,
                    "answerability_score": 0.1,
                    "clarity_score": 0.1,
                    "difficulty_match_score": 0.1,
                    "overall_score": 0.1,
                    "decision": "reject",
                    "issues": ["Completely off-topic or hallucinated."],
                    "evaluator_notes": "Rejecting this sample.",
                    "repair_instruction": ""
                }
            elif is_unanswerable:
                # Mock a passing unanswerable
                return {
                    "faithfulness_score": 1.0,
                    "answer_relevance_score": 1.0,
                    "context_precision_score": 1.0,
                    "context_recall_score": 1.0,
                    "hallucination_risk_score": 0.0,
                    "answerability_score": 0.1,
                    "clarity_score": 0.9,
                    "difficulty_match_score": 0.9,
                    "overall_score": 0.95,
                    "novelty_score": 0.92,
                    "decision": "pass",
                    "issues": [],
                    "evaluator_notes": "Correctly identified as unanswerable.",
                    "repair_instruction": ""
                }
            elif is_multi_hop and "source_chunk_ids" in lower_prompt and lower_prompt.count("chunk_") < 2 and not is_retry:
                # Mock a penalty for missing chunks
                 return {
                    "faithfulness_score": 0.6,
                    "answer_relevance_score": 0.8,
                    "context_precision_score": 0.9,
                    "context_recall_score": 0.4,
                    "hallucination_risk_score": 0.2,
                    "answerability_score": 0.9,
                    "clarity_score": 0.8,
                    "difficulty_match_score": 0.8,
                    "overall_score": 0.65,
                    "decision": "repair",
                    "issues": ["Answer relies on single source for a multi-hop question."],
                    "evaluator_notes": "Needs more evidence chunks.",
                    "repair_instruction": "Add a second evidence chunk about payment method because this is a multi-hop sample."
                }

            return {
                "faithfulness_score": 0.9,
                "answer_relevance_score": 0.9,
                "context_precision_score": 0.9,
                "context_recall_score": 0.9,
                "hallucination_risk_score": 0.1,
                "answerability_score": 0.9,
                "clarity_score": 0.9,
                "difficulty_match_score": 0.9,
                "overall_score": 0.9,
                "novelty_score": 0.92,
                "decision": "pass",
                "issues": [],
                "evaluator_notes": "Looks good.",
                "repair_instruction": ""
            }
        elif "generate one rag" in lower_prompt or "repair the following rag" in lower_prompt:
            is_repair = "repair the following rag" in lower_prompt
            # Find category
            category = "general"
            for cat in ["refund policy", "shipping policy", "warranty", "order cancellation", "payment policy"]:
                if cat in lower_prompt:
                    category = cat
                    break
                    
            difficulty = "medium"
            for diff in ["easy", "medium", "hard"]:
                if diff in lower_prompt:
                    difficulty = diff
                    break
                    
            sample_type = "single_hop"
            for st in ["single_hop", "multi_hop", "unanswerable", "edge_case"]:
                if st in lower_prompt:
                    sample_type = st
                    break

            try:
                from backend.wrappers.mock_data import VIETNAMESE_BENCHMARK_SAMPLES
            except ImportError:
                VIETNAMESE_BENCHMARK_SAMPLES = []

            # Match sample in VIETNAMESE_BENCHMARK_SAMPLES
            matched_sample = None
            for ms in VIETNAMESE_BENCHMARK_SAMPLES:
                if ms.get("category") == category and ms.get("sample_type") == sample_type:
                    matched_sample = ms.copy()
                    break
            
            if not matched_sample:
                for ms in VIETNAMESE_BENCHMARK_SAMPLES:
                    if ms.get("category") == category:
                        matched_sample = ms.copy()
                        break
            
            if not matched_sample:
                for ms in VIETNAMESE_BENCHMARK_SAMPLES:
                    if ms.get("sample_type") == sample_type:
                        matched_sample = ms.copy()
                        break

            if not matched_sample and VIETNAMESE_BENCHMARK_SAMPLES:
                matched_sample = VIETNAMESE_BENCHMARK_SAMPLES[0].copy()

            if matched_sample:
                q_text = matched_sample["question"]
                ans_text = matched_sample["expected_answer"]
                
                # If we are repairing, reflect the change
                if is_repair:
                    if "hoàn tiền" in q_text.lower():
                        ans_text = "Bạn có thể yêu cầu hoàn tiền toàn bộ trong vòng 14 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi."
                    else:
                        q_text += " (Repaired)"
                        
                return {
                    "category": category,
                    "difficulty": difficulty,
                    "sample_type": sample_type,
                    "question": q_text,
                    "expected_answer": ans_text,
                    "source_chunk_ids": matched_sample["source_chunk_ids"]
                }
            else:
                return {
                    "category": category,
                    "difficulty": difficulty,
                    "sample_type": sample_type,
                    "question": f"Mock question for {category} ({difficulty}, {sample_type})?" + (" (Repaired)" if is_repair else ""),
                    "expected_answer": f"Mock answer for {category} ({difficulty}, {sample_type}).",
                    "source_chunk_ids": ["mock_chunk_id"]
                }
        elif "sample" in lower_prompt or "generate" in lower_prompt:
            if is_vietnamese_demo:
                try:
                    from backend.wrappers.mock_data import mock_30_samples
                    return {"samples": mock_30_samples}
                except ImportError:
                     pass
            return {
                "samples": [
                    {
                        "category": "general",
                        "difficulty": "easy",
                        "question": "What is this document about?",
                        "expected_answer": "This is a mock answer based on the context.",
                        "source_chunk_ids": ["mock_chunk_001"]
                    }
                ]
            }
        else:
            return {"status": "mock_success", "data": "Mock data fallback"}
