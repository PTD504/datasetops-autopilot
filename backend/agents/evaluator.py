from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import Sample, Evaluation, Chunk
from backend.models.enums import SampleStatus

class QualityEvaluatorAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id)
        self.purpose = "Evaluate generated samples and decide if they pass, need repair, or review."

    def evaluate(self, sample: Sample) -> Tuple[Evaluation, bool]:
        self._log_trace("start_evaluation", {"sample_id": sample.id})

        # Retrieve context used for the sample
        context_texts = []
        if sample.source_chunk_ids:
             chunks = self.db.query(Chunk).filter(Chunk.id.in_(sample.source_chunk_ids)).all()
             context_texts = [c.text for c in chunks]
        context = "\n".join(context_texts)

        prompt = f"""
        Evaluate this RAG sample.
        Question: {sample.question}
        Expected Answer: {sample.expected_answer}
        Source Context: {context}

        Output JSON with:
        grounding_score (0-1), answerability_score (0-1), clarity_score (0-1), difficulty_score (0-1), language_score (0-1),
        overall_score (0-1), decision ('pass', 'repair', 'human_review', 'reject'),
        issues (list), evaluator_notes (str), repair_instruction (str).
        """

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Evaluator. Output JSON.")

        # Determine actual decision based on thresholds
        overall_score = response.get("overall_score", 0.0)
        grounding_score = response.get("grounding_score", 0.0)

        if overall_score >= 0.80 and grounding_score >= 0.85:
            decision = "pass"
            status = SampleStatus.APPROVED
            needs_repair = False
        elif 0.60 <= overall_score < 0.80:
            if sample.retry_count < 2: # max retries = 2
                decision = "repair"
                status = SampleStatus.REPAIRING
                needs_repair = True
            else:
                decision = "human_review"
                status = SampleStatus.HUMAN_REVIEW
                needs_repair = False
        else:
            decision = "reject"
            status = SampleStatus.REJECTED
            needs_repair = False

        evaluation = Evaluation(
            sample_id=sample.id,
            grounding_score=grounding_score,
            answerability_score=response.get("answerability_score", 0.0),
            clarity_score=response.get("clarity_score", 0.0),
            difficulty_score=response.get("difficulty_score", 0.0),
            language_score=response.get("language_score", 0.0),
            overall_score=overall_score,
            decision=decision,
            issues=response.get("issues", []),
            evaluator_notes=response.get("evaluator_notes", ""),
            repair_instruction=response.get("repair_instruction", "")
        )

        self.db.add(evaluation)
        sample.status = status
        self.db.commit()

        self._log_trace("evaluation_complete", {"sample_id": sample.id, "decision": decision})
        return evaluation, needs_repair
