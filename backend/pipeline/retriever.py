from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.models import Chunk

class NaiveRetriever:
    def __init__(self, db: Session):
        self.db = db

    def retrieve(self, project_id: str, query: str, top_k: int = 5) -> List[Dict]:
        """
        Naive keyword-based retrieval.
        For MVP, retrieves chunks that contain any of the keywords in the query.
        """
        # A simple fallback when no chunks exist
        chunks = self.db.query(Chunk).filter(Chunk.project_id == project_id).all()
        if not chunks:
            return []

        # Basic keyword scoring
        keywords = set(query.lower().split())
        scored_chunks = []

        for chunk in chunks:
            score = sum(1 for kw in keywords if kw in chunk.text.lower())
            if score > 0:
                scored_chunks.append((score, chunk))

        # Sort by score and take top K
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        top_chunks = [c[1] for c in scored_chunks[:top_k]]

        # Fallback to random/first chunks if no keyword match
        if not top_chunks and chunks:
            top_chunks = chunks[:top_k]

        return [
            {
                "id": c.id,
                "document_id": c.document_id,
                "text": c.text
            }
            for c in top_chunks
        ]
