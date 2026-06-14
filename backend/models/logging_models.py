from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON, Float, Integer
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.core.database import Base

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    agent_name = Column(String, nullable=False)
    status = Column(String, nullable=False) # e.g. running, completed, failed
    input_summary = Column(Text, nullable=True)
    decision_summary = Column(Text, nullable=True)
    output_json = Column(JSON, nullable=True)
    warnings = Column(JSON, nullable=True)
    confidence_score = Column(Float, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    tool_calls = relationship("ToolCallLog", back_populates="agent_run", cascade="all, delete-orphan")

class ToolCallLog(Base):
    __tablename__ = "tool_call_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    agent_run_id = Column(String, ForeignKey("agent_runs.id"), nullable=True)
    tool_name = Column(String, nullable=False)
    input_summary = Column(Text, nullable=True)
    output_summary = Column(Text, nullable=True)
    status = Column(String, nullable=False) # success, error
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    agent_run = relationship("AgentRun", back_populates="tool_calls")

class WorkflowEvent(Base):
    __tablename__ = "workflow_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    event_type = Column(String, nullable=False) # e.g. workflow_started, chunking_completed
    message = Column(Text, nullable=False)
    event_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AgentArtifact(Base):
    __tablename__ = "agent_artifacts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    agent_run_id = Column(String, ForeignKey("agent_runs.id"), nullable=True)
    artifact_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    content_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

