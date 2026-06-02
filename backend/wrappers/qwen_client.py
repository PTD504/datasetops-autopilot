import json
import logging
from typing import Dict, Any, Optional
from openai import OpenAI
from backend.core.config import settings

logger = logging.getLogger(__name__)

class QwenClient:
    def __init__(self):
        self.use_mock = settings.MOCK_LLM or not settings.QWEN_API_KEY
        if not self.use_mock:
            self.client = OpenAI(
                api_key=settings.QWEN_API_KEY,
                base_url=settings.QWEN_BASE_URL,
            )
            self.model = settings.QWEN_MODEL

    def generate_json(self, prompt: str, system_prompt: str = "You are a helpful assistant. Output JSON only.", _retry_count: int = 0) -> Dict[Any, Any]:
        """
        Calls Qwen and expects a JSON response.
        """
        if self.use_mock:
            logger.info("Using MOCK Qwen Client for generate_json")
            return self._get_mock_response(prompt)

        logger.info(f"Using REAL Qwen Client (model: {self.model}) for generate_json")
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )

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

        except Exception as e:
            logger.error(f"Qwen API error: {e}")
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
        lower_prompt = prompt.lower()

        # Check for specific Vietnamese demo
        is_vietnamese_demo = "vietnamese rag benchmark" in lower_prompt or "vietnamese" in lower_prompt

        if "plan" in lower_prompt or "benchmark request" in lower_prompt:
            if is_vietnamese_demo:
                return {
                    "goal": "Evaluate whether a customer support chatbot can answer refund, shipping, warranty, cancellation, and payment questions based on the Vietnamese ecommerce policy documents.",
                    "language": "Vietnamese",
                    "sample_count": {"total": 30, "easy": 10, "medium": 10, "hard": 10},
                    "categories": ["refund policy", "shipping policy", "warranty", "order cancellation", "payment policy"],
                    "quality_rules": ["Questions must be in natural Vietnamese.", "Answers must be grounded in the provided source documents."],
                    "source_summary": "Vietnamese ecommerce policy documents covering refunds, shipping, warranty, cancellations, and payments.",
                    "source_warnings": []
                }
            return {
                "goal": "Evaluate RAG system on test documents.",
                "language": "English",
                "sample_count": {"total": 5, "easy": 2, "medium": 2, "hard": 1},
                "categories": ["general", "specific"],
                "quality_rules": ["Must be grounded in source."],
                "source_summary": "Test source documents.",
                "source_warnings": []
            }
        elif "evaluate" in lower_prompt or "score" in lower_prompt or "evaluation" in lower_prompt:
            # Deterministic evaluation based on the question to simulate pass, repair, human_review, reject
            if "hoàn tiền" in lower_prompt and "14 ngày" not in lower_prompt:
                 # Trigger repair once
                 return {
                    "grounding_score": 0.5,
                    "answerability_score": 0.8,
                    "clarity_score": 0.9,
                    "difficulty_score": 0.5,
                    "language_score": 0.9,
                    "overall_score": 0.6,
                    "decision": "repair",
                    "issues": ["Answer lacks specific details about the 14-day limit."],
                    "evaluator_notes": "Needs repair.",
                    "repair_instruction": "Include the 14-day time limit mentioned in the source."
                }
            elif "campuchia" in lower_prompt:
                # Trigger human review
                 return {
                    "grounding_score": 0.7,
                    "answerability_score": 0.7,
                    "clarity_score": 0.8,
                    "difficulty_score": 0.8,
                    "language_score": 0.9,
                    "overall_score": 0.75,
                    "decision": "human_review",
                    "issues": ["Uncertain if this is a trick question or valid hard question."],
                    "evaluator_notes": "Sending to human review.",
                    "repair_instruction": ""
                }
            elif "reject me" in lower_prompt:
                 return {
                    "grounding_score": 0.1,
                    "answerability_score": 0.1,
                    "clarity_score": 0.1,
                    "difficulty_score": 0.1,
                    "language_score": 0.1,
                    "overall_score": 0.1,
                    "decision": "reject",
                    "issues": ["Completely off-topic or hallucinated."],
                    "evaluator_notes": "Rejecting this sample.",
                    "repair_instruction": ""
                }

            return {
                "grounding_score": 0.9,
                "answerability_score": 0.9,
                "clarity_score": 0.9,
                "difficulty_score": 0.5,
                "language_score": 0.9,
                "overall_score": 0.9,
                "decision": "pass",
                "issues": [],
                "evaluator_notes": "Looks good.",
                "repair_instruction": ""
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
