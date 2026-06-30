from datetime import datetime
from sqlalchemy.orm import Session
from backend.models import Project, Sample
from backend.models.enums import WorkflowState, SampleStatus
from backend.services.workflow_logger import (
    log_workflow_event,
    log_agent_run,
    log_agent_artifact,
)
from backend.services.state_manager import transition_to

def run_export_workflow(db: Session, project: Project):
    """Transition remaining samples to approved status, transition state to EXPORTING, run ExportReportAgent, and transition to EXPORT_READY."""
    # 1. Update remaining non-rejected samples to APPROVED
    samples = db.query(Sample).filter(Sample.project_id == project.id).all()
    for s in samples:
        if s.status in [SampleStatus.HUMAN_REVIEW, SampleStatus.GENERATED, SampleStatus.REPAIRING] or s.status is None:
            s.status = SampleStatus.APPROVED

    db.commit()

    # 2. Log workflow event for sample review approval
    log_workflow_event(db, project.id, "sample_review_approved", "Human sample review completed and approved.")

    # 3. Transition to EXPORTING
    transition_to(db, project, WorkflowState.EXPORTING)
    db.commit()

    # 4. Run Export
    log_workflow_event(db, project.id, "export_started", "Starting human-approved benchmark package export.")
    
    from backend.agents.exporter import ExportReportAgent
    with log_agent_run(db, project.id, "ExportReportAgent", "Generating final benchmark package") as agent_logger:
        exporter = ExportReportAgent(db, project.id)
        export_record = exporter.run()
        
        agent_logger.update(
            decision_summary=f"Exported package successfully: {export_record.file_urls.get('export.zip') if (export_record and export_record.file_urls) else 'N/A'}",
            output_json={
                "export_id": export_record.id if export_record else None,
                "file_urls": export_record.file_urls if export_record else None
            }
        )

    # 5. Transition project to EXPORT_READY
    transition_to(db, project, WorkflowState.EXPORT_READY)
    db.commit()
    log_workflow_event(db, project.id, "export_completed", "Benchmark export completed successfully.")

    # 6. Log Artifacts
    approved_samples = [s for s in samples if s.status == SampleStatus.APPROVED]
    rejected_samples = [s for s in samples if s.status == SampleStatus.REJECTED]

    # Log approved_samples_summary
    log_agent_artifact(
        db=db,
        project_id=project.id,
        artifact_type="approved_samples_summary",
        title="Approved Samples Summary",
        summary=f"Human review completed. Approved {len(approved_samples)} sample(s), Rejected {len(rejected_samples)} sample(s).",
        content_json={
            "total_samples": len(samples),
            "approved_count": len(approved_samples),
            "rejected_count": len(rejected_samples),
            "approved_sample_ids": [s.id for s in approved_samples]
        },
        agent_run_id=agent_logger.run_id
    )

    # Log export_summary
    if export_record:
        log_agent_artifact(
            db=db,
            project_id=project.id,
            artifact_type="export_summary",
            title="Export Package Summary",
            summary=f"Benchmark package exported with {len(approved_samples)} approved samples.",
            content_json={
                "export_id": export_record.id,
                "exported_files": list(export_record.file_urls.keys()) if export_record.file_urls else ["export.zip"],
                "approved_sample_count": len(approved_samples),
                "rejected_sample_count": len(rejected_samples),
                "file_urls": {k: "Safe download endpoint" for k in export_record.file_urls.keys()} if export_record.file_urls else {},
                "generated_at": datetime.utcnow().isoformat()
            },
            agent_run_id=agent_logger.run_id
        )

    return export_record

def rebuild_export_workflow(db: Session, project: Project):
    """Re-run the ExportReportAgent for an already finalized project and regenerate download packages."""
    from backend.agents.exporter import ExportReportAgent
    log_workflow_event(db, project.id, "export_rebuild_started", "Rebuilding benchmark export package.")
    with log_agent_run(db, project.id, "ExportReportAgent", "Rebuilding final benchmark package") as agent_logger:
        exporter = ExportReportAgent(db, project.id)
        export_record = exporter.run()
        agent_logger.update(
            decision_summary=f"Rebuild package successfully: {export_record.file_urls.get('export.zip') if (export_record and export_record.file_urls) else 'N/A'}",
            output_json={
                "export_id": export_record.id if export_record else None,
                "file_urls": export_record.file_urls if export_record else None
            }
        )

        # Log Export Summary Artifact
        if export_record:
            all_samples = db.query(Sample).filter(Sample.project_id == project.id).all()
            approved_count = len([s for s in all_samples if s.status == SampleStatus.APPROVED])
            rejected_count = len([s for s in all_samples if s.status == SampleStatus.REJECTED])
            log_agent_artifact(
                db=db,
                project_id=project.id,
                artifact_type="export_summary",
                title="Export Package Summary (Rebuilt)",
                summary=f"Benchmark package rebuilt with {approved_count} approved samples.",
                content_json={
                    "export_id": export_record.id,
                    "exported_files": list(export_record.file_urls.keys()) if export_record.file_urls else ["export.zip"],
                    "approved_sample_count": approved_count,
                    "rejected_sample_count": rejected_count,
                    "file_urls": {k: "Safe download endpoint" for k in export_record.file_urls.keys()} if export_record.file_urls else {},
                    "generated_at": datetime.utcnow().isoformat(),
                    "is_rebuild": True
                },
                agent_run_id=agent_logger.run_id
            )

    log_workflow_event(db, project.id, "export_rebuild_completed", "Benchmark export rebuild completed successfully.")
    return export_record
