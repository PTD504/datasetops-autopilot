import pytest
from fastapi.testclient import TestClient
from backend.main import app
import time
import os
import shutil
import io
from backend.core.database import Base, engine
from backend.core.config import settings

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
        content = b"""
        # Refund Policy

        Customers can request a refund within 14 days when the product is defective,
        damaged during shipping, or not as described. Refund requests require the
        order number and photos of the issue.
        """
        response = client.post(
            f"/api/projects/{project_id}/documents",
            files={"file": ("refund_policy.md", io.BytesIO(content), "text/markdown")},
        )
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

        # Wait for generation to finish (should stop at WAITING_FOR_SAMPLE_REVIEW)
        for _ in range(20):
            resp = client.get(f"/api/projects/{project_id}/status")
            if resp.json()["workflow_state"] == "WAITING_FOR_SAMPLE_REVIEW":
                break
            time.sleep(1)

        assert client.get(f"/api/projects/{project_id}/status").json()["workflow_state"] == "WAITING_FOR_SAMPLE_REVIEW"

        # Call the new approve-and-export endpoint to finalize sample review and build export package
        response = client.post(f"/api/projects/{project_id}/samples/approve-and-export")
        assert response.status_code == 200

        # Confirm the project state is now EXPORT_READY
        assert client.get(f"/api/projects/{project_id}/status").json()["workflow_state"] == "EXPORT_READY"

        # 5. Check samples were generated
        response = client.get(f"/api/projects/{project_id}/samples")
        assert response.status_code == 200
        samples = response.json()
        assert len(samples) > 0

        # 6. Check export files exist (local fallback)
        export_dir = os.path.join(settings.EXPORTS_DIR, project_id)
        assert os.path.exists(os.path.join(export_dir, "dataset_card.md"))
        assert os.path.exists(os.path.join(export_dir, "quality_report.md"))
        assert os.path.exists(os.path.join(export_dir, "rag_eval.jsonl"))
        assert os.path.exists(os.path.join(export_dir, "answer_key.jsonl"))
        assert os.path.exists(os.path.join(export_dir, "export.zip"))

        with open(os.path.join(export_dir, "rag_eval.jsonl"), "r") as f:
            lines = f.readlines()
            assert len(lines) > 0
            import json
            first_sample = json.loads(lines[0])
            assert "sample_type" in first_sample

        # 7. Check artifacts were logged
        artifacts_resp = client.get(f"/api/projects/{project_id}/artifacts")
        assert artifacts_resp.status_code == 200
        artifacts = artifacts_resp.json()
        
        # Verify artifact types
        artifact_types = [a["artifact_type"] for a in artifacts]
        assert "source_understanding_report" in artifact_types
        assert "benchmark_plan_draft" in artifact_types
        assert "approved_benchmark_plan" in artifact_types
        assert "generated_samples_snapshot" in artifact_types
        assert "evaluation_report" in artifact_types
        assert "approved_samples_summary" in artifact_types
        assert "export_summary" in artifact_types

        # Check content_json structure for a couple of artifacts
        plan_draft = next(a for a in artifacts if a["artifact_type"] == "benchmark_plan_draft")
        assert plan_draft["content_json"]["domain"] == "RAG Evaluation"
        assert len(plan_draft["content_json"]["categories"]) > 0

        # 8. Check unified trace endpoint includes artifacts
        trace_resp = client.get(f"/api/projects/{project_id}/trace")
        assert trace_resp.status_code == 200
        trace_items = trace_resp.json()
        trace_types = [item["type"] for item in trace_items]
        assert "artifact" in trace_types
    finally:
        export_dir = os.path.join(settings.EXPORTS_DIR, project_id)
        if os.path.exists(export_dir):
            shutil.rmtree(export_dir)
        upload_dir = os.path.join(settings.UPLOADS_DIR, project_id)
        if os.path.exists(upload_dir):
            shutil.rmtree(upload_dir)
