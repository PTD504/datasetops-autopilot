from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Float, Boolean, Text
import uuid
import datetime
from backend.core.database import Base

class LLMUsageRecord(Base):
    __tablename__ = "llm_usage_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    run_mode = Column(String) # mock, real_test, real_full
    agent_name = Column(String)
    model = Column(String)
    input_tokens = Column(Integer, default=0)
    output_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    estimated_cost_usd = Column(Float, default=0.0)
    status = Column(String) # success, blocked, error
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
