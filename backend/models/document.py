from sqlalchemy import Column, String, ForeignKey, DateTime, Text, Integer
from sqlalchemy.orm import relationship
import uuid
import datetime
from backend.core.database import Base

try:
    from pgvector.sqlalchemy import Vector
    _VECTOR_TYPE = Vector(1536)
except ImportError:
    from sqlalchemy import PickleType
    _VECTOR_TYPE = PickleType()

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    content = Column(Text, nullable=True) # Full parsed text
    status = Column(String, default="UPLOADED") # UPLOADED, PARSED, CHUNKED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="documents")
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete-orphan")

class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(String, primary_key=True) # doc1_chunk_0001
    document_id = Column(String, ForeignKey("documents.id"))
    project_id = Column(String, ForeignKey("projects.id"))
    text = Column(Text, nullable=False)
    index = Column(Integer, nullable=False)
    embedding_vector = Column(_VECTOR_TYPE, nullable=True)

    document = relationship("Document", back_populates="chunks")
