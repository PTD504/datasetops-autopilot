from backend.core.database import SessionLocal, engine, Base
from backend.models import Project, Sample
from backend.agents.exporter import ExportReportAgent
from backend.models.enums import SampleStatus
import uuid
import os

def test_exporter():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Export", benchmark_request="Test")
    db.add(project)

    sample = Sample(
        project_id=project_id,
        question="Test Q",
        expected_answer="Test A",
        status=SampleStatus.APPROVED
    )
    db.add(sample)
    db.commit()

    exporter = ExportReportAgent(db, project_id)
    export_record = exporter.run()

    assert export_record.status == "READY"
    assert "export.zip" in export_record.file_urls

    print("Exporter test passed")
    db.close()

if __name__ == "__main__":
    test_exporter()
