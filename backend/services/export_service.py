import os
from sqlalchemy.orm import Session
from backend.models import Export, Project, Sample, Evaluation
from backend.models.enums import SampleStatus
from backend.core.config import settings

def resolve_export_download_path(db: Session, project_id: str, export_record: Export) -> str | None:
    """Resolve the local filesystem path or presigned OSS URL for the export download using the resolved export record."""
    # OSS mode support
    if settings.STORAGE_MODE == "oss":
        from backend.wrappers.oss_client import AlibabaOSSClient
        oss = AlibabaOSSClient()
        if not oss.use_local:
            signed_url = oss.get_signed_url(f"exports/{project_id}/export.zip")
            return signed_url

    # Local mode resolution
    local_path = None
    url = export_record.file_urls.get("export.zip") if export_record.file_urls else None
    
    if url and url.startswith("file://"):
        p = url[7:]
        # strip leading slash on Windows if it looks like /D:/...
        if p.startswith("/") and len(p) > 2 and p[2] == ":":
            p = p.lstrip("/")
        if os.path.exists(p):
            local_path = p

    if not local_path:
        # Check backend build directory fallback
        p = os.path.join(settings.EXPORTS_DIR, project_id, "export.zip")
        if os.path.exists(p):
            local_path = p

    if not local_path or not os.path.exists(local_path):
        return None

    return local_path

def get_export_summary(db: Session, project: Project) -> dict:
    """Compile status distribution, type distribution, and average metrics for the project samples."""
    all_samples = db.query(Sample).filter(Sample.project_id == project.id).all()
    sample_ids = [s.id for s in all_samples]

    evals = []
    if sample_ids:
        # Fetch latest evaluation for each sample
        for sid in sample_ids:
            latest_eval = db.query(Evaluation).filter(Evaluation.sample_id == sid).order_by(Evaluation.created_at.desc()).first()
            if latest_eval:
                evals.append(latest_eval)

    approved_count = len([s for s in all_samples if s.status == SampleStatus.APPROVED])
    total_count = len(all_samples)

    sample_types = {}
    statuses = {}
    for s in all_samples:
        st = s.sample_type or "unknown"
        sample_types[st] = sample_types.get(st, 0) + 1

        status = s.status.value if s.status else "unknown"
        statuses[status] = statuses.get(status, 0) + 1

    avg_overall = sum([e.overall_score or 0 for e in evals]) / len(evals) if evals else 0
    avg_faithfulness = sum([e.faithfulness_score or 0 for e in evals]) / len(evals) if evals else 0
    avg_hallucination_risk = sum([e.hallucination_risk_score or 0 for e in evals]) / len(evals) if evals else 0

    return {
        "export_ready": project.workflow_state == "EXPORT_READY",
        "approved_sample_count": approved_count,
        "total_sample_count": total_count,
        "sample_type_distribution": sample_types,
        "status_distribution": statuses,
        "average_metrics": {
            "overall": round(avg_overall, 2),
            "faithfulness": round(avg_faithfulness, 2),
            "hallucination_risk": round(avg_hallucination_risk, 2)
        }
    }
