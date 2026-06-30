from backend.core.database import SessionLocal, engine, Base
from backend.models import Project, BenchmarkPlan, Sample
from backend.agents.generator import BenchmarkGeneratorAgent
from backend.agents.evaluator import QualityEvaluatorAgent
import uuid

def test_pipeline():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Gen", benchmark_request="Make a test")
    db.add(project)

    plan = BenchmarkPlan(
        project_id=project_id,
        goal="Test",
        language="English",
        categories=["general"]
    )
    db.add(plan)
    db.commit()

    generator = BenchmarkGeneratorAgent(db, project_id)
    evaluator = QualityEvaluatorAgent(db, project_id)

    # Test Generation
    samples = generator.generate(plan, 1)
    assert len(samples) == 1
    sample = samples[0]
    assert sample.question is not None

    eval_result, needs_repair = evaluator.evaluate(sample)
    assert abs(eval_result.overall_score - 0.903) < 1e-4
    assert needs_repair is False
    assert sample.status.value == "APPROVED"

    # Test bounded repair
    # Force scores low to trigger repair
    sample.retry_count = 0
    db.commit()

    # Verify novelty score default
    assert eval_result.novelty_score == 0.92

    print("Generator and Evaluator Agents test passed")
    db.close()

def test_evaluation_novelty_and_repair():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Novelty Project", benchmark_request="Make a test")
    db.add(project)

    # 1. Create one base sample
    s1 = Sample(
        id=str(uuid.uuid4()),
        project_id=project_id,
        category="refund policy",
        difficulty="hard",
        sample_type="multi_hop",
        question="Tôi có thể yêu cầu hoàn tiền trong bao lâu?",
        expected_answer="Bạn có thể yêu cầu hoàn tiền toàn bộ trong vòng 14 ngày.",
        source_chunk_ids=["chunk_1"]
    )
    db.add(s1)

    # 2. Create another sample that is similar (Jaccard similarity >= 0.82)
    s2 = Sample(
        id=str(uuid.uuid4()),
        project_id=project_id,
        category="refund policy",
        difficulty="hard",
        sample_type="multi_hop",
        question="Tôi có thể yêu cầu hoàn tiền trong bao lâu ạ?",
        expected_answer="Bạn có thể yêu cầu hoàn tiền toàn bộ trong vòng 14 ngày.",
        source_chunk_ids=["chunk_1"]
    )
    db.add(s2)
    db.commit()

    evaluator = QualityEvaluatorAgent(db, project_id)

    # Evaluate the similar sample s2
    eval_result, needs_repair = evaluator.evaluate(s2)

    # Should detect low novelty because s2 is duplicate of s1
    assert eval_result.novelty_score < 0.18
    assert eval_result.decision == "repair"
    assert needs_repair is True
    assert eval_result.repair_instruction == "Regenerate using a different user scenario and evidence angle while preserving category and difficulty."

    db.close()

def test_unanswerable_sample_passes():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Unanswerable", benchmark_request="Make a test")
    db.add(project)
    db.commit()

    from backend.models import Sample
    sample = Sample(
        project_id=project_id,
        category="general",
        difficulty="medium",
        sample_type="unanswerable",
        question="What is the speed of a hypothetical mock turtle?",
        expected_answer="Not enough information in the document.",
        source_chunk_ids=["mock_chunk"]
    )
    db.add(sample)
    db.commit()

    evaluator = QualityEvaluatorAgent(db, project_id)

    # Note: _get_mock_response will see "sample type: unanswerable" because the prompt in evaluator.py contains "Sample Type: {sample.sample_type}"
    eval_result, needs_repair = evaluator.evaluate(sample)

    assert needs_repair is False
    assert eval_result.decision == "pass"
    assert sample.status.value == "APPROVED"

    print("Unanswerable test passed")
    db.close()


