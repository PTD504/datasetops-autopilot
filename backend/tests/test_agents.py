from backend.core.database import SessionLocal, engine, Base
from backend.models import Project
from backend.agents.intake_planner import IntakePlannerAgent
from backend.agents.source_understanding import SourceUnderstandingAgent
import uuid

def test_agents():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test", benchmark_request="Make a test benchmark")
    db.add(project)
    db.commit()

    # Test Source Understanding
    source_agent = SourceUnderstandingAgent(db, project_id)
    result = source_agent.run()
    summary = result["summary"]
    warnings = result["warnings"]
    report = result["report"]
    assert "No documents found." in summary
    assert len(warnings) > 0
    assert report["confidence_score"] == 0.0
    assert len(report["source_warnings"]) > 0
    assert report["document_summaries"] == []

    # Test Source Understanding with actual documents and chunks
    from backend.models import Document, Chunk
    doc_id = str(uuid.uuid4())
    doc = Document(
        id=doc_id,
        project_id=project_id,
        filename="refund_policy.md",
        file_path="uploads/refund_policy.md",
        content="Refund Policy details here."
    )
    db.add(doc)

    c1 = Chunk(id=str(uuid.uuid4()), document_id=doc_id, project_id=project_id, index=0, text="This is about the refund policy.")
    c2 = Chunk(id=str(uuid.uuid4()), document_id=doc_id, project_id=project_id, index=1, text="Unrelated text about shipping.")
    db.add(c1)
    db.add(c2)
    db.commit()

    result2 = source_agent.run(
        docs=[doc],
        chunks=[c1, c2],
        benchmark_request="Build a Vietnamese refund policy and shipping RAG benchmark"
    )
    report2 = result2["report"]
    assert len(report2["document_summaries"]) == 1
    assert report2["document_summaries"][0]["filename"] == "refund_policy.md"
    assert "refund policy" in report2["coverage_by_category"]
    assert "shipping policy" in report2["coverage_by_category"]
    assert report2["coverage_by_category"]["refund policy"]["coverage_level"] == "weak"
    assert report2["coverage_by_category"]["shipping policy"]["coverage_level"] == "unsupported"
    assert report2["confidence_score"] > 0.0

    # Test Phase 1: run_document_understanding
    doc_under_res = source_agent.run_document_understanding(docs=[doc], chunks=[c1, c2])
    assert doc_under_res["summary"] is not None
    assert len(doc_under_res["report"]["document_summaries"]) == 1
    assert "strong_sections" in doc_under_res["report"]

    # Test Phase 2: run_coverage_audit
    audit_res = source_agent.run_coverage_audit(
        chunks=[c1, c2],
        categories=["refund policy", "shipping policy"],
        doc_understanding=doc_under_res
    )
    report_audit = audit_res["report"]
    assert "refund policy" in report_audit["coverage_by_category"]
    assert "shipping policy" in report_audit["coverage_by_category"]
    assert report_audit["coverage_by_category"]["refund policy"]["coverage_level"] == "weak"
    assert report_audit["coverage_by_category"]["shipping policy"]["coverage_level"] == "unsupported"
    assert report_audit["confidence_score"] > 0.0

    # Test Intake Planner
    planner = IntakePlannerAgent(db, project_id)
    plan = planner.run("Make a test benchmark", summary, warnings)
    assert plan.goal == "Evaluate RAG system on test documents."
    assert plan.language == "English"

    # Test Intake Planner Defensive Normalization - Case 1: list[dict]
    original_generate_json = planner.llm.generate_json
    try:
        planner.llm.generate_json = lambda prompt, system_prompt=None: {
            "goal": "Test dict categories",
            "language": "English",
            "sample_count": {"total": 5, "easy": 2, "medium": 2, "hard": 1},
            "categories": [{"name": "refund policy", "coverage": "strong", "score": 0.9}],
            "quality_rules": []
        }
        source_report_case1 = {
            "coverage_by_category": {
                "refund policy": {"coverage_level": "strong", "coverage_score": 0.9}
            }
        }
        plan_case1 = planner.run("Make a test benchmark", summary, warnings, source_report=source_report_case1)
        assert plan_case1.categories == ["refund policy"]
        assert isinstance(plan_case1.categories[0], str)
    finally:
        planner.llm.generate_json = original_generate_json

    # Test Intake Planner Defensive Normalization - Case 2: mixed str and dict
    try:
        planner.llm.generate_json = lambda prompt, system_prompt=None: {
            "goal": "Test mixed categories",
            "language": "English",
            "sample_count": {"total": 5, "easy": 2, "medium": 2, "hard": 1},
            "categories": ["refund policy", {"category": "shipping policy"}, {"title": "payment policy"}],
            "quality_rules": []
        }
        source_report_case2 = {
            "coverage_by_category": {
                "refund policy": {"coverage_level": "strong", "coverage_score": 0.9},
                "shipping policy": {"coverage_level": "weak", "coverage_score": 0.3},
                "payment policy": {"coverage_level": "strong", "coverage_score": 0.8}
            }
        }
        plan_case2 = planner.run("Make a test benchmark", summary, warnings, source_report=source_report_case2)
        assert set(plan_case2.categories) == {"refund policy", "shipping policy", "payment policy"}
    finally:
        planner.llm.generate_json = original_generate_json

    # Test Intake Planner Defensive Normalization - Case 3: invalid elements (None, int)
    try:
        planner.llm.generate_json = lambda prompt, system_prompt=None: {
            "goal": "Test invalid categories",
            "language": "English",
            "sample_count": {"total": 5, "easy": 2, "medium": 2, "hard": 1},
            "categories": [None, 123, "refund policy", {"name": 456}],
            "quality_rules": []
        }
        source_report_case3 = {
            "coverage_by_category": {
                "refund policy": {"coverage_level": "strong", "coverage_score": 0.9}
            }
        }
        plan_case3 = planner.run("Make a test benchmark", summary, warnings, source_report=source_report_case3)
        assert plan_case3.categories == ["refund policy"]
    finally:
        planner.llm.generate_json = original_generate_json

    print("Agents test passed")
    db.close()

