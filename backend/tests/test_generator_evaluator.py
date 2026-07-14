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


def test_unanswerable_decision_routing_regression():
    from unittest.mock import MagicMock
    from backend.models.enums import SampleStatus

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Unanswerable Routing", benchmark_request="Make a test")
    db.add(project)
    db.commit()

    evaluator = QualityEvaluatorAgent(db, project_id)

    # 1. Valid unanswerable sample with high faithfulness but hallucination_risk_score = 1.0 -> APPROVED
    sample_approved = Sample(
        project_id=project_id,
        category="general",
        difficulty="medium",
        sample_type="unanswerable",
        question="What is X?",
        expected_answer="Not enough information in the document.",
        source_chunk_ids=["chunk_1"]
    )
    db.add(sample_approved)
    db.commit()

    evaluator.llm.generate_json = MagicMock(return_value={
        "faithfulness_score": 1.0,
        "answer_relevance_score": 1.0,
        "context_precision_score": 1.0,
        "context_recall_score": 0.0,
        "hallucination_risk_score": 1.0,  # High hallucination risk, but faithfulness is high
        "answerability_score": 0.0,
        "clarity_score": 1.0,
        "difficulty_match_score": 1.0,
        "overall_score": 0.85,
        "novelty_score": 1.0,
        "decision": "reject", # Evaluator code should ignore LLM JSON's decision field and compute it programmatically
        "issues": [],
        "evaluator_notes": "Perfect refusal.",
        "repair_instruction": ""
    })

    eval_result, needs_repair = evaluator.evaluate(sample_approved, existing_questions=[])
    assert needs_repair is False
    assert eval_result.decision == "pass"
    assert sample_approved.status == SampleStatus.APPROVED

    # 2. Unanswerable sample with fabricated expected answer -> REJECTED
    # Fabricated answer means low faithfulness (e.g. 0.40)
    sample_fabricated = Sample(
        project_id=project_id,
        category="general",
        difficulty="medium",
        sample_type="unanswerable",
        question="What is Y?",
        expected_answer="Y is a fictional object.", # Fabricated answer
        source_chunk_ids=["chunk_1"]
    )
    db.add(sample_fabricated)
    db.commit()

    evaluator.llm.generate_json = MagicMock(return_value={
        "faithfulness_score": 0.40,  # Low faithfulness
        "answer_relevance_score": 0.5,
        "context_precision_score": 0.5,
        "context_recall_score": 0.0,
        "hallucination_risk_score": 0.6,
        "answerability_score": 0.0,
        "clarity_score": 1.0,
        "difficulty_match_score": 1.0,
        "overall_score": 0.50,
        "novelty_score": 1.0,
        "decision": "reject",
        "issues": ["Fabricated information."],
        "evaluator_notes": "Fabricated.",
        "repair_instruction": ""
    })

    eval_result, needs_repair = evaluator.evaluate(sample_fabricated, existing_questions=[])
    assert needs_repair is False
    assert eval_result.decision == "reject"
    assert sample_fabricated.status == SampleStatus.REJECTED

    # 3. Borderline unanswerable sample: repair path (retry_count < 2)
    sample_borderline_repair = Sample(
        project_id=project_id,
        category="general",
        difficulty="medium",
        sample_type="unanswerable",
        question="What is Z?",
        expected_answer="Borderline answer.",
        source_chunk_ids=["chunk_1"],
        retry_count=0
    )
    db.add(sample_borderline_repair)
    db.commit()

    evaluator.llm.generate_json = MagicMock(return_value={
        "faithfulness_score": 0.70,  # Borderline (0.50 <= 0.70 < 0.85)
        "answer_relevance_score": 0.70,
        "context_precision_score": 0.70,
        "context_recall_score": 0.0,
        "hallucination_risk_score": 0.20,
        "answerability_score": 0.0,
        "clarity_score": 0.90,
        "difficulty_match_score": 1.0,
        "overall_score": 0.75,
        "novelty_score": 1.0,
        "decision": "repair",
        "issues": ["Clarity can be improved."],
        "evaluator_notes": "Needs repair.",
        "repair_instruction": "Improve clarity."
    })

    eval_result, needs_repair = evaluator.evaluate(sample_borderline_repair, existing_questions=[])
    assert needs_repair is True
    assert eval_result.decision == "repair"
    assert sample_borderline_repair.status == SampleStatus.REPAIRING

    # 4. Borderline unanswerable sample: human_review path (retry_count >= 2)
    sample_borderline_review = Sample(
        project_id=project_id,
        category="general",
        difficulty="medium",
        sample_type="unanswerable",
        question="What is W?",
        expected_answer="Another borderline answer.",
        source_chunk_ids=["chunk_1"],
        retry_count=2
    )
    db.add(sample_borderline_review)
    db.commit()

    evaluator.llm.generate_json = MagicMock(return_value={
        "faithfulness_score": 0.70,  # Borderline (0.50 <= 0.70 < 0.85)
        "answer_relevance_score": 0.70,
        "context_precision_score": 0.70,
        "context_recall_score": 0.0,
        "hallucination_risk_score": 0.20,
        "answerability_score": 0.0,
        "clarity_score": 0.90,
        "difficulty_match_score": 1.0,
        "overall_score": 0.75,
        "novelty_score": 1.0,
        "decision": "human_review",
        "issues": ["Clarity can be improved."],
        "evaluator_notes": "Needs human review.",
        "repair_instruction": ""
    })

    eval_result, needs_repair = evaluator.evaluate(sample_borderline_review, existing_questions=[])
    assert needs_repair is False
    assert eval_result.decision == "human_review"
    assert sample_borderline_review.status == SampleStatus.HUMAN_REVIEW

    db.close()

