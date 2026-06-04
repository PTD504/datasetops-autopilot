from sqlalchemy import Column, String, Text, DateTime, Enum, Boolean
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.core.database import Base
from .enums import WorkflowState

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    benchmark_request = Column(Text, nullable=False)
    workflow_state = Column(Enum(WorkflowState), default=WorkflowState.CREATED)
    cancel_requested = Column(Boolean, default=False, nullable=False)
    cancel_reason = Column(Text, nullable=True)
    cancel_requested_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    plan = relationship("BenchmarkPlan", back_populates="project", uselist=False, cascade="all, delete-orphan")
    samples = relationship("Sample", back_populates="project", cascade="all, delete-orphan")
    exports = relationship("Export", back_populates="project", cascade="all, delete-orphan")
