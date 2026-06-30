"""
Tests for the Generator-Critic Negotiation module.

Covers:
  (a) Negotiation passes on turn 1 (immediate pass from evaluator)
  (b) Negotiation passes on turn 2 (one repair turn needed)
  (c) Negotiation exhausts all turns -> sample routed to HUMAN_REVIEW
  (d) Mock mode returns a deterministic passing result
  (e) Evaluator suggesting chunk IDs causes NegotiationChunkFetcher ToolCallLog entry
"""

import uuid
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy.orm import Session

from backend.core.database import SessionLocal, engine, Base
from backend.models import Project, BenchmarkPlan, Sample, Chunk, Document
from backend.models.enums import SampleStatus
from backend.models.logging_models import WorkflowEvent, ToolCallLog
from backend.agents.negotiation import (
    CriticMessage,
    IssueType,
    Severity,
    negotiate,
    _build_critic_message,
    _infer_issue_type,
    _infer_severity,
)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

def _make_project(db: Session) -> tuple[str, BenchmarkPlan]:
    """Create a minimal project + plan and return (project_id, plan)."""
    project_id = str(uuid.uuid4())
    project = Project(
        id=project_id,
        name="Negotiation Test Project",
        benchmark_request="Test negotiation loop",
    )
    db.add(project)

    plan = BenchmarkPlan(
        project_id=project_id,
        goal="Test",
        language="English",
        categories=["general"],
    )
    db.add(plan)
    db.commit()
    return project_id, plan


def _make_sample(db: Session, project_id: str, **kwargs) -> Sample:
    """Create and persist a minimal Sample."""
    sample = Sample(
        project_id=project_id,
        category=kwargs.get("category", "general"),
        difficulty=kwargs.get("difficulty", "medium"),
        sample_type=kwargs.get("sample_type", "single_hop"),
        question=kwargs.get("question", "What is the refund policy?"),
        expected_answer=kwargs.get("expected_answer", "You can get a refund within 14 days."),
        source_chunk_ids=kwargs.get("source_chunk_ids", ["chunk_001"]),
        retry_count=0,
    )
    db.add(sample)
    db.commit()
    return sample


def _make_chunk(db: Session, project_id: str, text: str = "Some chunk text.") -> Chunk:
    doc_id = str(uuid.uuid4())
    doc = Document(
        id=doc_id,
        project_id=project_id,
        filename="test.txt",
        file_path="uploads/test.txt",
        content=text,
    )
    db.add(doc)
    chunk = Chunk(
        id=str(uuid.uuid4()),
        document_id=doc_id,
        project_id=project_id,
        text=text,
        index=0,
    )
    db.add(chunk)
    db.commit()
    return chunk


def _mock_evidence_pack():
    """Return a minimal EvidencePack-like MagicMock."""
    pack = MagicMock()
    pack.primary_chunks = [{"id": "chunk_001", "text": "Evidence text.", "score": 0.9}]
    pack.supporting_chunks = []
    return pack


def _passing_eval():
    """Return an Evaluation-like mock that represents a passing result."""
    ev = MagicMock()
    ev.decision = "pass"
    ev.overall_score = 0.92
    ev.faithfulness_score = 0.95
    ev.hallucination_risk_score = 0.05
    ev.novelty_score = 0.92
    ev.clarity_score = 0.90
    ev.difficulty_match_score = 0.88
    ev.answer_relevance_score = 0.90
    ev.issues = []
    ev.repair_instruction = ""
    return ev


def _failing_eval(repair_instruction: str = "Strengthen grounding with more evidence."):
    """Return an Evaluation-like mock that represents a repair-needed result."""
    ev = MagicMock()
    ev.decision = "repair"
    ev.overall_score = 0.65
    ev.faithfulness_score = 0.60
    ev.hallucination_risk_score = 0.15
    ev.novelty_score = 0.90
    ev.clarity_score = 0.80
    ev.difficulty_match_score = 0.80
    ev.answer_relevance_score = 0.75
    ev.issues = ["Answer is not fully grounded in the source."]
    ev.repair_instruction = repair_instruction
    return ev


