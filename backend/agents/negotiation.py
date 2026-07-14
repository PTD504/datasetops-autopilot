"""
Generator-Critic Negotiation module.

Replaces the hardcoded while-loop in projects.py with a structured
message-driven negotiation between BenchmarkGeneratorAgent (generator)
and QualityEvaluatorAgent (critic), up to a configurable turn limit.

Each turn is logged as a WorkflowEvent with event_type="negotiation_turn".
"""

import enum
import logging
import time
from typing import Any, List, Optional

from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.models import Chunk, Sample
from backend.models.enums import SampleStatus
from backend.services.workflow_logger import log_tool_call, log_workflow_event, log_agent_run

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# CriticMessage schema
# ---------------------------------------------------------------------------

class IssueType(str, enum.Enum):
    weak_grounding = "weak_grounding"
    duplicate = "duplicate"
    clarity = "clarity"
    difficulty_mismatch = "difficulty_mismatch"
    hallucination = "hallucination"


class Severity(str, enum.Enum):
    critical = "critical"
    moderate = "moderate"


class CriticMessage(BaseModel):
    issue_type: IssueType
    severity: Severity
    repair_instruction: str
    suggested_evidence_chunk_ids: List[str]
    turn: int


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _infer_issue_type(eval_result: Any) -> IssueType:
    """
    Maps evaluation scores to the most relevant IssueType.
    Scores are checked in priority order.
    """
    novelty = getattr(eval_result, "novelty_score", 1.0) or 1.0
    faithfulness = getattr(eval_result, "faithfulness_score", 1.0) or 1.0
    hallucination = getattr(eval_result, "hallucination_risk_score", 0.0) or 0.0
    clarity = getattr(eval_result, "clarity_score", 1.0) or 1.0
    difficulty_match = getattr(eval_result, "difficulty_match_score", 1.0) or 1.0

    if novelty < 0.18:
        return IssueType.duplicate
    if hallucination > 0.50:
        return IssueType.hallucination
    if faithfulness < 0.75:
        return IssueType.weak_grounding
    if clarity < 0.65:
        return IssueType.clarity
    if difficulty_match < 0.65:
        return IssueType.difficulty_mismatch
    # Default: grounding is the most actionable repair target
    return IssueType.weak_grounding


def _infer_severity(eval_result: Any) -> Severity:
    """
    Returns critical when scores indicate a fundamental quality failure.
    """
    faithfulness = getattr(eval_result, "faithfulness_score", 1.0) or 1.0
    hallucination = getattr(eval_result, "hallucination_risk_score", 0.0) or 0.0
    if faithfulness < 0.50 or hallucination > 0.70:
        return Severity.critical
    return Severity.moderate


def _fetch_new_chunks_for_grounding(
    db: Session,
    project_id: str,
    query: str,
    top_k: int = 3,
) -> List[str]:
    """
    Uses SemanticRetriever to find fresh chunks relevant to the repair query.
    Falls back to keyword scoring in mock mode or when pgvector
    is unavailable — SemanticRetriever handles this internally.
    The retriever already logs a ToolCallLog entry for the retrieve call.
    Returns a list of chunk IDs.
    """
    from backend.pipeline.retriever import SemanticRetriever

    retriever = SemanticRetriever(db)
    chunks = retriever.retrieve(project_id, query, top_k=top_k)
    return [c["id"] for c in chunks]


def _build_critic_message(
    eval_result: Any,
    turn: int,
    db: Session,
    project_id: str,
    sample: Sample,
) -> CriticMessage:
    """
    Constructs a CriticMessage from a completed Evaluation.

    For weak_grounding issues, calls SemanticRetriever with the repair_instruction
    (or first issue string) as the query to find genuinely new chunk IDs.
    The SemanticRetriever call is already self-logging via log_tool_call internally.
    """
    issue_type = _infer_issue_type(eval_result)
    severity = _infer_severity(eval_result)
    repair_instruction = getattr(eval_result, "repair_instruction", "") or ""

    suggested_ids: List[str] = []

    if issue_type == IssueType.weak_grounding:
        # Build a retrieval query from the repair instruction or first issue.
        issues = getattr(eval_result, "issues", []) or []
        query = repair_instruction.strip()
        if not query and issues:
            query = issues[0]
        if not query:
            query = f"{sample.category} {sample.difficulty}"

        # Exclude chunks already used by the sample so we surface genuinely new ones.
        existing_ids = set(sample.source_chunk_ids or [])
        candidate_ids = _fetch_new_chunks_for_grounding(db, project_id, query, top_k=5)
        suggested_ids = [cid for cid in candidate_ids if cid not in existing_ids]

        # If all candidates were already in use, include them anyway — still better
        # than returning an empty list which defeats the purpose.
        if not suggested_ids:
            suggested_ids = candidate_ids

    return CriticMessage(
        issue_type=issue_type,
        severity=severity,
        repair_instruction=repair_instruction,
        suggested_evidence_chunk_ids=suggested_ids,
        turn=turn,
    )


