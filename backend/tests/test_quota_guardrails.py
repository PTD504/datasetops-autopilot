from fastapi.testclient import TestClient
from backend.main import app
import os
import pytest
import shutil
from backend.core.database import SessionLocal, Base, engine
from backend.models import Project, BenchmarkPlan, Export, Sample
from backend.models.enums import SampleStatus
from backend.core.config import settings

client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup test DB tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup (tables persist for other tests but we can clear test data if needed)

def test_strict_mode_blocks_approval(monkeypatch):
    # Setup settings for strict mode
    monkeypatch.setattr("backend.api.projects.settings.BUDGET_GUARDRAIL_MODE", "strict")
    monkeypatch.setattr("backend.api.projects.settings.MAX_SAMPLES_PER_RUN", 5)

    db = SessionLocal()
    project = Project(name="Strict Test Project", benchmark_request="Test request")
    db.add(project)
    db.commit()
    db.refresh(project)

    # Add a plan requesting 30 samples (limit is 5)
    plan = BenchmarkPlan(
        project_id=project.id,
        goal="Test Goal",
        language="English",
        sample_count={"total": 30, "easy": 10, "medium": 10, "hard": 10},
        categories=["General"],
        quality_rules=["Rule 1"]
    )
    db.add(plan)
    db.commit()

    # Try to approve the plan
    response = client.post(f"/api/projects/{project.id}/plan/approve")
    assert response.status_code == 400
    assert "exceeds the maximum allowed limit" in response.json()["detail"]

    # Verify plan wasn't approved or capped
    db.refresh(plan)
    assert plan.sample_count["total"] == 30

    db.close()


def test_cap_mode_updates_plan_and_warnings(monkeypatch):
    # Setup settings for cap mode
    monkeypatch.setattr("backend.api.projects.settings.BUDGET_GUARDRAIL_MODE", "cap")
    monkeypatch.setattr("backend.api.projects.settings.MAX_SAMPLES_PER_RUN", 5)

    db = SessionLocal()
    project = Project(name="Cap Test Project", benchmark_request="Test request")
    db.add(project)
    db.commit()
    db.refresh(project)

    plan = BenchmarkPlan(
        project_id=project.id,
        goal="Test Goal",
        language="English",
        sample_count={"total": 30, "easy": 10, "medium": 10, "hard": 10},
        categories=["General"],
        quality_rules=["Rule 1"]
    )
    db.add(plan)
    db.commit()

    # Approve should succeed and apply cap
    response = client.post(f"/api/projects/{project.id}/plan/approve")
    assert response.status_code == 200

    db.refresh(plan)
    # Total capped to 5, distribution preserved/scaled
    assert plan.sample_count["total"] == 5
    assert plan.sample_count["easy"] + plan.sample_count["medium"] + plan.sample_count["hard"] == 5
    # Warning message is logged to plan
    assert any("Sample count capped" in w for w in plan.source_warnings)

    db.close()


def test_warn_mode_allows_run_with_warnings(monkeypatch):
    # Setup settings for warn mode
    monkeypatch.setattr("backend.api.projects.settings.BUDGET_GUARDRAIL_MODE", "warn")
    monkeypatch.setattr("backend.api.projects.settings.MAX_SAMPLES_PER_RUN", 5)

    db = SessionLocal()
    project = Project(name="Warn Test Project", benchmark_request="Test request")
    db.add(project)
    db.commit()
    db.refresh(project)

    plan = BenchmarkPlan(
        project_id=project.id,
        goal="Test Goal",
        language="English",
        sample_count={"total": 30, "easy": 10, "medium": 10, "hard": 10},
        categories=["General"],
        quality_rules=["Rule 1"]
    )
    db.add(plan)
    db.commit()

    response = client.post(f"/api/projects/{project.id}/plan/approve")
    assert response.status_code == 200

    db.refresh(plan)
    # Total count remains 30
    assert plan.sample_count["total"] == 30
    # Warning message is appended
    assert any("Budget Guardrail Warning" in w for w in plan.source_warnings)

    db.close()


