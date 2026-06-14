from fastapi.testclient import TestClient
from backend.main import app
import os
import pytest
from backend.core.database import SessionLocal, Base, engine
from backend.models import Project, BenchmarkPlan, Export, Sample
from backend.models.enums import SampleStatus, DecisionType, WorkflowState
from backend.models.sample import ReviewDecision

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield

def test_plan_editing_pre_generation_succeeds():
    db = SessionLocal()
    project = Project(name="Edit Plan Project", benchmark_request="Test request", workflow_state=WorkflowState.WAITING_FOR_PLAN_APPROVAL)
    db.add(project)
    db.commit()

    plan = BenchmarkPlan(
        project_id=project.id,
        goal="Original Goal",
        language="English",
        sample_count={"total": 10, "easy": 5, "medium": 3, "hard": 2},
        categories=["General"],
        quality_rules=["Rule 1"]
    )
    db.add(plan)
    db.commit()

    # Edit plan
    response = client.put(f"/api/projects/{project.id}/plan", json={
        "goal": "Updated Goal",
        "language": "Vietnamese",
        "sample_count": {"total": 5, "easy": 2, "medium": 2, "hard": 1},
        "categories": ["Updated Category"],
        "quality_rules": ["Rule 1", "Rule 2"]
    })
    assert response.status_code == 200
    data = response.json()
    assert data["goal"] == "Updated Goal"
    assert data["language"] == "Vietnamese"
    assert data["sample_count"]["total"] == 5
    assert data["categories"] == ["Updated Category"]

    db.close()


def test_plan_editing_post_generation_fails():
    db = SessionLocal()
    project = Project(name="Post Gen Plan Project", benchmark_request="Test request", workflow_state=WorkflowState.GENERATING)
    db.add(project)
    db.commit()

    plan = BenchmarkPlan(
        project_id=project.id,
        goal="Original Goal",
        language="English",
        sample_count={"total": 10, "easy": 5, "medium": 3, "hard": 2},
        categories=["General"],
        quality_rules=["Rule 1"]
    )
    db.add(plan)
    db.commit()

    # Edit plan should fail with 400
    response = client.put(f"/api/projects/{project.id}/plan", json={
        "goal": "Updated Goal",
        "language": "Vietnamese",
        "sample_count": {"total": 5, "easy": 2, "medium": 2, "hard": 1},
        "categories": ["Updated Category"],
        "quality_rules": ["Rule 1", "Rule 2"]
    })
    assert response.status_code == 400
    assert "Cannot edit plan after generation" in response.json()["detail"]

    db.close()


