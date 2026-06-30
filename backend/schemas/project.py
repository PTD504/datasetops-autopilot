from pydantic import BaseModel
from typing import List, Any
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    benchmark_request: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    workflow_state: str
    cancel_requested: bool = False
    cancel_reason: str | None = None
    last_error: str | None = None

    class Config:
        from_attributes = True

class ToolCallLogResponse(BaseModel):
    id: str
    project_id: str
    agent_run_id: str | None = None
    tool_name: str
    input_summary: str | None = None
    output_summary: str | None = None
    status: str
    latency_ms: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class AgentRunResponse(BaseModel):
    id: str
    project_id: str
    agent_name: str
    status: str
    input_summary: str | None = None
    decision_summary: str | None = None
    output_json: Any | None = None
    warnings: Any | None = None
    confidence_score: float | None = None
    started_at: datetime
    completed_at: datetime | None = None
    tool_calls: List[ToolCallLogResponse] = []

    class Config:
        from_attributes = True

class WorkflowEventResponse(BaseModel):
    id: str
    project_id: str
    event_type: str
    message: str
    event_metadata: Any | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class AgentArtifactResponse(BaseModel):
    id: str
    project_id: str
    agent_run_id: str | None = None
    artifact_type: str
    title: str
    summary: str | None = None
    content_json: Any | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class TraceItemResponse(BaseModel):
    type: str  # "workflow_event" | "agent_run" | "tool_call" | "artifact"
    timestamp: datetime
    data: Any