# ---------------------------------------------------------------------------
# (a) Negotiation passes on turn 1
# ---------------------------------------------------------------------------

def test_negotiate_passes_on_turn_1():
    """
    When the evaluator passes on the first turn, negotiate() returns immediately
    without any repair, and logs one negotiation_turn WorkflowEvent.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        project_id, _ = _make_project(db)
        sample = _make_sample(db, project_id)
        slot = {"slot_id": "s1", "category": "general", "difficulty": "medium", "sample_type": "single_hop"}

        generator = MagicMock()
        evaluator = MagicMock()
        evaluator.evaluate.return_value = (_passing_eval(), False)

        with patch("backend.agents.negotiation.settings") as mock_settings:
            mock_settings.effective_mock_llm = False

            result = negotiate(
                    slot=slot,
                    sample=sample,
                    evidence_pack=_mock_evidence_pack(),
                    generator=generator,
                    evaluator=evaluator,
                    db=db,
                    project_id=project_id,
                    max_turns=2,
                )

        # Generator repair should never be called
        generator.repair.assert_not_called()
        # Evaluator called exactly once
        assert evaluator.evaluate.call_count == 1
        # Sample status should remain APPROVED (set by evaluator mock path through evaluate())
        # negotiation_turn event was logged
        events = db.query(WorkflowEvent).filter(
            WorkflowEvent.project_id == project_id,
            WorkflowEvent.event_type == "negotiation_turn",
        ).all()
        assert len(events) == 1
        assert events[0].event_metadata["turn"] == 1

    finally:
        db.close()


# ---------------------------------------------------------------------------
# (b) Negotiation passes on turn 2
# ---------------------------------------------------------------------------

def test_negotiate_passes_on_turn_2():
    """
    When the evaluator fails on turn 1 then passes on turn 2, negotiate()
    calls generator.repair() exactly once and logs two negotiation_turn events.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        project_id, _ = _make_project(db)
        sample = _make_sample(db, project_id)
        slot = {"slot_id": "s2", "category": "general", "difficulty": "medium", "sample_type": "single_hop"}

        generator = MagicMock()
        evaluator = MagicMock()

        # Turn 1: fail. Turn 2: pass.
        evaluator.evaluate.side_effect = [
            (_failing_eval(), True),
            (_passing_eval(), False),
        ]

        with patch("backend.agents.negotiation.settings") as mock_settings, \
             patch("backend.agents.negotiation._fetch_new_chunks_for_grounding", return_value=[]):
            mock_settings.effective_mock_llm = False

            result = negotiate(
                    slot=slot,
                    sample=sample,
                    evidence_pack=_mock_evidence_pack(),
                    generator=generator,
                    evaluator=evaluator,
                    db=db,
                    project_id=project_id,
                    max_turns=2,
                )

        # Repair called exactly once (turn 1 failure)
        assert generator.repair.call_count == 1
        # Evaluator called twice (turn 1 fail + turn 2 pass)
        assert evaluator.evaluate.call_count == 2

        # Two negotiation_turn events logged
        events = db.query(WorkflowEvent).filter(
            WorkflowEvent.project_id == project_id,
            WorkflowEvent.event_type == "negotiation_turn",
        ).order_by(WorkflowEvent.created_at).all()
        assert len(events) == 2
        assert events[0].event_metadata["turn"] == 1
        assert events[1].event_metadata["turn"] == 2
        assert events[1].event_metadata["critic_message"] is None  # pass turn has no critic msg

    finally:
        db.close()


# ---------------------------------------------------------------------------
# (c) Negotiation exhausts turns -> HUMAN_REVIEW
# ---------------------------------------------------------------------------

