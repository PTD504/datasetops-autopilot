from sqlalchemy.orm import Session
from backend.models import Project, BenchmarkPlan
from backend.services.workflow_logger import log_agent_run, log_agent_artifact


def update_plan_and_reaudit(
    db: Session,
    project: Project,
    plan: BenchmarkPlan,
    plan_update,
) -> BenchmarkPlan:
    """Update benchmark plan fields and re-run source coverage audit.

    Encapsulates the business logic previously inline in the update_plan route:
    - Update plan fields
    - Filter stale quota warnings from source_warnings
    - Commit the field update
    - Conditionally run SourceUnderstandingAgent Phase 1 if doc_understanding is absent
    - Always run SourceUnderstandingAgent Phase 2 (coverage audit)
    - Log the combined source understanding artifact
    - Enforce quota guardrails

    Args:
        db: Active SQLAlchemy session.
        project: The Project ORM object.
        plan: The BenchmarkPlan ORM object to update.
        plan_update: A PlanUpdate instance (or any object with .goal, .language,
                     .sample_count, .categories, .quality_rules attributes).

    Returns:
        The refreshed BenchmarkPlan ORM object.
    """
    project_id = project.id

    plan.goal = plan_update.goal
    plan.language = plan_update.language
    plan.sample_count = plan_update.sample_count
    plan.categories = plan_update.categories
    plan.quality_rules = plan_update.quality_rules

    # Reset quota warnings so they recheck on the fresh values
    warnings = list(plan.source_warnings or [])
    warnings = [w for w in warnings if "guardrail" not in w.lower() and "capped" not in w.lower() and "exceed" not in w.lower()]
    plan.source_warnings = warnings
    db.commit()

    # Re-run Source Coverage Audit (Phase 2)
    from backend.models import Document, Chunk
    from backend.agents.source_understanding import SourceUnderstandingAgent
    docs = db.query(Document).filter(Document.project_id == project_id).all()
    project_chunks = db.query(Chunk).filter(Chunk.project_id == project_id).all()
    source_agent = SourceUnderstandingAgent(db, project_id)

    doc_under = project.doc_understanding
    if not doc_under:
        with log_agent_run(db, project_id, "SourceUnderstandingAgent (Phase 1)", f"Analyzing {len(docs)} documents") as agent_logger:
            result = source_agent.run_document_understanding(docs=docs, chunks=project_chunks)
            doc_under = result["report"]
            agent_logger.update(
                decision_summary=result["summary"],
                output_json={"summary": result["summary"], "warnings": result["warnings"], "report": doc_under},
                warnings=result["warnings"]
            )
        project.doc_understanding = doc_under
        db.commit()

    with log_agent_run(db, project_id, "SourceUnderstandingAgent (Phase 2)", "Coverage Audit") as audit_logger:
        audit_result = source_agent.run_coverage_audit(
            chunks=project_chunks,
            categories=plan_update.categories or [],
            doc_understanding=doc_under
        )
        final_summary = audit_result["summary"]
        final_warnings = audit_result["warnings"]
        final_report = audit_result["report"]

        audit_logger.update(
            decision_summary=final_summary,
            output_json={
                "summary": final_summary,
                "warnings": final_warnings,
                "recommended_adjustments_to_plan": final_report.get("recommended_adjustments_to_plan", []),
                "report": final_report
            },
            warnings=final_warnings
        )

    # Log Source Understanding Report Artifact (combined document analysis and coverage)
    log_agent_artifact(
        db=db,
        project_id=project_id,
        artifact_type="source_understanding_report",
        title="Source Understanding Report",
        summary=final_summary,
        content_json=final_report,
        agent_run_id=audit_logger.run_id
    )

    from backend.services.quota import enforce_quota_guardrails
    enforce_quota_guardrails(db, project_id, raise_on_strict=True)

    db.refresh(plan)
    return plan
