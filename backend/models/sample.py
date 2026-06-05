from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON, Enum, Integer, Float
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.core.database import Base
from .enums import SampleStatus, DecisionType

class Sample(Base):
    __tablename__ = "samples"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    category = Column(String)
    difficulty = Column(String)
    sample_type = Column(String, default="single_hop")
    question = Column(Text, nullable=False)
    expected_answer = Column(Text, nullable=False)
    source_chunk_ids = Column(JSON) # list of string IDs
    status = Column(Enum(SampleStatus), default=SampleStatus.GENERATED)
    retry_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="samples")
    evaluations = relationship("Evaluation", back_populates="sample", cascade="all, delete-orphan")
    review_decisions = relationship("ReviewDecision", back_populates="sample", cascade="all, delete-orphan")

class Evaluation(Base):
    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"))
    grounding_score = Column(Float)
    answerability_score = Column(Float)
    clarity_score = Column(Float)
    difficulty_score = Column(Float)
    language_score = Column(Float)
    overall_score = Column(Float)
    decision = Column(String) # pass, repair, human_review, reject
    issues = Column(JSON)
    evaluator_notes = Column(Text)
    repair_instruction = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sample = relationship("Sample", back_populates="evaluations")

class ReviewDecision(Base):
    __tablename__ = "review_decisions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sample_id = Column(String, ForeignKey("samples.id"))
    decision = Column(Enum(DecisionType))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    sample = relationship("Sample", back_populates="review_decisions")
