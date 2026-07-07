from backend.core.database import SessionLocal, engine, Base
from backend.models import Project, Sample
from backend.models.document import Chunk, Document
from backend.agents.exporter import ExportReportAgent
from backend.models.enums import SampleStatus
from backend.core.config import settings
import uuid
import os
import json

def test_exporter():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(id=project_id, name="Test Export", benchmark_request="Test")
    db.add(project)

    doc_id = str(uuid.uuid4())
    doc = Document(id=doc_id, project_id=project_id, filename="test.pdf", file_path="/mock/test.pdf")
    db.add(doc)
    db.commit()

    chunk1_id = f"chunk_{uuid.uuid4()}"
    chunk2_id = f"chunk_{uuid.uuid4()}"

    c1 = Chunk(id=chunk1_id, document_id=doc_id, project_id=project_id, index=0, text="This is chunk 1 text")
    c2 = Chunk(id=chunk2_id, document_id=doc_id, project_id=project_id, index=1, text="This is chunk 2 text")
    db.add_all([c1, c2])
    db.commit()

    sample = Sample(
        project_id=project_id,
        question="Test Q",
        expected_answer="Test A",
        source_chunk_ids=[chunk2_id, chunk1_id],  # Test order preservation
        status=SampleStatus.APPROVED
    )
    db.add(sample)
    db.commit()

    exporter = ExportReportAgent(db, project_id)
    export_record = exporter.run()

    assert export_record.status == "READY"
    assert "export.zip" in export_record.file_urls

    eval_path = os.path.join(settings.EXPORTS_DIR, project_id, "rag_eval.jsonl")
    assert os.path.exists(eval_path)

    with open(eval_path, "r") as f:
        lines = f.readlines()
    assert len(lines) == 1
    data = json.loads(lines[0])

    assert data["source_chunk_ids"] == [chunk2_id, chunk1_id]
    assert "evidence" in data
    assert data["evidence"] == [
        {"chunk_id": chunk2_id, "text": "This is chunk 2 text"},
        {"chunk_id": "chunk_a_" if False else chunk1_id, "text": "This is chunk 1 text"}
    ]

    print("Exporter test passed")
    db.close()

if __name__ == "__main__":
    test_exporter()
