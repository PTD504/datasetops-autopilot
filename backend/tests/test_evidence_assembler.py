import pytest
from sqlalchemy.orm import Session
from backend.core.database import Base, engine, SessionLocal
from backend.tools.evidence_assembler import EvidenceAssemblerTool, EvidencePack
import uuid

def test_evidence_assembler():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    project_id = str(uuid.uuid4())

    assembler = EvidenceAssemblerTool(db, project_id)

    # Setup retriever chunks
    retrieved_chunks = [
        {"id": "c1", "text": "This is chunk 1. Refund policy is active.", "score": 0.9},
        {"id": "c2", "text": "This is chunk 2. Refund policy allows 14 days.", "score": 0.8},
        {"id": "c3", "text": "This is chunk 3. Shipping is free over 500k.", "score": 0.7},
        {"id": "c4", "text": "This is chunk 4. Shipping takes 3-5 days.", "score": 0.4},
        {"id": "c5", "text": "This is chunk 5. Warranty is 12 months.", "score": 0.35},
        {"id": "c6", "text": "This is chunk 6. Warranty excludes physical damage.", "score": 0.2},
    ]

    # 1. single_hop slot -> only primary chunks
    slot_single = {
        "slot_id": "slot_001",
        "category": "refund policy",
        "difficulty": "easy",
        "sample_type": "single_hop",
        "required_evidence_count": 1,
        "preferred_chunk_ids": ["c1"],
        "source_coverage_level": "strong"
    }
    pack_single = assembler.assemble(slot_single, retrieved_chunks)
    assert len(pack_single.primary_chunks) == 1
    assert pack_single.primary_chunks[0]["id"] == "c1"
    assert len(pack_single.supporting_chunks) == 0

    # 2. multi_hop slot -> primary + supporting chunks
    slot_multi = {
        "slot_id": "slot_002",
        "category": "shipping policy",
        "difficulty": "hard",
        "sample_type": "multi_hop",
        "required_evidence_count": 2,
        "preferred_chunk_ids": ["c3"],
        "source_coverage_level": "strong"
    }
    pack_multi = assembler.assemble(slot_multi, retrieved_chunks)
    assert len(pack_multi.primary_chunks) == 1
    assert pack_multi.primary_chunks[0]["id"] == "c3"
    # Should include supporting chunks with score > 0.3 (excluding c3, which is c1, c2, c4, c5)
    assert len(pack_multi.supporting_chunks) > 0
    supporting_ids = [c["id"] for c in pack_multi.supporting_chunks]
    assert "c1" in supporting_ids
    assert "c6" not in supporting_ids # score is 0.2 <= 0.3

    # 3. Deduplication of overlapping chunks (> 70% sentence overlap)
    overlapping_chunks = [
        {"id": "c1", "text": "Refund is 14 days. Refund requires receipt.", "score": 0.9},
        {"id": "c2", "text": "Refund is 14 days. Refund requires receipt.", "score": 0.8}, # identical sentences -> 100% overlap
    ]
    slot_dup = {
        "slot_id": "slot_003",
        "category": "refund policy",
        "difficulty": "medium",
        "sample_type": "multi_hop",
        "required_evidence_count": 2,
        "preferred_chunk_ids": ["c1"],
        "source_coverage_level": "medium"
    }
    pack_dup = assembler.assemble(slot_dup, overlapping_chunks)
    # Deduplication should keep only c1 because it has the higher score (0.9 > 0.8)
    all_chunk_ids = [c["id"] for c in pack_dup.primary_chunks + pack_dup.supporting_chunks]
    assert len(all_chunk_ids) == 1
    assert all_chunk_ids[0] == "c1"

    # 4. Cap at 5 total chunks
    slot_cap = {
        "slot_id": "slot_004",
        "category": "refund policy",
        "difficulty": "hard",
        "sample_type": "multi_hop",
        "required_evidence_count": 2,
        "preferred_chunk_ids": ["c1", "c2"],
        "source_coverage_level": "strong"
    }
    pack_cap = assembler.assemble(slot_cap, retrieved_chunks)
    total_chunks = len(pack_cap.primary_chunks) + len(pack_cap.supporting_chunks)
    assert total_chunks <= 5

    # 5. Missing preferred_chunk_ids fallback
    slot_missing = {
        "slot_id": "slot_005",
        "category": "refund policy",
        "difficulty": "medium",
        "sample_type": "single_hop",
        "required_evidence_count": 1,
        "preferred_chunk_ids": ["c999"], # non-existent ID
        "source_coverage_level": "strong"
    }
    pack_missing = assembler.assemble(slot_missing, retrieved_chunks)
    assert len(pack_missing.primary_chunks) == 1
    assert pack_missing.primary_chunks[0]["id"] == "c1" # falls back to first chunk in retrieved_chunks

    db.close()
