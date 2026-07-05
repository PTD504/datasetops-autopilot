from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.models import Sample, Chunk, Evaluation, Trace
from backend.models.enums import SampleStatus, DecisionType
from backend.models.sample import ReviewDecision

def get_samples(db: Session, project_id: str, status: str = None) -> List[Dict[str, Any]]:
    """Retrieve samples for a project, optionally filtering by status, and enrich them with chunk evidence details."""
    query = db.query(Sample).filter(Sample.project_id == project_id)
    if status:
        query = query.filter(Sample.status == status)

    samples = query.all()
    results = []

    for s in samples:
        latest_eval = db.query(Evaluation).filter(Evaluation.sample_id == s.id).order_by(Evaluation.created_at.desc()).first()
        
        evidence = []
        evidence_unavailable = False
        chunk_ids = s.source_chunk_ids
        if chunk_ids and isinstance(chunk_ids, list):
            chunks_by_id = {c.id: c for c in db.query(Chunk).filter(Chunk.id.in_(chunk_ids)).all()}
            for cid in chunk_ids:
                if cid in chunks_by_id:
                    chunk = chunks_by_id[cid]
                    text_snippet = chunk.text[:1000] if chunk.text else ""
                    doc_name = chunk.document.filename if chunk.document else "Unknown Document"
                    evidence.append({
                        "id": chunk.id,
                        "index": chunk.index,
                        "document_name": doc_name,
                        "text": text_snippet,
                        "evidence_unavailable": False
                    })
                else:
                    evidence.append({
                        "id": cid,
                        "index": -1,
                        "document_name": "Unknown Document",
                        "text": "Unavailable/Missing evidence chunk.",
                        "evidence_unavailable": True
                    })
                    evidence_unavailable = True
        else:
            evidence_unavailable = True

        s_dict = {
            "id": s.id,
            "category": s.category,
            "difficulty": s.difficulty,
            "sample_type": s.sample_type,
            "question": s.question,
            "expected_answer": s.expected_answer,
            "status": s.status.value,
            "overall_score": latest_eval.overall_score if latest_eval else None,
            "decision": latest_eval.decision if latest_eval else None,
            "faithfulness_score": latest_eval.faithfulness_score if latest_eval else None,
            "answer_relevance_score": latest_eval.answer_relevance_score if latest_eval else None,
            "hallucination_risk_score": latest_eval.hallucination_risk_score if latest_eval else None,
            "issues": latest_eval.issues if latest_eval else [],
            "evidence": evidence,
            "evidence_unavailable": evidence_unavailable or (len(evidence) == 0),
            "retry_count": s.retry_count,
            "evaluator_notes": latest_eval.evaluator_notes if latest_eval else None,
            "repair_instruction": latest_eval.repair_instruction if latest_eval else None,
            "novelty_score": latest_eval.novelty_score if latest_eval else None,
            "context_precision_score": latest_eval.context_precision_score if latest_eval else None,
            "context_recall_score": latest_eval.context_recall_score if latest_eval else None,
            "clarity_score": latest_eval.clarity_score if latest_eval else None,
            "difficulty_match_score": latest_eval.difficulty_match_score if latest_eval else None,
            "answerability_score": latest_eval.answerability_score if latest_eval else None
        }
        results.append(s_dict)

    return results

def approve_sample(db: Session, sample: Sample) -> Sample:
    """Approve a sample, log a review decision, and record a system trace."""
    sample.status = SampleStatus.APPROVED

    decision = ReviewDecision(
        sample_id=sample.id,
        decision=DecisionType.APPROVE,
        notes="Manually approved"
    )
    db.add(decision)

    trace = Trace(
        project_id=sample.project_id,
        agent_name="System",
        action=f"Approved sample {sample.id}.",
        details={"sample_id": sample.id}
    )
    db.add(trace)
    db.flush()
    return sample

def reject_sample(db: Session, sample: Sample) -> Sample:
    """Reject a sample, log a review decision, and record a system trace."""
    sample.status = SampleStatus.REJECTED

    decision = ReviewDecision(
        sample_id=sample.id,
        decision=DecisionType.REJECT,
        notes="Manually rejected"
    )
    db.add(decision)

    trace = Trace(
        project_id=sample.project_id,
        agent_name="System",
        action=f"Rejected sample {sample.id}.",
        details={"sample_id": sample.id}
    )
    db.add(trace)
    db.flush()
    return sample

def update_sample(db: Session, sample: Sample, question: str, expected_answer: str, category: str, difficulty: str) -> Sample:
    """Update a sample's content, log a review decision, and record a system trace."""
    sample.question = question
    sample.expected_answer = expected_answer
    sample.category = category
    sample.difficulty = difficulty.lower()

    decision = ReviewDecision(
        sample_id=sample.id,
        decision=DecisionType.EDIT,
        notes="Manually edited content"
    )
    db.add(decision)

    trace = Trace(
        project_id=sample.project_id,
        agent_name="System",
        action=f"Edited sample {sample.id}.",
        details={"sample_id": sample.id}
    )
    db.add(trace)
    db.flush()
    return sample
