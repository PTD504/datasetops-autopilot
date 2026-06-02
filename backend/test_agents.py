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
    summary, warnings = source_agent.run()
    assert "No documents found." in summary
    assert len(warnings) > 0

    # Test Intake Planner
    planner = IntakePlannerAgent(db, project_id)
    plan = planner.run("Make a test benchmark", summary, warnings)
    assert plan.goal == "Evaluate RAG system on test documents."
    assert plan.language == "English"

    print("Agents test passed")
    db.close()

if __name__ == "__main__":
    test_agents()
