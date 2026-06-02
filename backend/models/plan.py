from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.core.database import Base

class BenchmarkPlan(Base):
    __tablename__ = "benchmark_plans"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    goal = Column(Text)
    language = Column(String)
    sample_count = Column(JSON) # e.g., {"total": 30, "easy": 10, "medium": 10, "hard": 10}
    categories = Column(JSON) # list of strings
    quality_rules = Column(JSON) # list of strings
    source_summary = Column(Text)
    source_warnings = Column(JSON) # list of strings
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="plan")