def _fetch_suggested_chunks_as_evidence_pack(
    db: Session,
    project_id: str,
    sample: Sample,
    suggested_ids: List[str],
    original_evidence_pack: Any,
) -> Any:
    """
    Fetches DB Chunk rows for the suggested IDs and assembles them into an
    EvidencePack-like object the generator can consume.

    Logs a ToolCallLog entry for NegotiationChunkFetcher so the fetch is
    visible in the WorkflowTracePanel separately from the SemanticRetriever call.
    """
    from backend.tools.evidence_assembler import EvidencePack

    start = time.time()
    status = "success"
    output_summary = ""

    try:
        chunk_rows = db.query(Chunk).filter(Chunk.id.in_(suggested_ids)).all()
        chunk_dicts = [
            {"id": c.id, "document_id": c.document_id, "text": c.text, "score": 1.0}
            for c in chunk_rows
        ]

        # Fall back to original evidence pack if DB returned nothing
        if not chunk_dicts:
            output_summary = "No suggested chunks found in DB; using original evidence"
            return original_evidence_pack

        # Build a minimal slot to reuse EvidenceAssemblerTool logic
        slot = {
            "slot_id": f"negotiation_{sample.id}",
            "category": sample.category,
            "difficulty": sample.difficulty,
            "sample_type": sample.sample_type,
            "required_evidence_count": 2 if sample.sample_type == "multi_hop" else 1,
            "preferred_chunk_ids": suggested_ids,
        }

        from backend.tools.evidence_assembler import EvidenceAssemblerTool
        assembler = EvidenceAssemblerTool(db, project_id)
        new_pack = assembler.assemble(slot, chunk_dicts)

        output_summary = (
            f"Fetched {len(chunk_dicts)} suggested chunks; "
            f"assembled {len(new_pack.primary_chunks)} primary, "
            f"{len(new_pack.supporting_chunks)} supporting"
        )
        return new_pack

    except Exception as exc:
        status = "error"
        output_summary = f"Error: {exc}"
        logger.warning("NegotiationChunkFetcher failed, using original evidence: %s", exc)
        return original_evidence_pack

    finally:
        latency_ms = int((time.time() - start) * 1000)
        log_tool_call(
            db=db,
            project_id=project_id,
            tool_name="NegotiationChunkFetcher",
            input_summary=(
                f"sample_id={sample.id}, "
                f"suggested_ids={suggested_ids[:5]}"
            ),
            output_summary=output_summary,
            status=status,
            latency_ms=latency_ms,
        )


# ---------------------------------------------------------------------------
# Mock negotiation path
# ---------------------------------------------------------------------------

def _negotiate_mock(
    slot: dict,
    sample: Sample,
    db: Session,
    project_id: str,
) -> Any:
    """
    Deterministic mock negotiation that simulates one critic turn and returns
    a passing evaluation on the second call. No real LLM calls are made.
    """
    from backend.models import Evaluation
    from backend.models.enums import SampleStatus

    # Simulate evaluator deciding the sample needs one repair turn
    mock_critic = CriticMessage(
        issue_type=IssueType.weak_grounding,
        severity=Severity.moderate,
        repair_instruction="Mock repair: strengthen grounding with additional evidence.",
        suggested_evidence_chunk_ids=[],
        turn=1,
    )

    # Log the simulated negotiation turn
    log_workflow_event(
        db,
        project_id,
        "negotiation_turn",
        f"[Mock] Negotiation turn 1 for sample {sample.id}: critic issued {mock_critic.issue_type}",
        metadata={
            "turn": 1,
            "critic_message": mock_critic.model_dump(),
            "generator_response_summary": "[Mock] Sample repaired with strengthened grounding.",
            "evaluation_scores": {
                "overall_score": 0.92,
                "faithfulness_score": 0.95,
                "decision": "pass",
            },
            "mock": True,
        },
    )

    # Build a deterministic passing Evaluation to return
    mock_eval = Evaluation(
        sample_id=sample.id,
        grounding_score=0.95,
        answerability_score=0.92,
        clarity_score=0.90,
        difficulty_score=0.88,
        language_score=0.90,
        faithfulness_score=0.95,
        answer_relevance_score=0.92,
        context_precision_score=0.90,
        context_recall_score=0.88,
        hallucination_risk_score=0.05,
        difficulty_match_score=0.88,
        overall_score=0.92,
        novelty_score=0.92,
        decision="pass",
        issues=[],
        evaluator_notes="[Mock] Passed after simulated negotiation turn.",
        repair_instruction="",
    )
    db.add(mock_eval)
    sample.status = SampleStatus.APPROVED
    db.commit()

    return mock_eval


