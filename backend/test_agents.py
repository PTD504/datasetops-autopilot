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
        benchmark_request="Build a refund policy and shipping RAG benchmark"
    )
    report2 = result2["report"]
    assert len(report2["document_summaries"]) == 1
    assert report2["document_summaries"][0]["filename"] == "refund_policy.md"
    assert "refund policy" in report2["coverage_by_category"]
    assert "shipping policy" in report2["coverage_by_category"]
    assert report2["coverage_by_category"]["refund policy"]["coverage_level"] == "weak"
    assert report2["coverage_by_category"]["shipping policy"]["coverage_level"] == "unsupported"
    assert report2["confidence_score"] > 0.0

    # Test Intake Planner
    planner = IntakePlannerAgent(db, project_id)
    plan = planner.run("Make a test benchmark", summary, warnings)
    assert plan.goal == "Evaluate RAG system on test documents."
    assert plan.language == "English"

    print("Agents test passed")
    db.close()

if __name__ == "__main__":
    test_agents()