def test_separate_models():
    from backend.core.config import settings
    
    # Backup original values
    orig_gen = settings.QWEN_GENERATOR_MODEL
    orig_eval = settings.QWEN_EVALUATOR_MODEL
    orig_qwen = settings.QWEN_MODEL
    
    try:
        # 1. Override the models in settings
        settings.QWEN_GENERATOR_MODEL = "qwen-generator-test-model"
        settings.QWEN_EVALUATOR_MODEL = "qwen-evaluator-test-model"
        
        # 2. Check the properties resolve correctly
        assert settings.generator_model_name == "qwen-generator-test-model"
        assert settings.evaluator_model_name == "qwen-evaluator-test-model"
        
        # 3. Instantiate the agents and check self.llm.model
        db = SessionLocal()
        project_id = str(uuid.uuid4())
        
        generator = BenchmarkGeneratorAgent(db, project_id)
        evaluator = QualityEvaluatorAgent(db, project_id)
        
        assert generator.llm.model == "qwen-generator-test-model"
        assert evaluator.llm.model == "qwen-evaluator-test-model"
        
        # 4. If we set them to None, they should fallback to settings.QWEN_MODEL
        settings.QWEN_GENERATOR_MODEL = None
        settings.QWEN_EVALUATOR_MODEL = None
        settings.QWEN_MODEL = "fallback-qwen-model"
        
        generator_fallback = BenchmarkGeneratorAgent(db, project_id)
        evaluator_fallback = QualityEvaluatorAgent(db, project_id)
        
        assert generator_fallback.llm.model == "fallback-qwen-model"
        assert evaluator_fallback.llm.model == "fallback-qwen-model"
        
        db.close()
        print("Separate models test passed")
    finally:
        # Restore original values
        settings.QWEN_GENERATOR_MODEL = orig_gen
        settings.QWEN_EVALUATOR_MODEL = orig_eval
        settings.QWEN_MODEL = orig_qwen


if __name__ == "__main__":
    test_pipeline()
    test_unanswerable_sample_passes()
    test_unanswerable_decision_routing_regression()
    test_separate_models()
