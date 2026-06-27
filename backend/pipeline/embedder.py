import logging
import time
from typing import List

from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.models import Chunk
from backend.services.workflow_logger import log_workflow_event

logger = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-v3"
EMBEDDING_DIM = 1536
BATCH_SIZE = 10


def _make_mock_vector(chunk_id: str) -> List[float]:
    """Return a deterministic unit-ish float32 vector seeded by chunk_id hash.

    Uses numpy RNG seeded by a stable 31-bit integer derived from the chunk ID
    so the same chunk always receives the same vector across runs.
    """
    import numpy as np

    seed = hash(chunk_id) % (2 ** 31)
    rng = np.random.default_rng(seed=seed)
    vec = rng.random(EMBEDDING_DIM).astype("float32")
    return vec.tolist()


async def embed_chunks(project_id: str, db: Session) -> int:
    """Embed all un-embedded chunks for a project using DashScope text-embedding-v3.

    Fetches chunks where embedding_vector IS NULL, calls the embedding API in
    batches of BATCH_SIZE, persists the vectors, and logs a WorkflowEvent on
    completion.

    In mock mode no API call is made; each chunk receives a deterministic vector
    seeded by its ID so results are reproducible.

    Returns the number of chunks that were embedded.
    """
    start_time = time.time()
    use_mock = settings.effective_mock_llm or not settings.QWEN_API_KEY

    # Fetch chunks that have not yet been embedded.
    # IS NULL is valid SQL for both PostgreSQL and SQLite.
    try:
        chunks: List[Chunk] = (
            db.query(Chunk)
            .filter(Chunk.project_id == project_id)
            .filter(Chunk.embedding_vector.is_(None))
            .all()
        )
    except Exception as e:
        # On SQLite the vector column may not support IS NULL filtering; fall back.
        logger.warning(f"Could not filter by embedding_vector IS NULL: {e}. Fetching all chunks.")
        chunks = db.query(Chunk).filter(Chunk.project_id == project_id).all()

    if not chunks:
        log_workflow_event(
            db, project_id, "embedding_completed",
            "No chunks required embedding.",
            {"chunks_embedded": 0, "latency_ms": 0}
        )
        return 0

    if use_mock:
        # Mock mode: assign deterministic vectors with no API call.
        for chunk in chunks:
            chunk.embedding_vector = _make_mock_vector(chunk.id)
        db.commit()
        latency_ms = int((time.time() - start_time) * 1000)
        log_workflow_event(
            db, project_id, "embedding_completed",
            f"Mock embedding assigned to {len(chunks)} chunks in {latency_ms} ms.",
            {"chunks_embedded": len(chunks), "latency_ms": latency_ms, "mode": "mock"}
        )
        logger.info(f"Mock embedding: assigned vectors to {len(chunks)} chunks.")
        return len(chunks)

    # Real mode: call DashScope via the openai-compatible client.
    from openai import OpenAI

    client = OpenAI(
        api_key=settings.QWEN_API_KEY,
        base_url=settings.QWEN_BASE_URL,
    )

    embedded_count = 0
    for batch_start in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[batch_start: batch_start + BATCH_SIZE]
        texts = [chunk.text for chunk in batch]

        try:
            response = client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=texts,
            )
            for chunk, embedding_data in zip(batch, response.data):
                chunk.embedding_vector = embedding_data.embedding
            db.commit()
            embedded_count += len(batch)
            logger.info(
                f"Embedded batch {batch_start // BATCH_SIZE + 1}: "
                f"{len(batch)} chunks (total so far: {embedded_count})."
            )
        except Exception as e:
            logger.error(f"Embedding API error for batch starting at {batch_start}: {e}")
            db.rollback()
            raise

    latency_ms = int((time.time() - start_time) * 1000)
    log_workflow_event(
        db, project_id, "embedding_completed",
        f"Embedded {embedded_count} chunks using {EMBEDDING_MODEL} in {latency_ms} ms.",
        {
            "chunks_embedded": embedded_count,
            "latency_ms": latency_ms,
            "model": EMBEDDING_MODEL,
            "mode": "real",
        }
    )
    logger.info(f"Embedding complete: {embedded_count} chunks in {latency_ms} ms.")
    return embedded_count
