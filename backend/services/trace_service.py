from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.models import Trace
from backend.models.logging_models import AgentRun, ToolCallLog, WorkflowEvent, AgentArtifact

def get_traces(db: Session, project_id: str) -> List[Dict[str, Any]]:
    """Retrieve all trace entities for a project ordered by creation time."""
    traces = db.query(Trace).filter(Trace.project_id == project_id).order_by(Trace.created_at.asc()).all()
    return [{
        "id": t.id,
        "agent_name": t.agent_name,
        "action": t.action,
        "details": t.details,
        "created_at": t.created_at
    } for t in traces]

def get_combined_trace(db: Session, project_id: str) -> List[Dict[str, Any]]:
    """Compile and sort workflow events, agent runs, tool calls, and artifacts in chronological order."""
    events = db.query(WorkflowEvent).filter(WorkflowEvent.project_id == project_id).all()
    runs = db.query(AgentRun).filter(AgentRun.project_id == project_id).all()
    tool_calls = db.query(ToolCallLog).filter(ToolCallLog.project_id == project_id).all()
    artifacts = db.query(AgentArtifact).filter(AgentArtifact.project_id == project_id).all()

    items = []

    for event in events:
        items.append({
            "type": "workflow_event",
            "timestamp": event.created_at,
            "data": {
                "id": event.id,
                "project_id": event.project_id,
                "event_type": event.event_type,
                "message": event.message,
                "event_metadata": event.event_metadata,
                "created_at": event.created_at
            }
        })

    for run in runs:
        items.append({
            "type": "agent_run",
            "timestamp": run.started_at,
            "data": {
                "id": run.id,
                "project_id": run.project_id,
                "agent_name": run.agent_name,
                "status": run.status,
                "input_summary": run.input_summary,
                "decision_summary": run.decision_summary,
                "output_json": run.output_json,
                "warnings": run.warnings,
                "confidence_score": run.confidence_score,
                "started_at": run.started_at,
                "completed_at": run.completed_at
            }
        })

    for tc in tool_calls:
        items.append({
            "type": "tool_call",
            "timestamp": tc.created_at,
            "data": {
                "id": tc.id,
                "project_id": tc.project_id,
                "agent_run_id": tc.agent_run_id,
                "tool_name": tc.tool_name,
                "input_summary": tc.input_summary,
                "output_summary": tc.output_summary,
                "status": tc.status,
                "latency_ms": tc.latency_ms,
                "created_at": tc.created_at
            }
        })

    for art in artifacts:
        items.append({
            "type": "artifact",
            "timestamp": art.created_at,
            "data": {
                "id": art.id,
                "project_id": art.project_id,
                "agent_run_id": art.agent_run_id,
                "artifact_type": art.artifact_type,
                "title": art.title,
                "summary": art.summary,
                "content_json": art.content_json,
                "created_at": art.created_at
            }
        })

    items.sort(key=lambda x: x["timestamp"])
    return items
