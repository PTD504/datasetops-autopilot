import pytest
from sqlalchemy.orm import Session
from backend.core.database import Base, engine, SessionLocal
from backend.models import Project, Sample
from backend.tools.duplicate_checker import DuplicateCheckerTool, DuplicateCheckResult
import uuid

def test_duplicate_checker():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    project_id = str(uuid.uuid4())
    
    # Setup test samples
    s1 = Sample(
        id=str(uuid.uuid4()),
        project_id=project_id,
        category="refund policy",
        difficulty="easy",
        sample_type="single_hop",
        question="Tôi có thể yêu cầu hoàn tiền trong bao lâu?",
        expected_answer="Bạn có thể yêu cầu hoàn tiền toàn bộ trong vòng 14 ngày kể từ ngày nhận hàng nếu sản phẩm bị lỗi.",
        source_chunk_ids=["mock_chunk_refund_001"]
    )
    db.add(s1)
    db.commit()

    checker = DuplicateCheckerTool(db, project_id)

    # 1. Exact normalized match
    res_exact = checker.check(
        candidate_question="TÔI có thể yêu cầu hoàn tiền TRONG bao lâu?!",
        candidate_source_chunk_ids=["mock_chunk_refund_002"],
        candidate_category="refund policy",
        existing_samples=[s1]
    )
    assert res_exact.is_duplicate is True
    assert res_exact.duplicate_score == 1.0
    assert res_exact.duplicate_type == "exact"
    assert res_exact.matched_sample_id == s1.id

    # 2. Lexical near-duplicate (Jaccard similarity >= 0.82)
    # Question: "Tôi có thể yêu cầu hoàn tiền trong bao lâu ạ?" -> overlap is high
    res_near = checker.check(
        candidate_question="Tôi có thể yêu cầu hoàn tiền trong bao lâu ạ?",
        candidate_source_chunk_ids=["mock_chunk_refund_002"],
        candidate_category="refund policy",
        existing_samples=[s1]
    )
    assert res_near.duplicate_score >= 0.82
    assert res_near.duplicate_type == "lexical_near"

    # 3. Same evidence pattern (same source_chunk_ids AND same category)
    res_pattern = checker.check(
        candidate_question="Một câu hỏi hoàn toàn khác nhưng cùng nguồn?",
        candidate_source_chunk_ids=["mock_chunk_refund_001"],
        candidate_category="refund policy",
        existing_samples=[s1]
    )
    assert res_pattern.is_duplicate is False  # score 0.85 is < 0.92, so is_duplicate = False but flagged
    assert res_pattern.duplicate_score == 0.85
    assert res_pattern.duplicate_type == "pattern"

    # 4. Clear pass-through (score < 0.82)
    res_clear = checker.check(
        candidate_question="Thanh toán COD có bị giới hạn gì không?",
        candidate_source_chunk_ids=["mock_chunk_payment_001"],
        candidate_category="payment policy",
        existing_samples=[s1]
    )
    assert res_clear.is_duplicate is False
    assert res_clear.duplicate_score < 0.82
    assert res_clear.duplicate_type == "none"

    # 5. Empty existing_questions / existing_samples edge case
    res_empty = checker.check(
        candidate_question="Thanh toán COD?",
        candidate_source_chunk_ids=["mock_chunk_payment_001"],
        candidate_category="payment policy",
        existing_samples=[]
    )
    assert res_empty.is_duplicate is False
    assert res_empty.duplicate_score == 0.0
    assert res_empty.duplicate_type == "none"

    db.close()
