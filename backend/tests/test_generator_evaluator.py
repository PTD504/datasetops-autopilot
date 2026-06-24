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

if __name__ == "__main__":
    test_pipeline()
    test_unanswerable_sample_passes()
