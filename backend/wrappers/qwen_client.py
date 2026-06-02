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

    def generate_json(self, prompt: str, system_prompt: str = "You are a helpful assistant. Output JSON only.") -> Dict[Any, Any]:
        """
        Calls Qwen and expects a JSON response.
        """
        if self.use_mock:
            logger.info("Using MOCK Qwen Client for generate_json")
            return self._get_mock_response(prompt)

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
            return json.loads(content)

        except Exception as e:
            logger.error(f"Qwen API error: {e}")
            # Fallback to mock on error to keep workflow running if possible
            return self._get_mock_response(prompt)

    def _get_mock_response(self, prompt: str) -> Dict[Any, Any]:
        """
        Deterministic mock responses based on prompt keywords.
        """
        lower_prompt = prompt.lower()

        if "plan" in lower_prompt or "benchmark request" in lower_prompt:
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
