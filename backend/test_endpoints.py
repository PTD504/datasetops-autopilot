from fastapi.testclient import TestClient
from backend.main import app
import uuid
import sys
import os
import pytest
from backend.core.database import Base, engine, SessionLocal
from backend.models import Project
from backend.services.cancellation import WorkflowCancellationRequested
from backend.wrappers.qwen_client import QwenClient

# Initialize db for tests
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "1.0.0"}

def test_create_project():
    response = client.post("/api/projects/", json={
        "name": "Test Project",
        "description": "A test project",
        "benchmark_request": "Test request"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project"
    assert data["workflow_state"] == "CREATED"
    assert "id" in data

def test_get_project():
    response = client.post("/api/projects/", json={
        "name": "Test Project Get",
        "description": "A test project for get",
        "benchmark_request": "Test request"
    })
    assert response.status_code == 200
    project_id = response.json()["id"]

    response = client.get(f"/api/projects/{project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == project_id

def test_stop_unknown_project_returns_404():
    response = client.post(f"/api/projects/{uuid.uuid4()}/stop")
    assert response.status_code == 404

def test_stop_existing_project_marks_cancellation_requested():
    response = client.post("/api/projects/", json={
        "name": "Stop Test Project",
        "description": "A test project for stop",
        "benchmark_request": "Test request"
    })
    assert response.status_code == 200
    project_id = response.json()["id"]

    response = client.post(f"/api/projects/{project_id}/stop")
    assert response.status_code == 200
    data = response.json()
    assert data["project_id"] == project_id
    assert data["cancel_requested"] is True
    assert data["workflow_state"] == "CREATED"
    assert "message" in data

    status = client.get(f"/api/projects/{project_id}/status").json()
    assert status["cancel_requested"] is True
    assert status["cancel_reason"]

def test_stop_endpoint_is_idempotent():
    response = client.post("/api/projects/", json={
        "name": "Stop Idempotent Project",
        "description": "A repeated stop test",
        "benchmark_request": "Test request"
    })
    assert response.status_code == 200
    project_id = response.json()["id"]

    first = client.post(f"/api/projects/{project_id}/stop")
    second = client.post(f"/api/projects/{project_id}/stop")

    assert first.status_code == 200
    assert second.status_code == 200
    assert second.json()["cancel_requested"] is True
    assert "already requested" in second.json()["message"].lower()

def test_cancelled_project_start_is_not_reactivated():
    response = client.post("/api/projects/", json={
        "name": "Cancelled Start Project",
        "description": "A start-after-stop test",
        "benchmark_request": "Test request"
    })
    project_id = response.json()["id"]
    client.post(f"/api/projects/{project_id}/stop")

    response = client.post(f"/api/projects/{project_id}/start")
    assert response.status_code == 200
    data = response.json()
    assert data["cancel_requested"] is True
    assert "already requested" in data["message"].lower()

    status = client.get(f"/api/projects/{project_id}/status").json()
    assert status["workflow_state"] == "CREATED"
    assert status["cancel_requested"] is True

def test_usage_status_exposes_cancel_state_without_secrets():
    response = client.post("/api/projects/", json={
        "name": "Usage Stop Test Project",
        "description": "A test project for usage",
        "benchmark_request": "Test request"
    })
    project_id = response.json()["id"]
    client.post(f"/api/projects/{project_id}/stop")

    usage = client.get(f"/api/projects/{project_id}/usage")
    assert usage.status_code == 200
    data = usage.json()
    assert data["project_id"] == project_id
    assert data["cancel_requested"] is True
    assert data["budget_status"] == "stopped"
    assert "api_key" not in {key.lower() for key in data.keys()}
    assert "qwen_api_key" not in {key.lower() for key in data.keys()}

def test_cancelled_project_blocks_real_qwen_call_before_network(monkeypatch):
    db = SessionLocal()
    project = Project(
        name="Cancelled Qwen Guard Test",
        description="Cancellation should block real Qwen calls",
        benchmark_request="Test request",
        cancel_requested=True,
        cancel_reason="Stop before Qwen"
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    monkeypatch.setattr("backend.wrappers.qwen_client.settings.MOCK_LLM", False)
    monkeypatch.setattr("backend.wrappers.qwen_client.settings.QWEN_API_KEY", "dummy-test-key")

    client_under_test = QwenClient(project_id=project.id, agent_name="TestAgent", db=db)

    class FailIfCalled:
        class chat:
            class completions:
                @staticmethod
                def create(*args, **kwargs):
                    raise AssertionError("Network call path should not be reached")

    client_under_test.client = FailIfCalled()

    with pytest.raises(WorkflowCancellationRequested):
        client_under_test.generate_json("Generate a real response")

    db.close()

if __name__ == "__main__":
    test_health()
    test_create_project()
    test_get_project()
    print("API Endpoints basic tests passed")
