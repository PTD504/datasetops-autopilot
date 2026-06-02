from sqlalchemy import Column, String, ForeignKey, DateTime, Text, JSON
import uuid
import datetime
from backend.core.database import Base

class Trace(Base):
    __tablename__ = "traces"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    agent_name = Column(String)
    action = Column(String)
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
