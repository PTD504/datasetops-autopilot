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
        import time
        from backend.services.workflow_logger import log_tool_call

        start_time = time.time()
        status = "success"
        output_summary = ""

        try:
            # A simple fallback when no chunks exist
            chunks = self.db.query(Chunk).filter(Chunk.project_id == project_id).all()
            if not chunks:
                output_summary = "No chunks available in db"
                return []

            # Basic keyword scoring
            keywords = set(query.lower().split())
            scored_chunks = []
            total_kw = len(keywords)

            for chunk in chunks:
                match_count = sum(1 for kw in keywords if kw in chunk.text.lower())
                score = match_count / total_kw if total_kw > 0 else 0.0
                if score > 0:
                    scored_chunks.append((score, chunk))

            # Sort by score and take top K
            scored_chunks.sort(key=lambda x: x[0], reverse=True)

            result = []
            for score, c in scored_chunks[:top_k]:
                result.append({
                    "id": c.id,
                    "document_id": c.document_id,
                    "text": c.text,
                    "score": score
                })

            # Fallback to random/first chunks if no keyword match
            if not result and chunks:
                for c in chunks[:top_k]:
                    result.append({
                        "id": c.id,
                        "document_id": c.document_id,
                        "text": c.text,
                        "score": 0.1
                    })
            output_summary = f"Retrieved {len(result)} chunks"
            return result
        except Exception as e:
            status = "error"
            output_summary = f"Error: {str(e)}"
            raise e
        finally:
            latency_ms = int((time.time() - start_time) * 1000)
            log_tool_call(
                db=self.db,
                project_id=project_id,
                tool_name="NaiveRetriever.retrieve",
                input_summary=f"query: '{query[:100]}...', top_k: {top_k}",
                output_summary=output_summary[:200],
                status=status,
                latency_ms=latency_ms
            )