def test_download_endpoint_returns_zip_or_error(tmp_path):
    db = SessionLocal()
    project = Project(name="Download Test Project", benchmark_request="Test request")
    db.add(project)
    db.commit()
    db.refresh(project)

    # 1. Test missing export returns 404
    response = client.get(f"/api/projects/{project.id}/export/download")
    assert response.status_code == 404
    assert "Export is not ready yet" in response.json()["detail"]

    # Create dummy export file
    export_dir = tmp_path / "exports" / project.id
    export_dir.mkdir(parents=True, exist_ok=True)
    dummy_zip = export_dir / "export.zip"
    dummy_zip.write_bytes(b"PK\x03\x04...fake zip...")

    # Create export record in DB pointing to the file
    export_record = Export(
        project_id=project.id,
        status="READY",
        file_urls={"export.zip": f"file:///{dummy_zip.as_posix()}"}
    )
    db.add(export_record)
    db.commit()

    # 2. Test valid export returns 200
    response = client.get(f"/api/projects/{project.id}/export/download")
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/zip"
    assert response.content == b"PK\x03\x04...fake zip..."

    db.close()


def test_requested_samples_count_preserved(monkeypatch):
    monkeypatch.setattr("backend.core.config.settings.QWEN_MAX_SAMPLES_PER_REAL_RUN", 1)
    monkeypatch.setattr("backend.core.config.settings.MAX_SAMPLES_PER_RUN", 50)
    monkeypatch.setattr("backend.core.config.settings.BUDGET_GUARDRAIL_MODE", "cap")

    assert settings.max_samples_per_run_limit == 50

    db = SessionLocal()
    project = Project(name="Preserve Test Project", benchmark_request="Test request")
    db.add(project)
    db.commit()
    db.refresh(project)

    plan = BenchmarkPlan(
        project_id=project.id,
        goal="Test Goal",
        language="English",
        sample_count={"total": 10, "easy": 3, "medium": 4, "hard": 3},
        categories=["General"],
        quality_rules=["Rule 1"]
    )
    db.add(plan)
    db.commit()

    response = client.post(f"/api/projects/{project.id}/plan/approve")
    assert response.status_code == 200

    db.refresh(plan)
    assert plan.sample_count["total"] == 10
    assert not any("capped" in w.lower() for w in (plan.source_warnings or []))

    db.close()


def test_generator_loops_when_batch_size_one(monkeypatch):
    monkeypatch.setattr("backend.core.config.settings.QWEN_MAX_SAMPLES_PER_REAL_RUN", 1)
    monkeypatch.setattr("backend.core.config.settings.RUN_MODE", "real_test")
    monkeypatch.setattr("backend.core.config.settings.QWEN_API_KEY", "fake-key")

    import uuid
    project_id = f"loop-test-{uuid.uuid4()}"

    db = SessionLocal()
    project = Project(id=project_id, name="Loop Test", benchmark_request="Test")
    db.add(project)
    
    plan = BenchmarkPlan(
        project_id=project_id,
        goal="Test Goal",
        language="English",
        categories=["General"]
    )
    db.add(plan)
    db.commit()

    call_count = 0
    def mock_generate_json(self_client, prompt, system_prompt):
        nonlocal call_count
        call_count += 1
        return {
            "samples": [
                {
                    "category": "General",
                    "difficulty": "medium",
                    "sample_type": "single_hop",
                    "question": f"Question {call_count}?",
                    "expected_answer": "Answer",
                    "source_chunk_ids": ["chunk_1"]
                }
            ]
        }

    from backend.wrappers.qwen_client import QwenClient
    monkeypatch.setattr(QwenClient, "generate_json", mock_generate_json)

    from backend.agents.generator import BenchmarkGeneratorAgent
    generator = BenchmarkGeneratorAgent(db, project_id)
    samples = generator.generate(plan, 5)

    assert call_count == 5
    assert len(samples) == 5
    assert samples[0].question == "Question 1?"
    assert samples[4].question == "Question 5?"
    
    # Assert difficulty distribution matches the targeted fallback (easy_count=1, medium_count=1, hard_count=3)
    assert [s.difficulty for s in samples] == ["easy", "medium", "hard", "hard", "hard"]

    db.close()