def test_negotiate_exhausts_turns_routes_to_human_review():
    """
    When the evaluator never passes within max_turns, sample.status is set to
    HUMAN_REVIEW and negotiate() logs a final exhausted negotiation_turn event.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        project_id, _ = _make_project(db)
        sample = _make_sample(db, project_id)
        slot = {"slot_id": "s3", "category": "general", "difficulty": "hard", "sample_type": "multi_hop"}

        generator = MagicMock()
        evaluator = MagicMock()

        # Always fail; +1 call for the final post-loop evaluation
        failing = _failing_eval()
        evaluator.evaluate.return_value = (failing, True)

        with patch("backend.agents.negotiation.settings") as mock_settings, \
             patch("backend.agents.negotiation._fetch_new_chunks_for_grounding", return_value=[]):
            mock_settings.effective_mock_llm = False

            negotiate(
                    slot=slot,
                    sample=sample,
                    evidence_pack=_mock_evidence_pack(),
                    generator=generator,
                    evaluator=evaluator,
                    db=db,
                    project_id=project_id,
                    max_turns=2,
                )

        db.refresh(sample)
        assert sample.status == SampleStatus.HUMAN_REVIEW

        # generator.repair called max_turns times
        assert generator.repair.call_count == 2

        # The last WorkflowEvent should carry turns_exhausted=True
        events = db.query(WorkflowEvent).filter(
            WorkflowEvent.project_id == project_id,
            WorkflowEvent.event_type == "negotiation_turn",
        ).order_by(WorkflowEvent.created_at).all()
        assert any(e.event_metadata.get("turns_exhausted") for e in events)

    finally:
        db.close()


# ---------------------------------------------------------------------------
# (d) Mock mode returns deterministic result
# ---------------------------------------------------------------------------

def test_negotiate_mock_mode_deterministic():
    """
    In mock mode (effective_mock_llm=True), negotiate() returns a passing
    Evaluation without calling the real evaluator or generator, and logs
    exactly one negotiation_turn WorkflowEvent with mock=True.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        project_id, _ = _make_project(db)
        sample = _make_sample(db, project_id)
        slot = {"slot_id": "mock_slot", "category": "general", "difficulty": "easy", "sample_type": "single_hop"}

        generator = MagicMock()
        evaluator = MagicMock()

        # settings fixture sets RUN_MODE=mock so effective_mock_llm is True
        # No patch needed — conftest.py already sets this for all tests.
        result = negotiate(
            slot=slot,
            sample=sample,
            evidence_pack=_mock_evidence_pack(),
            generator=generator,
            evaluator=evaluator,
            db=db,
            project_id=project_id,
            max_turns=2,
        )

        # Real agents must NOT be called
        generator.repair.assert_not_called()
        evaluator.evaluate.assert_not_called()

        # Result is a passing evaluation
        assert result.decision == "pass"
        assert result.overall_score >= 0.90

        # Sample marked approved
        db.refresh(sample)
        assert sample.status == SampleStatus.APPROVED

        # One negotiation_turn event with mock=True
        events = db.query(WorkflowEvent).filter(
            WorkflowEvent.project_id == project_id,
            WorkflowEvent.event_type == "negotiation_turn",
        ).all()
        assert len(events) == 1
        assert events[0].event_metadata.get("mock") is True

    finally:
        db.close()


# ---------------------------------------------------------------------------
# (e) Evaluator suggesting chunk IDs causes NegotiationChunkFetcher ToolCallLog
# ---------------------------------------------------------------------------