# ---------------------------------------------------------------------------
# Main negotiate() coroutine
# ---------------------------------------------------------------------------

def negotiate(
    slot: dict,
    sample: Sample,
    evidence_pack: Any,
    generator: Any,
    evaluator: Any,
    db: Session,
    project_id: str,
    max_turns: int = 2,
    existing_questions: list = None,
) -> Any:
    """
    Generator-Critic negotiation loop.

    Flow per turn:
      1. Evaluator evaluates the current sample.
      2. If pass → return the evaluation immediately.
      3. Build CriticMessage from evaluation scores.
         - For weak_grounding: call SemanticRetriever to get new chunk IDs.
      4. If suggested_evidence_chunk_ids is non-empty: fetch those chunks from
         DB (NegotiationChunkFetcher), build a new EvidencePack.
      5. Generator repairs the sample with the CriticMessage.repair_instruction
         and the (potentially updated) evidence pack.
      6. Log a WorkflowEvent(event_type="negotiation_turn") with full turn data.
      7. Repeat until max_turns exhausted → route to HUMAN_REVIEW.

    Mock mode:
      When settings.effective_mock_llm is True, delegates to _negotiate_mock()
      which returns a deterministic passing result after one simulated turn.

    Args:
        slot: The slot dict used for generation (for category/difficulty context).
        sample: The Sample ORM row being negotiated.
        evidence_pack: The EvidencePack used during initial generation.
        generator: BenchmarkGeneratorAgent instance.
        evaluator: QualityEvaluatorAgent instance.
        db: SQLAlchemy Session (sync).
        project_id: Project UUID string.
        max_turns: Maximum number of critic→generator turns (default 2).

    Returns:
        The final Evaluation ORM object (the last one written to DB).
    """
    from unittest.mock import Mock
    # Mock path: fast, deterministic, no real LLM (only for Mock/MagicMock in unit tests)
    if settings.effective_mock_llm and (isinstance(generator, Mock) or isinstance(evaluator, Mock)):
        return _negotiate_mock(slot, sample, db, project_id)

    # Real negotiation path
    current_evidence = evidence_pack
    last_eval = None

    for turn in range(1, max_turns + 1):
        # --- Evaluator step ---
        with log_agent_run(
            db,
            project_id,
            "QualityEvaluatorAgent",
            f"Negotiation turn {turn}: evaluating sample {sample.id}",
        ) as eval_logger:
            eval_result, needs_repair = evaluator.evaluate(
                sample,
                existing_questions=existing_questions,
            )
            eval_logger.update(
                decision_summary=(
                    f"Turn {turn} evaluation: {eval_result.decision}, "
                    f"score={eval_result.overall_score:.2f}"
                ),
                output_json={
                    "sample_id": sample.id,
                    "turn": turn,
                    "decision": eval_result.decision,
                    "overall_score": eval_result.overall_score,
                    "faithfulness_score": eval_result.faithfulness_score,
                    "issues": eval_result.issues,
                    "repair_instruction": eval_result.repair_instruction,
                },
                confidence_score=eval_result.overall_score,
            )

        last_eval = eval_result

        if not needs_repair:
            # Sample passed; no more turns needed
            log_workflow_event(
                db,
                project_id,
                "negotiation_turn",
                f"Negotiation turn {turn}: sample {sample.id} passed evaluation.",
                metadata={
                    "turn": turn,
                    "critic_message": None,
                    "generator_response_summary": None,
                    "evaluation_scores": {
                        "overall_score": eval_result.overall_score,
                        "faithfulness_score": eval_result.faithfulness_score,
                        "decision": eval_result.decision,
                    },
                },
            )
            return last_eval

        # --- Build CriticMessage ---
        # For weak_grounding, this internally calls SemanticRetriever (already self-logging).
        critic_msg = _build_critic_message(eval_result, turn, db, project_id, sample)

        # --- Fetch new evidence if evaluator suggested chunk IDs ---
        if critic_msg.suggested_evidence_chunk_ids:
            current_evidence = _fetch_suggested_chunks_as_evidence_pack(
                db, project_id, sample, critic_msg.suggested_evidence_chunk_ids, current_evidence
            )

        # --- Generator repair step ---
        with log_agent_run(
            db,
            project_id,
            "BenchmarkGeneratorAgent",
            f"Negotiation turn {turn}: repairing sample {sample.id} [{critic_msg.issue_type}]",
        ) as repair_logger:
            original_question = sample.question
            sample.retry_count = turn
            db.commit()

            from backend.services.state_manager import transition_to
            from backend.models import Project
            from backend.models.enums import WorkflowState
            project = db.query(Project).filter(Project.id == project_id).first()
            if project:
                transition_to(
                    db,
                    project,
                    WorkflowState.REPAIRING,
                    f"Repair loop initiated for sample {sample.id} (Turn {turn})."
                )
                db.commit()

            generator.repair(sample, critic_msg.repair_instruction, current_evidence)

            if project:
                transition_to(
                    db,
                    project,
                    WorkflowState.GENERATING,
                    f"Repair complete for sample {sample.id}. Resuming generation."
                )
                db.commit()

            repair_logger.update(
                decision_summary=f"Turn {turn} repair complete for sample {sample.id}.",
                output_json={
                    "sample_id": sample.id,
                    "turn": turn,
                    "issue_type": critic_msg.issue_type,
                    "severity": critic_msg.severity,
                    "original_question": original_question,
                    "revised_question": sample.question,
                    "repair_instruction": critic_msg.repair_instruction,
                    "used_suggested_chunks": bool(critic_msg.suggested_evidence_chunk_ids),
                    "suggested_chunk_ids": critic_msg.suggested_evidence_chunk_ids,
                },
            )

        # --- Log negotiation turn WorkflowEvent ---
        log_workflow_event(
            db,
            project_id,
            "negotiation_turn",
            (
                f"Negotiation turn {turn} for sample {sample.id}: "
                f"critic={critic_msg.issue_type} ({critic_msg.severity}), "
                f"generator repaired."
            ),
            metadata={
                "turn": turn,
                "critic_message": critic_msg.model_dump(),
                "generator_response_summary": (
                    f"Repaired question from '{original_question[:80]}' "
                    f"to '{sample.question[:80]}'"
                ),
                "evaluation_scores": {
                    "overall_score": eval_result.overall_score,
                    "faithfulness_score": eval_result.faithfulness_score,
                    "hallucination_risk_score": eval_result.hallucination_risk_score,
                    "decision": eval_result.decision,
                    "issues": eval_result.issues,
                },
            },
        )

    # --- Turns exhausted: run a final evaluation to record the terminal state ---
    with log_agent_run(
        db,
        project_id,
        "QualityEvaluatorAgent",
        f"Negotiation final evaluation after {max_turns} turns for sample {sample.id}",
    ) as final_eval_logger:
        final_eval_result, _ = evaluator.evaluate(
            sample,
            existing_questions=existing_questions,
        )
        final_eval_logger.update(
            decision_summary=(
                f"Final evaluation after {max_turns} turns: "
                f"{final_eval_result.decision}, score={final_eval_result.overall_score:.2f}"
            ),
            output_json={
                "sample_id": sample.id,
                "decision": final_eval_result.decision,
                "overall_score": final_eval_result.overall_score,
                "turns_exhausted": True,
            },
            confidence_score=final_eval_result.overall_score,
        )

    last_eval = final_eval_result

    # Force human review since we've exhausted turns
    sample.status = SampleStatus.HUMAN_REVIEW
    db.commit()

    log_workflow_event(
        db,
        project_id,
        "negotiation_turn",
        (
            f"Negotiation exhausted {max_turns} turns for sample {sample.id}. "
            f"Routing to human review."
        ),
        metadata={
            "turn": max_turns,
            "turns_exhausted": True,
            "critic_message": None,
            "generator_response_summary": None,
            "evaluation_scores": {
                "overall_score": final_eval_result.overall_score,
                "decision": final_eval_result.decision,
            },
        },
    )

    return last_eval
