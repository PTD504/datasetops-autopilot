"""Tests for the embedding pipeline and SemanticRetriever.

All tests run in mock mode (enforced by conftest.py autouse fixture) so no
DashScope API calls are made and no pgvector extension is required.
"""
import asyncio
import uuid

import pytest

from backend.core.database import SessionLocal, engine, Base
from backend.models import Project, Document, Chunk
from backend.models.logging_models import WorkflowEvent


def _make_db_with_chunks(n_chunks: int = 3):
    """Create an isolated in-memory project with n_chunks chunks. Returns (db, project_id, chunk_ids)."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    project_id = str(uuid.uuid4())
    project = Project(
        id=project_id,
        name="Embed Test Project",
        benchmark_request="Test embedding pipeline",
    )
    db.add(project)

    doc_id = str(uuid.uuid4())
    doc = Document(
        id=doc_id,
        project_id=project_id,
        filename="test.txt",
        file_path="uploads/test.txt",
        content="Test content for embedding.",
    )
    db.add(doc)

    chunk_ids = []
    for i in range(n_chunks):
        cid = f"{doc_id}_chunk_{i:04d}"
        chunk = Chunk(
            id=cid,
            document_id=doc_id,
            project_id=project_id,
            text=f"This is test chunk number {i} with some content about refunds and shipping.",
            index=i,
        )
        db.add(chunk)
        chunk_ids.append(cid)

    db.commit()
    return db, project_id, chunk_ids


# ---------------------------------------------------------------------------
# Test (a): mock embed_chunks assigns vectors to all chunks
# ---------------------------------------------------------------------------

def test_mock_embed_assigns_vectors_to_all_chunks():
    """embed_chunks() in mock mode must assign a non-None embedding_vector
    to every chunk that was NULL before the call.
    """
    from backend.pipeline.embedder import embed_chunks, EMBEDDING_DIM

    db, project_id, chunk_ids = _make_db_with_chunks(3)
    try:
        # Confirm vectors are None before embedding.
        chunks_before = db.query(Chunk).filter(Chunk.project_id == project_id).all()
        for c in chunks_before:
            # On SQLite with PickleType the column exists but is None.
            assert c.embedding_vector is None, f"Expected None before embed, got value for {c.id}"

        count = asyncio.run(embed_chunks(project_id, db))

        assert count == 3, f"Expected 3 chunks embedded, got {count}"

        # Confirm vectors are assigned after embedding.
        chunks_after = db.query(Chunk).filter(Chunk.project_id == project_id).all()
        for c in chunks_after:
            assert c.embedding_vector is not None, f"embedding_vector still None for chunk {c.id}"
            assert len(c.embedding_vector) == EMBEDDING_DIM, (
                f"Expected vector length {EMBEDDING_DIM}, got {len(c.embedding_vector)}"
            )

        # Confirm the vectors are deterministic (same chunk same vector).
        vec_first_run = {c.id: c.embedding_vector for c in chunks_after}

        # Re-assign by running again (all chunks now have vectors, so count should be 0
        # on PostgreSQL, but on SQLite the IS NULL filter falls back to all chunks).
        # Reset vectors manually to test determinism.
        for c in chunks_after:
            c.embedding_vector = None
        db.commit()

        count2 = asyncio.run(embed_chunks(project_id, db))
        chunks_second = db.query(Chunk).filter(Chunk.project_id == project_id).all()
        for c in chunks_second:
            stored = c.embedding_vector
            expected = vec_first_run[c.id]
            # Compare as plain Python lists to avoid numpy array ambiguity.
            stored_list = list(stored) if not isinstance(stored, list) else stored
            expected_list = list(expected) if not isinstance(expected, list) else expected
            assert stored_list == expected_list, (
                f"Vector for chunk {c.id} differs between runs — not deterministic"
            )
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Test (b): SemanticRetriever mock mode returns results via NaiveRetriever
# ---------------------------------------------------------------------------

def test_semantic_retriever_mock_mode_returns_results():
    """SemanticRetriever.retrieve() in mock mode must fall back to NaiveRetriever
    and return a non-empty list when matching chunks exist.
    """
    from backend.pipeline.retriever import SemanticRetriever

    db, project_id, chunk_ids = _make_db_with_chunks(4)
    try:
        retriever = SemanticRetriever(db)

        # Query that matches chunk text ("refunds" is in every chunk's text).
        results = retriever.retrieve(project_id, "refunds", top_k=10)

        assert isinstance(results, list), "retrieve() must return a list"
        assert len(results) > 0, "Expected at least one result for keyword 'refunds'"

        # Each result must have the required keys.
        for r in results:
            assert "id" in r
            assert "document_id" in r
            assert "text" in r
            assert "score" in r

        # Query for something not in any chunk should return empty (or fallback 0.1 chunks).
        results_none = retriever.retrieve(project_id, "zzz_nonexistent_xyz", top_k=5)
        assert isinstance(results_none, list)
        # NaiveRetriever falls back to first N chunks with score 0.1 when nothing matches.
        # We only check it does not raise.
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Test (c): workflow transitions through EMBEDDING state in mock mode
# ---------------------------------------------------------------------------

def test_embedding_state_logged_as_workflow_event():
    """After calling embed_chunks() the WorkflowEvent table must contain an
    'embedding_completed' event for the project, confirming the EMBEDDING step ran.
    """
    from backend.pipeline.embedder import embed_chunks

    db, project_id, chunk_ids = _make_db_with_chunks(2)
    try:
        # Set the project state to EMBEDDING (as projects.py would do before calling).
        project = db.query(Project).filter(Project.id == project_id).first()
        project.workflow_state = "EMBEDDING"
        db.commit()

        asyncio.run(embed_chunks(project_id, db))

        # Verify WorkflowEvent was logged.
        event = (
            db.query(WorkflowEvent)
            .filter(WorkflowEvent.project_id == project_id)
            .filter(WorkflowEvent.event_type == "embedding_completed")
            .first()
        )
        assert event is not None, "Expected an 'embedding_completed' WorkflowEvent after embed_chunks()"
        assert "chunks" in event.message.lower() or "embedding" in event.message.lower()

        # Verify all chunks have vectors after embed.
        chunks = db.query(Chunk).filter(Chunk.project_id == project_id).all()
        for c in chunks:
            assert c.embedding_vector is not None, f"Chunk {c.id} has no vector after embed"

    finally:
        db.close()
