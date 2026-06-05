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
        Evaluate this RAG sample. Do not reward answers that use knowledge outside the provided evidence.
        Question: {sample.question}
        Expected Answer: {sample.expected_answer}
        Source Context: {context}
        Category: {sample.category}
        Difficulty: {sample.difficulty}
        Sample Type: {sample.sample_type}

        Output JSON with:
        faithfulness_score (0-1): whether the expected answer is supported by the evidence chunks.
        answer_relevance_score (0-1): whether the expected answer directly answers the question.
        context_precision_score (0-1): whether provided evidence chunks are actually relevant.
        context_recall_score (0-1): whether provided evidence chunks contain enough information to answer.
        hallucination_risk_score (0-1): risk that the answer includes unsupported information. Lower is better.
        answerability_score (0-1): whether the question is answerable from the provided documents.
        clarity_score (0-1): whether the question and answer are clear.
        difficulty_match_score (0-1): whether the generated sample matches its intended difficulty.
        overall_score (0-1): weighted quality score.
        grounding_score (0-1): backward compatible grounding score.
        language_score (0-1): backward compatible language score.
        difficulty_score (0-1): backward compatible difficulty score.
        decision ('pass', 'repair', 'human_review', 'reject'),
        issues (list): list of issues found.
        evaluator_notes (str): internal reasoning.
        repair_instruction (str): ACTIONABLE repair instruction if decision is 'repair'. Be specific (e.g., 'Rewrite the answer so it only uses the cited refund policy chunk.').
        """

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Evaluator. Output JSON.")

        # Determine actual decision based on thresholds
        overall_score = response.get("overall_score", 0.0)
        faithfulness_score = response.get("faithfulness_score", response.get("grounding_score", 0.0))
        answer_relevance_score = response.get("answer_relevance_score", 0.0)
        hallucination_risk_score = response.get("hallucination_risk_score", 0.0)
        answerability_score = response.get("answerability_score", 0.0)

        is_unanswerable = sample.sample_type == "unanswerable"

        if faithfulness_score < 0.50 or (not is_unanswerable and answerability_score < 0.50) or hallucination_risk_score > 0.70:
            decision = "reject"
            status = SampleStatus.REJECTED
            needs_repair = False
        elif overall_score >= 0.80 and faithfulness_score >= 0.85 and answer_relevance_score >= 0.75 and hallucination_risk_score <= 0.25:
            decision = "pass"
            status = SampleStatus.APPROVED
            needs_repair = False
        elif 0.60 <= overall_score < 0.80 or faithfulness_score < 0.85:
            if sample.retry_count < 2: # max retries = 2
                decision = "repair"
                status = SampleStatus.REPAIRING
                needs_repair = True
            else:
                decision = "human_review"
                status = SampleStatus.HUMAN_REVIEW
                needs_repair = False
        else:
            decision = "human_review"
            status = SampleStatus.HUMAN_REVIEW
            needs_repair = False

        evaluation = Evaluation(
            sample_id=sample.id,
            grounding_score=response.get("grounding_score", faithfulness_score),
            answerability_score=answerability_score,
            clarity_score=response.get("clarity_score", 0.0),
            difficulty_score=response.get("difficulty_score", 0.0),
            language_score=response.get("language_score", 0.0),
            faithfulness_score=faithfulness_score,
            answer_relevance_score=answer_relevance_score,
            context_precision_score=response.get("context_precision_score", 0.0),
            context_recall_score=response.get("context_recall_score", 0.0),
            hallucination_risk_score=hallucination_risk_score,
            difficulty_match_score=response.get("difficulty_match_score", 0.0),
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
