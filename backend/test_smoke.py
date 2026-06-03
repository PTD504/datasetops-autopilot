import pytest
from fastapi.testclient import TestClient
from backend.main import app
import time
import os
import shutil
from backend.core.database import Base, engine

# Initialize db for tests
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_full_mock_workflow():
    # 1. Create project
    response = client.post("/api/projects/", json={
        "name": "Smoke Test Project",
        "description": "E2E Mock Workflow Test",
        "benchmark_request": "Build a Vietnamese RAG benchmark to evaluate whether a customer support chatbot can answer refund, shipping, warranty, cancellation, and payment questions."
    })
    assert response.status_code == 200
    project_id = response.json()["id"]

    try:
        # 2. Upload doc
        import os
        base_path = os.path.dirname(os.path.dirname(__file__))
        file_path = os.path.join(base_path, "examples", "vietnamese-ecommerce-policy", "refund_policy.md")
        with open(file_path, "rb") as f:
            response = client.post(f"/api/projects/{project_id}/documents", files={"file": ("refund_policy.md", f, "text/markdown")})
        assert response.status_code == 200

        # 3. Start workflow
        response = client.post(f"/api/projects/{project_id}/start")
        assert response.status_code == 200

        # Wait for planning to finish
        max_retries = 10
        for _ in range(max_retries):
            resp = client.get(f"/api/projects/{project_id}/status")
            if resp.json()["workflow_state"] == "WAITING_FOR_PLAN_APPROVAL":
                break
            time.sleep(1)

        assert client.get(f"/api/projects/{project_id}/status").json()["workflow_state"] == "WAITING_FOR_PLAN_APPROVAL"

        # 4. Approve plan
        response = client.post(f"/api/projects/{project_id}/plan/approve")
        assert response.status_code == 200

        # Wait for generation to finish and export
        for _ in range(20):
            resp = client.get(f"/api/projects/{project_id}/status")
            if resp.json()["workflow_state"] == "EXPORT_READY":
                break
            time.sleep(1)

        assert client.get(f"/api/projects/{project_id}/status").json()["workflow_state"] == "EXPORT_READY"

        # 5. Check samples were generated
        response = client.get(f"/api/projects/{project_id}/samples")
        assert response.status_code == 200
        samples = response.json()
        assert len(samples) > 0

        # 6. Check export files exist (local fallback)
        export_dir = f"backend/exports/{project_id}"
        assert os.path.exists(os.path.join(export_dir, "dataset_card.md"))
        assert os.path.exists(os.path.join(export_dir, "quality_report.md"))
        assert os.path.exists(os.path.join(export_dir, "rag_eval.jsonl"))
        assert os.path.exists(os.path.join(export_dir, "answer_key.jsonl"))
        assert os.path.exists(os.path.join(export_dir, "export.zip"))
    finally:
        export_dir = f"backend/exports/{project_id}"
        if os.path.exists(export_dir):
            shutil.rmtree(export_dir)
        upload_dir = f"backend/uploads/{project_id}"
        if os.path.exists(upload_dir):
            shutil.rmtree(upload_dir)
