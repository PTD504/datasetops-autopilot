from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import Sample, Evaluation, Chunk
from backend.models.enums import SampleStatus

class QualityEvaluatorAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id)
        self.purpose = "Evaluate generated samples and decide if they pass, need repair, or review."

    def evaluate(self, sample: Sample, existing_questions: list = None, existing_chunk_combos: list = None) -> Tuple[Evaluation, bool]:
        self._log_trace("start_evaluation", {"sample_id": sample.id})

        # Run duplicate checker
        from backend.tools.duplicate_checker import DuplicateCheckerTool
        checker = DuplicateCheckerTool(self.db, self.project_id)

        # Determine existing samples for the checker.
        # When existing_questions is provided by the caller (a list of Sample objects
        # accumulated during the workflow slot loop), use it directly — avoiding a
        # full-table query on every evaluate() call (N+1 elimination).
        # When None, fall back to DB query for backward compat with standalone callers
        # (e.g., test_generator_evaluator.py calling evaluate() without workflow context).
        if existing_questions is not None:
            # Caller-supplied list of Sample ORM objects, filtered to exclude the current sample and rejected samples.
            existing_samples = [
                s for s in existing_questions
                if getattr(s, 'id', None) != sample.id and getattr(s, 'status', None) != SampleStatus.REJECTED
            ]
        else:
            existing_samples = self.db.query(Sample).filter(
                Sample.project_id == self.project_id,
                Sample.id != sample.id,
                Sample.status != SampleStatus.REJECTED
            ).all()

        check_result = checker.check(
            candidate_question=sample.question,
            candidate_source_chunk_ids=sample.source_chunk_ids,
            candidate_category=sample.category,
            existing_samples=existing_samples
        )

        duplicate_score = check_result.duplicate_score
        novelty_score = 1.0
        novelty_issue = None
        if duplicate_score >= 0.82:
            novelty_score = 1.0 - duplicate_score
            novelty_issue = f"Low novelty detected: duplicate score is {duplicate_score:.2f} ({check_result.reason})"

        # Retrieve context used for the sample
        context_texts = []
        if sample.source_chunk_ids:
             chunks = self.db.query(Chunk).filter(Chunk.id.in_(sample.source_chunk_ids)).all()
             context_texts = [c.text for c in chunks]
        context = "\n".join(context_texts)

        # Build existing-questions context for novelty scoring.
        # The real LLM needs concrete questions to compare against; without this,
        # novelty_score would be an unconstrained judgment with no grounding.
        # Cap at 10 questions, truncate each to 80 chars to keep prompt size bounded.
        # Reuses existing_samples already built above — no second query needed.
        if existing_samples:
            existing_questions_lines = [f"- {s.question[:80]}" for s in existing_samples[:10]]
            existing_questions_block = "\n".join(existing_questions_lines)
        else:
            existing_questions_block = "(none - this is the first sample)"

        prompt = f"""
        Evaluate this RAG sample. Do not reward answers that use knowledge outside the provided evidence.
        Question: {sample.question}
        Expected Answer: {sample.expected_answer}
        Source Context: {context}
        Category: {sample.category}
        Difficulty: {sample.difficulty}
        Sample Type: {sample.sample_type}
        Retry Count: {sample.retry_count}

        Existing Sample Questions (for novelty comparison, up to 10 shown):
        {existing_questions_block}

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
        novelty_score (0-1): how semantically novel the question above is compared to the existing sample questions listed. Score 1.0 if the question covers a completely different scenario or information need. Score 0.0 if the question is essentially the same as one of the listed existing questions.
        decision ('pass', 'repair', 'human_review', 'reject'),
        issues (list): list of issues found.
        evaluator_notes (str): internal reasoning.
        repair_instruction (str): ACTIONABLE repair instruction if decision is 'repair'. Be specific (e.g., 'Rewrite the answer so it only uses the cited refund policy chunk.').
        """

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Evaluator. Output JSON.")

        if duplicate_score >= 0.82:
            pass
        else:
            novelty_score = response.get("novelty_score", 1.0)

        # Determine actual decision based on thresholds
        original_overall = response.get("overall_score", 0.0)
        overall_score = (original_overall * 0.85) + (novelty_score * 0.15)

        faithfulness_score = response.get("faithfulness_score", response.get("grounding_score", 0.0))
        answer_relevance_score = response.get("answer_relevance_score", 0.0)
        hallucination_risk_score = response.get("hallucination_risk_score", 0.0)
        answerability_score = response.get("answerability_score", 0.0)

        is_unanswerable = sample.sample_type == "unanswerable"

        # NOTE: The decision set in this block may be overridden further below
        # if novelty_score < 0.18 (duplicate detected). See the novelty guard
        # ~15 lines below this block.
        if is_unanswerable:
            # For intentional unanswerable, we don't demand high answer_relevance since the point is not to answer it.
            # We also don't demand high overall generic score which might be low due to zero answerability.
            if hallucination_risk_score <= 0.25 and faithfulness_score >= 0.85:
                decision = "pass"
                status = SampleStatus.APPROVED
                needs_repair = False
            elif hallucination_risk_score > 0.70 or faithfulness_score < 0.50:
                 decision = "reject"
                 status = SampleStatus.REJECTED
                 needs_repair = False
            elif sample.retry_count < 2:
                decision = "repair"
                status = SampleStatus.REPAIRING
                needs_repair = True
            else:
                decision = "human_review"
                status = SampleStatus.HUMAN_REVIEW
                needs_repair = False
        else:
            if faithfulness_score < 0.50 or answerability_score < 0.50 or hallucination_risk_score > 0.70:
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

        issues = response.get("issues", [])
        if not isinstance(issues, list):
            issues = []
        if novelty_issue:
            issues.append(novelty_issue)

        repair_instruction = response.get("repair_instruction", "")

        if novelty_score < 0.18:
            repair_instruction = "Regenerate using a different user scenario and evidence angle while preserving category and difficulty."
            if sample.retry_count < 2:
                decision = "repair"
                status = SampleStatus.REPAIRING
                needs_repair = True
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
            novelty_score=novelty_score,
            decision=decision,
            issues=issues,
            evaluator_notes=response.get("evaluator_notes", ""),
            repair_instruction=repair_instruction
        )

        self.db.add(evaluation)
        sample.status = status
        self.db.commit()

        self._log_trace("evaluation_complete", {"sample_id": sample.id, "decision": decision})
        return evaluation, needs_repair
