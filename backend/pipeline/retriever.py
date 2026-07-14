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


class SemanticRetriever:
    """Cosine-similarity retrieval using pgvector stored embeddings.

    Falls back to NaiveRetriever keyword scoring when:
    - mock mode is active (settings.effective_mock_llm or no API key), or
    - pgvector is not available (e.g. SQLite in tests).

    retrieve() is intentionally sync so that all existing call sites
    (generator.py, tools) remain unchanged.
    """

    def __init__(self, db: Session):
        self.db = db
        self._naive = NaiveRetriever(db)

    def _is_mock(self) -> bool:
        from backend.core.config import settings
        return settings.effective_mock_llm or not settings.QWEN_API_KEY

    def _pgvector_available(self) -> bool:
        try:
            from pgvector.sqlalchemy import Vector  # noqa: F401
            return True
        except ImportError:
            return False

    def _embed_query(self, query: str) -> List[float]:
        """Call DashScope synchronously to embed a single query string."""
        from backend.core.config import settings
        from openai import OpenAI
        from backend.pipeline.embedder import EMBEDDING_MODEL

        client = OpenAI(
            api_key=settings.QWEN_API_KEY,
            base_url=settings.QWEN_BASE_URL,
        )
        response = client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=[query],
        )
        return response.data[0].embedding

    async def _embed_query_async(self, query: str) -> List[float]:
        """Call DashScope asynchronously to embed a single query string."""
        from backend.core.config import settings
        from openai import AsyncOpenAI
        from backend.pipeline.embedder import EMBEDDING_MODEL

        client = AsyncOpenAI(
            api_key=settings.QWEN_API_KEY,
            base_url=settings.QWEN_BASE_URL,
        )
        response = await client.embeddings.create(
            model=EMBEDDING_MODEL,
            input=[query],
        )
        return response.data[0].embedding

    def retrieve(self, project_id: str, query: str, top_k: int = 10) -> List[Dict]:
        """Return top_k chunks most semantically similar to query.

        In mock mode or when pgvector is unavailable, delegates to NaiveRetriever.
        In real mode, embeds the query and runs a pgvector cosine distance query.
        """
        import time
        from backend.services.workflow_logger import log_tool_call

        start_time = time.time()
        status = "success"
        output_summary = ""

        try:
            if self._is_mock() or not self._pgvector_available():
                result = self._naive.retrieve(project_id, query, top_k)
                output_summary = f"Fallback to NaiveRetriever: {len(result)} chunks"
                return result

            # Check whether any embeddings exist; fall back if none do.
            sample = (
                self.db.query(Chunk)
                .filter(Chunk.project_id == project_id)
                .filter(Chunk.embedding_vector.isnot(None))
                .first()
            )
            if sample is None:
                result = self._naive.retrieve(project_id, query, top_k)
                output_summary = f"No vectors stored; fallback to NaiveRetriever: {len(result)} chunks"
                return result

            query_vector = self._embed_query(query)

            from pgvector.sqlalchemy import Vector
            from sqlalchemy import cast
            from sqlalchemy import func
            from backend.core.config import settings

            # <=> is pgvector cosine distance (0 = identical, 2 = opposite).
            cosine_distance = Chunk.embedding_vector.cosine_distance(
                cast(query_vector, Vector(settings.QWEN_EMBEDDING_DIM))
            )
            rows = (
                self.db.query(Chunk, cosine_distance.label("distance"))
                .filter(Chunk.project_id == project_id)
                .filter(Chunk.embedding_vector.isnot(None))
                .order_by(cosine_distance)
                .limit(top_k)
                .all()
            )

            result = []
            for chunk, distance in rows:
                result.append({
                    "id": chunk.id,
                    "document_id": chunk.document_id,
                    "text": chunk.text,
                    "score": round(1.0 - float(distance), 4),  # convert distance to similarity
                })
            output_summary = f"Semantic retrieval: {len(result)} chunks"
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
                tool_name="SemanticRetriever.retrieve",
                input_summary=f"query: '{query[:100]}', top_k: {top_k}",
                output_summary=output_summary[:200],
                status=status,
                latency_ms=latency_ms
            )

    async def retrieve_async(self, project_id: str, query: str, top_k: int = 10) -> List[Dict]:
        """Return top_k chunks most semantically similar to query asynchronously.

        In mock mode or when pgvector is unavailable, delegates to NaiveRetriever.
        In real mode, embeds the query asynchronously and runs a pgvector cosine distance query.
        """
        import time
        from backend.services.workflow_logger import log_tool_call

        start_time = time.time()
        status = "success"
        output_summary = ""

        try:
            if self._is_mock() or not self._pgvector_available():
                result = self._naive.retrieve(project_id, query, top_k)
                output_summary = f"Fallback to NaiveRetriever: {len(result)} chunks"
                return result

            # Check whether any embeddings exist; fall back if none do.
            sample = (
                self.db.query(Chunk)
                .filter(Chunk.project_id == project_id)
                .filter(Chunk.embedding_vector.isnot(None))
                .first()
            )
            if sample is None:
                result = self._naive.retrieve(project_id, query, top_k)
                output_summary = f"No vectors stored; fallback to NaiveRetriever: {len(result)} chunks"
                return result

            query_vector = await self._embed_query_async(query)

            from pgvector.sqlalchemy import Vector
            from sqlalchemy import cast
            from sqlalchemy import func
            from backend.core.config import settings

            # <=> is pgvector cosine distance (0 = identical, 2 = opposite).
            cosine_distance = Chunk.embedding_vector.cosine_distance(
                cast(query_vector, Vector(settings.QWEN_EMBEDDING_DIM))
            )
            rows = (
                self.db.query(Chunk, cosine_distance.label("distance"))
                .filter(Chunk.project_id == project_id)
                .filter(Chunk.embedding_vector.isnot(None))
                .order_by(cosine_distance)
                .limit(top_k)
                .all()
            )

            result = []
            for chunk, distance in rows:
                result.append({
                    "id": chunk.id,
                    "document_id": chunk.document_id,
                    "text": chunk.text,
                    "score": round(1.0 - float(distance), 4),  # convert distance to similarity
                })
            output_summary = f"Semantic retrieval: {len(result)} chunks"
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
                tool_name="SemanticRetriever.retrieve_async",
                input_summary=f"query: '{query[:100]}', top_k: {top_k}",
                output_summary=output_summary[:200],
                status=status,
                latency_ms=latency_ms
            )
