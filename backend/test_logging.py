import pytest
from fastapi.testclient import TestClient
from backend.main import app
import time
import os
import shutil
import io
from backend.core.database import Base, engine, SessionLocal
from backend.models.logging_models import AgentRun, ToolCallLog, WorkflowEvent
from backend.models.project import Project

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_logging_models_and_endpoints():
    db = SessionLocal()
    try:
        # 1. Create a test project
        project = Project(
            name="Logging Test Project",
            description="Testing logging endpoints",
            benchmark_request="Create benchmark plan"
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        project_id = project.id

        # 2. Insert dummy logs
        event = WorkflowEvent(
            project_id=project_id,
            event_type="test_event",
            message="Test workflow event message",
            event_metadata={"key": "val"}
        )
        db.add(event)
        
        run = AgentRun(
            project_id=project_id,
            agent_name="TestAgent",
            status="completed",
            input_summary="Test input",
            decision_summary="Test decision",
            output_json={"out": "json"},
            warnings=["warning 1"],
            confidence_score=0.95
        )
        db.add(run)
        db.commit()
        db.refresh(run)

        tool_call = ToolCallLog(
            project_id=project_id,
            agent_run_id=run.id,
            tool_name="TestTool",
            input_summary="Tool input",
            output_summary="Tool output",
            status="success",
            latency_ms=120
        )
        db.add(tool_call)
        db.commit()

        # 3. Test GET /api/projects/{project_id}/agent-runs
        resp = client.get(f"/api/projects/{project_id}/agent-runs")
        assert resp.status_code == 200
        runs_data = resp.json()
        assert len(runs_data) >= 1
        assert runs_data[0]["agent_name"] == "TestAgent"
        assert len(runs_data[0]["tool_calls"]) == 1
        assert runs_data[0]["tool_calls"][0]["tool_name"] == "TestTool"

        # 4. Test GET /api/projects/{project_id}/workflow-events
        resp = client.get(f"/api/projects/{project_id}/workflow-events")
        assert resp.status_code == 200
        events_data = resp.json()
        assert len(events_data) >= 1
        assert events_data[0]["event_type"] == "test_event"

        # 5. Test GET /api/projects/{project_id}/trace
        resp = client.get(f"/api/projects/{project_id}/trace")
        assert resp.status_code == 200
        trace_data = resp.json()
        assert len(trace_data) >= 3
        # Check that we have different types of events returned chronologically
        types = [item["type"] for item in trace_data]
        assert "workflow_event" in types
        assert "agent_run" in types
        assert "tool_call" in types

    finally:
        db.close()

def test_integration_workflow_logging():
    # Verify that running a part of the mock workflow triggers automatic logging
    response = client.post("/api/projects/", json={
        "name": "Integration Logging Project",
        "description": "Integration logging test",
        "benchmark_request": "Build benchmark plan"
    })
    assert response.status_code == 200
    project_id = response.json()["id"]

    try:
        content = b"Mock document content for integration test."
        response = client.post(
            f"/api/projects/{project_id}/documents",
            files={"file": ("test_doc.md", io.BytesIO(content), "text/markdown")},
        )
        assert response.status_code == 200

        # Start workflow
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

        # Fetch workflow events
        resp = client.get(f"/api/projects/{project_id}/workflow-events")
        assert resp.status_code == 200
        events = resp.json()
        event_types = [e["event_type"] for e in events]
        assert "workflow_started" in event_types
        assert "chunking_started" in event_types
        assert "chunking_completed" in event_types
        assert "source_analysis_started" in event_types
        assert "planning_started" in event_types
        assert "plan_ready" in event_types

        # Fetch agent runs
        resp = client.get(f"/api/projects/{project_id}/agent-runs")
        assert resp.status_code == 200
        runs = resp.json()
        agent_names = [r["agent_name"] for r in runs]
        assert "SourceUnderstandingAgent" in agent_names
        assert "IntakePlannerAgent" in agent_names

        # Fetch combined trace
        resp = client.get(f"/api/projects/{project_id}/trace")
        assert resp.status_code == 200
        trace = resp.json()
        assert len(trace) > 0

    finally:
        export_dir = f"backend/exports/{project_id}"
        if os.path.exists(export_dir):
            shutil.rmtree(export_dir)
        upload_dir = f"backend/uploads/{project_id}"
        if os.path.exists(upload_dir):
            shutil.rmtree(upload_dir)
