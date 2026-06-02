from typing import Dict, Any, Tuple, List
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import Chunk, Document

class SourceUnderstandingAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id)
        self.purpose = "Analyze parsed source documents and provide a summary and warnings."

    def run(self) -> Tuple[str, List[str]]:
        self._log_trace("start_source_analysis", {})

        # In a real app, this might query all documents or sample them.
        # For MVP, we'll just check if documents exist and provide a basic summary.
        docs = self.db.query(Document).filter(Document.project_id == self.project_id).all()
        chunks = self.db.query(Chunk).filter(Chunk.project_id == self.project_id).all()

        if not docs:
            return "No documents found.", ["No documents uploaded."]

        summary = f"Analyzed {len(docs)} documents containing {len(chunks)} chunks."
        warnings = []

        if len(chunks) < 5:
            warnings.append("Very few chunks available. Benchmark diversity may be low.")

        self._log_trace("source_analysis_complete", {"summary": summary, "warnings": warnings})
        return summary, warnings