def test_negotiate_chunk_fetch_on_suggested_ids():
    """
    When the CriticMessage contains suggested_evidence_chunk_ids (weak_grounding),
    a ToolCallLog entry for NegotiationChunkFetcher must appear, and a separate
    NaiveRetriever.retrieve entry must also appear from the retriever call inside
    _build_critic_message.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        project_id, _ = _make_project(db)
        # Create a real chunk so NaiveRetriever can return it
        chunk = _make_chunk(db, project_id, text="Refund policy: 14 days money back guarantee.")
        sample = _make_sample(
            db,
            project_id,
            source_chunk_ids=["original_chunk_not_in_db"],
        )
        slot = {"slot_id": "s5", "category": "general", "difficulty": "medium", "sample_type": "single_hop"}

        generator = MagicMock()
        evaluator = MagicMock()

        # Turn 1: fail with weak_grounding-triggering scores.
        # Turn 2: pass.
        def fake_evaluate(s, *args, **kwargs):
            if s.retry_count == 0:
                return (_failing_eval("Strengthen answer with refund policy evidence."), True)
            return (_passing_eval(), False)

        evaluator.evaluate.side_effect = fake_evaluate

        with patch("backend.agents.negotiation.settings") as mock_settings:
            mock_settings.effective_mock_llm = False

            negotiate(
                    slot=slot,
                    sample=sample,
                    evidence_pack=_mock_evidence_pack(),
                    generator=generator,
                    evaluator=evaluator,
                    db=db,
                    project_id=project_id,
                    max_turns=2,
                )

        # Verify NegotiationChunkFetcher ToolCallLog entry exists
        chunk_fetcher_logs = db.query(ToolCallLog).filter(
            ToolCallLog.project_id == project_id,
            ToolCallLog.tool_name == "NegotiationChunkFetcher",
        ).all()
        assert len(chunk_fetcher_logs) >= 1, (
            "Expected at least one NegotiationChunkFetcher ToolCallLog entry"
        )

        # Verify NaiveRetriever.retrieve ToolCallLog entry exists
        retriever_logs = db.query(ToolCallLog).filter(
            ToolCallLog.project_id == project_id,
            ToolCallLog.tool_name == "NaiveRetriever.retrieve",
        ).all()
        assert len(retriever_logs) >= 1, (
            "Expected at least one NaiveRetriever.retrieve ToolCallLog entry"
        )

    finally:
        db.close()


# ---------------------------------------------------------------------------
# Unit tests for helper functions
# ---------------------------------------------------------------------------

def test_critic_message_schema():
    """CriticMessage is a valid Pydantic model with all required fields."""
    msg = CriticMessage(
        issue_type=IssueType.weak_grounding,
        severity=Severity.moderate,
        repair_instruction="Add more grounding evidence.",
        suggested_evidence_chunk_ids=["chunk_a", "chunk_b"],
        turn=1,
    )
    assert msg.issue_type == IssueType.weak_grounding
    assert msg.severity == Severity.moderate
    assert msg.suggested_evidence_chunk_ids == ["chunk_a", "chunk_b"]
    assert msg.turn == 1
    # model_dump() must be JSON-serialisable (used in WorkflowEvent.event_metadata)
    dumped = msg.model_dump()
    assert dumped["issue_type"] == "weak_grounding"
    assert dumped["severity"] == "moderate"


def test_infer_issue_type_duplicate():
    ev = MagicMock()
    ev.novelty_score = 0.10
    ev.faithfulness_score = 0.90
    ev.hallucination_risk_score = 0.05
    ev.clarity_score = 0.90
    ev.difficulty_match_score = 0.90
    assert _infer_issue_type(ev) == IssueType.duplicate


def test_infer_issue_type_hallucination():
    ev = MagicMock()
    ev.novelty_score = 0.90
    ev.faithfulness_score = 0.80
    ev.hallucination_risk_score = 0.75
    ev.clarity_score = 0.90
    ev.difficulty_match_score = 0.90
    assert _infer_issue_type(ev) == IssueType.hallucination


def test_infer_issue_type_weak_grounding():
    ev = MagicMock()
    ev.novelty_score = 0.90
    ev.faithfulness_score = 0.60
    ev.hallucination_risk_score = 0.10
    ev.clarity_score = 0.90
    ev.difficulty_match_score = 0.90
    assert _infer_issue_type(ev) == IssueType.weak_grounding


def test_infer_severity_critical():
    ev = MagicMock()
    ev.faithfulness_score = 0.40
    ev.hallucination_risk_score = 0.20
    assert _infer_severity(ev) == Severity.critical


def test_infer_severity_moderate():
    ev = MagicMock()
    ev.faithfulness_score = 0.80
    ev.hallucination_risk_score = 0.20
    assert _infer_severity(ev) == Severity.moderate
