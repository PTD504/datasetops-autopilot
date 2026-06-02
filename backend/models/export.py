from sqlalchemy import Column, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.core.database import Base

class Export(Base):
    __tablename__ = "exports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    status = Column(String) # GENERATING, READY, FAILED
    file_urls = Column(JSON) # e.g. {"export.zip": "url", "rag_eval.jsonl": "url"}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="exports")