def test_sample_actions_and_export_rebuild(monkeypatch):
    db = SessionLocal()
    project = Project(name="Sample Action Project", benchmark_request="Test request", workflow_state=WorkflowState.EXPORT_READY)
    db.add(project)
    db.commit()

    plan = BenchmarkPlan(
        project_id=project.id,
        goal="Test Goal",
        language="English",
        sample_count={"total": 3, "easy": 1, "medium": 1, "hard": 1},
        categories=["General"]
    )
    db.add(plan)
    db.commit()

    # Create 3 samples:
    # 1. Unreviewed (should be exported)
    s1 = Sample(project_id=project.id, category="General", difficulty="easy", question="Q1", expected_answer="A1", status=SampleStatus.GENERATED)
    # 2. Approved (should be exported)
    s2 = Sample(project_id=project.id, category="General", difficulty="medium", question="Q2", expected_answer="A2", status=SampleStatus.GENERATED)
    # 3. Rejected (should be excluded)
    s3 = Sample(project_id=project.id, category="General", difficulty="hard", question="Q3", expected_answer="A3", status=SampleStatus.GENERATED)
    db.add_all([s1, s2, s3])
    db.commit()

    # Approve sample 2
    res_approve = client.post(f"/api/projects/{project.id}/samples/{s2.id}/approve")
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "APPROVED"

    # Reject sample 3
    res_reject = client.post(f"/api/projects/{project.id}/samples/{s3.id}/reject")
    assert res_reject.status_code == 200
    assert res_reject.json()["status"] == "REJECTED"

    # Edit sample 1
    res_edit = client.put(f"/api/projects/{project.id}/samples/{s1.id}", json={
        "question": "Edited Q1",
        "expected_answer": "Edited A1",
        "category": "Specific",
        "difficulty": "hard"
    })
    assert res_edit.status_code == 200
    data_edit = res_edit.json()
    assert data_edit["question"] == "Edited Q1"
    assert data_edit["expected_answer"] == "Edited A1"
    assert data_edit["category"] == "Specific"
    assert data_edit["difficulty"] == "hard"

    # Verify review decisions are created
    decisions = db.query(ReviewDecision).all()
    sample_ids_with_decisions = {d.sample_id for d in decisions}
    assert s1.id in sample_ids_with_decisions
    assert s2.id in sample_ids_with_decisions
    assert s3.id in sample_ids_with_decisions

    # Ensure rebuild export doesn't call Qwen client completions path
    qwen_called = False
    def mock_chat_completions_create(*args, **kwargs):
        nonlocal qwen_called
        qwen_called = True
        raise AssertionError("Qwen should not be called during export rebuild")

    monkeypatch.setattr("backend.wrappers.qwen_client.OpenAI", lambda **kw: type('MockClient', (), {
        'chat': type('MockChat', (), {
            'completions': type('MockCompletions', (), {'create': mock_chat_completions_create})
        })
    }))

    # Trigger export rebuild
    res_export = client.post(f"/api/projects/{project.id}/export")
    assert res_export.status_code == 200
    assert res_export.json()["status"] == "success"
    assert not qwen_called

    # Query Export DB record to read local file
    export_record = db.query(Export).filter(Export.project_id == project.id).order_by(Export.created_at.desc()).first()
    assert export_record is not None

    local_zip_url = export_record.file_urls.get("export.zip")
    assert local_zip_url.startswith("file://")
    local_zip_path = local_zip_url[7:]
    if local_zip_path.startswith("/") and len(local_zip_path) > 2 and local_zip_path[2] == ":":
        local_zip_path = local_zip_path.lstrip("/")

    # Read zip and verify contents
    import zipfile
    assert os.path.exists(local_zip_path)
    with zipfile.ZipFile(local_zip_path, 'r') as zipf:
        contents = zipf.namelist()
        assert "rag_eval.jsonl" in contents
        assert "answer_key.jsonl" in contents

        # Check content in rag_eval.jsonl
        eval_lines = zipf.read("rag_eval.jsonl").decode('utf-8').splitlines()
        assert len(eval_lines) == 2 # Only s1 (edited) and s2 (approved) are included, s3 is excluded
        
        # Verify s1 edited text is present
        assert "Edited Q1" in eval_lines[0] or "Edited Q1" in eval_lines[1]
        # Verify s3 (Q3) is absent
        assert "Q3" not in "".join(eval_lines)

    db.close()


def test_evidence_resolution_in_samples_endpoint():
    from backend.models.document import Document, Chunk
    import uuid
    db = SessionLocal()
    project = Project(name="Evidence Resolution Project", benchmark_request="Test request")
    db.add(project)
    db.commit()

    doc = Document(project_id=project.id, filename="company_policy.pdf", file_path="/mock/path/company_policy.pdf", content="Full policy text.")
    db.add(doc)
    db.commit()

    chunk_a_id = f"chunk_a_{uuid.uuid4()}"
    chunk_b_id = f"chunk_b_{uuid.uuid4()}"

    # Create chunks
    c1 = Chunk(id=chunk_a_id, document_id=doc.id, project_id=project.id, index=0, text="Paragraph about vacation policy. Very long text..." * 30) # > 1000 chars
    c2 = Chunk(id=chunk_b_id, document_id=doc.id, project_id=project.id, index=1, text="Paragraph about holiday schedule.")
    db.add_all([c1, c2])
    db.commit()

    # Create sample referencing the chunks (one existing, one missing)
    s = Sample(
        project_id=project.id,
        category="hr",
        difficulty="medium",
        question="What is the policy?",
        expected_answer="Vacation policy details.",
        source_chunk_ids=[chunk_a_id, "missing_chunk_id"] # c1 exists, missing_chunk_id is absent
    )
    db.add(s)
    db.commit()

    # Fetch via GET
    response = client.get(f"/api/projects/{project.id}/samples")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    
    sample_data = data[0]
    assert "evidence" in sample_data
    assert sample_data["evidence_unavailable"] is True # missing_chunk_id was absent
    
    evidence = sample_data["evidence"]
    assert len(evidence) == 2
    
    # First evidence (resolved chunk_a)
    assert evidence[0]["id"] == chunk_a_id
    assert evidence[0]["index"] == 0
    assert evidence[0]["document_name"] == "company_policy.pdf"
    assert len(evidence[0]["text"]) <= 1000 # capped to 1000 chars
    assert "vacation" in evidence[0]["text"]
    assert evidence[0]["evidence_unavailable"] is False
    
    # Second evidence (missing missing_chunk_id)
    assert evidence[1]["id"] == "missing_chunk_id"
    assert evidence[1]["index"] == -1
    assert evidence[1]["document_name"] == "Unknown Document"
    assert evidence[1]["evidence_unavailable"] is True

    db.close()