def test_category_normalization(caplog):
    import logging
    from backend.agents.utils import normalize_categories

    # Case 1: list[dict]
    res1 = normalize_categories([{"name": "Refund", "score": 0.9}])
    assert res1 == ["Refund"]

    # Case 2: Mixed str and dict, preserving order
    res2 = normalize_categories(["Refund", {"category": "Shipping"}, {"title": "Payment"}])
    assert res2 == ["Refund", "Shipping", "Payment"]

    # Case 3: Invalid elements (None, int)
    res3 = normalize_categories([None, 123, "Refund", {"invalid": 456}])
    assert res3 == ["Refund"]

    # Case 4: Entirely empty after normalization -> fallback used and log warning called
    caplog.clear()
    with caplog.at_level(logging.WARNING):
        res4 = normalize_categories([None, 123], fallback=["general", "specific"])
        assert res4 == ["general", "specific"]
        assert any("All categories were filtered out after normalization" in record.message for record in caplog.records)

    # Verify SourceUnderstandingAgent's method calls normalize_categories
    db = SessionLocal()
    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test", benchmark_request="Make a test benchmark")
    db.add(project)
    db.commit()

    try:
        source_agent = SourceUnderstandingAgent(db, project_id)
        original_generate_json = source_agent.llm.generate_json
        try:
            # list[dict]
            source_agent.llm.generate_json = lambda prompt, system_prompt=None: {
                "categories": [{"name": "Refund"}]
            }
            res_su1 = source_agent._extract_categories_from_request("Request details")
            assert res_su1 == ["Refund"]

            # Mixed
            source_agent.llm.generate_json = lambda prompt, system_prompt=None: {
                "categories": ["Refund", {"category": "Shipping"}]
            }
            res_su2 = source_agent._extract_categories_from_request("Request details")
            assert res_su2 == ["Refund", "Shipping"]

            # Invalid
            source_agent.llm.generate_json = lambda prompt, system_prompt=None: {
                "categories": [None, 123, "Refund"]
            }
            res_su3 = source_agent._extract_categories_from_request("Request details")
            assert res_su3 == ["Refund"]

            # Fallback
            source_agent.llm.generate_json = lambda prompt, system_prompt=None: {
                "categories": [None, 123]
            }
            res_su4 = source_agent._extract_categories_from_request("Request details")
            assert res_su4 == ["general", "specific"]
        finally:
            source_agent.llm.generate_json = original_generate_json
    finally:
        db.close()

if __name__ == "__main__":
    test_agents()