def test_novelty_override_wins_over_pass():
    """
    Confirm: when the mock LLM would set decision=pass, but duplicate_score >= 0.82
    forces novelty_score < 0.18, the novelty override block takes effect and
    final decision is repair (not pass).

    The DuplicateCheckerTool sets duplicate_score via Jaccard similarity.
    We create two near-identical questions to trigger that path.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Override", benchmark_request="Test")
    db.add(project)

    # An existing sample with a question that is nearly identical to s_candidate
    existing = Sample(
        id=str(uuid.uuid4()),
        project_id=project_id,
        category="general",
        difficulty="easy",
        sample_type="single_hop",
        question="What is the refund period for standard orders?",
        expected_answer="14 days.",
        source_chunk_ids=["chunk_x"],
        retry_count=0,
    )
    db.add(existing)

    # Candidate with question that has >= 0.82 Jaccard overlap with the existing one
    s_candidate = Sample(
        id=str(uuid.uuid4()),
        project_id=project_id,
        category="general",
        difficulty="easy",
        sample_type="single_hop",
        question="What is the refund period for standard orders?",  # exact match -> score 1.0
        expected_answer="14 days.",
        source_chunk_ids=["chunk_y"],
        retry_count=0,
    )
    db.add(s_candidate)
    db.commit()

    evaluator = QualityEvaluatorAgent(db, project_id)

    # The mock LLM response will have a high overall_score and decision=pass,
    # but duplicate_score will be 1.0 (exact match) -> novelty_score = 0.0 < 0.18.
    # The novelty override must win.
    eval_result, needs_repair = evaluator.evaluate(s_candidate)

    # novelty_score must be below threshold (duplicate detected)
    assert eval_result.novelty_score < 0.18, (
        f"Expected novelty_score < 0.18, got {eval_result.novelty_score}"
    )
    # Final decision must NOT be pass — novelty override must have fired
    assert eval_result.decision in ("repair", "human_review"), (
        f"Expected repair or human_review (novelty override), got {eval_result.decision}"
    )
    # For retry_count=0 the override must choose repair specifically
    assert eval_result.decision == "repair", (
        f"Expected repair (retry_count=0), got {eval_result.decision}"
    )
    assert needs_repair is True

    db.close()



def test_evaluate_skips_db_query_when_existing_questions_provided():
    """
    Regression test for the N+1 query elimination (Fix 1).

    Contract:
      - When existing_questions is a non-None list of Sample objects, evaluate() MUST NOT
        call db.query(Sample) to fetch existing samples.
      - When existing_questions is None (standalone/test path), evaluate() MUST call
        db.query(Sample) exactly once (the fallback path).

    Why this would have failed before the fix:
      The original evaluate() unconditionally ran
        existing_samples = self.db.query(Sample).filter(...).all()
      regardless of the value of existing_questions. The branch
        `if existing_questions is not None: ...`
      did not exist, so passing existing_questions had no effect.
    """
    from unittest.mock import patch, MagicMock
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test DB Query Spy", benchmark_request="Test")
    db.add(project)

    sample = Sample(
        id=str(uuid.uuid4()),
        project_id=project_id,
        category="general",
        difficulty="easy",
        sample_type="single_hop",
        question="What is the return window?",
        expected_answer="30 days.",
        source_chunk_ids=[],
        retry_count=0,
    )
    db.add(sample)
    db.commit()

    evaluator = QualityEvaluatorAgent(db, project_id)

    # ----------------------------------------------------------------
    # Case A: existing_questions provided — db.query(Sample) must NOT fire
    # ----------------------------------------------------------------
    prebuilt = []  # empty list is still non-None — the branch must take the fast path

    # Patch db.query so we can detect if it is called with Sample as the first arg.
    original_query = db.query

    sample_query_call_count_A = 0

    def spy_query_A(*args, **kwargs):
        nonlocal sample_query_call_count_A
        if args and args[0] is Sample:
            sample_query_call_count_A += 1
        return original_query(*args, **kwargs)

    db.query = spy_query_A
    try:
        evaluator.evaluate(sample, existing_questions=prebuilt)
    finally:
        db.query = original_query

    assert sample_query_call_count_A == 0, (
        f"Expected 0 db.query(Sample) calls when existing_questions is provided, "
        f"got {sample_query_call_count_A}"
    )

    # Reset sample status so the second evaluate call starts clean
    sample.status = None
    db.commit()

    # ----------------------------------------------------------------
    # Case B: existing_questions=None — db.query(Sample) MUST fire once
    # ----------------------------------------------------------------
    sample_query_call_count_B = 0

    def spy_query_B(*args, **kwargs):
        nonlocal sample_query_call_count_B
        if args and args[0] is Sample:
            sample_query_call_count_B += 1
        return original_query(*args, **kwargs)

    db.query = spy_query_B
    try:
        evaluator.evaluate(sample, existing_questions=None)
    finally:
        db.query = original_query

    assert sample_query_call_count_B >= 1, (
        f"Expected at least 1 db.query(Sample) call when existing_questions=None, "
        f"got {sample_query_call_count_B}"
    )

    db.close()


if __name__ == "__main__":
    test_pipeline()
    test_unanswerable_sample_passes()
