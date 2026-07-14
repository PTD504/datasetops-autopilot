from fastapi import HTTPException
from sqlalchemy.orm import Session
from backend.models import Project, BenchmarkPlan, Trace
from backend.core.config import settings

def enforce_quota_guardrails(db: Session, project_id: str, raise_on_strict: bool = True):
    """Enforce quota and budget limits based on sample counts and guardrail settings."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return

    plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
    if not plan:
        return

    requested_total = 10
    if plan.sample_count and isinstance(plan.sample_count, dict):
        requested_total = plan.sample_count.get("total", 10)

    limit = settings.QWEN_MAX_SAMPLES_PER_RUN
    mode = settings.QWEN_BUDGET_GUARDRAIL_MODE.lower()

    if requested_total > limit:
        if mode == "strict":
            warning_msg = f"Budget limit exceeded in strict mode. This plan cannot be approved with {requested_total} samples (max allowed is {limit})."
            warnings = list(plan.source_warnings or [])
            if warning_msg not in warnings:
                warnings.append(warning_msg)
                plan.source_warnings = warnings
                db.commit()

            if raise_on_strict:
                raise HTTPException(
                    status_code=400,
                    detail=f"Requested sample count ({requested_total}) exceeds the maximum allowed limit ({limit}) in strict mode."
                )
        elif mode == "cap":
            original_total = requested_total
            easy = plan.sample_count.get("easy", 0)
            medium = plan.sample_count.get("medium", 0)
            hard = plan.sample_count.get("hard", 0)

            if original_total > 0:
                factor = limit / original_total
                new_easy = int(round(easy * factor))
                new_medium = int(round(medium * factor))
                new_hard = limit - (new_easy + new_medium)
                if new_hard < 0:
                    new_hard = 0
                    new_medium = limit - new_easy
            else:
                new_easy = limit // 3
                new_medium = limit // 3
                new_hard = limit - (new_easy + new_medium)

            plan.sample_count = {
                "total": limit,
                "easy": new_easy,
                "medium": new_medium,
                "hard": new_hard
            }
            
            warning_msg = f"Sample count capped from {original_total} to {limit} due to budget guardrail limit."
            warnings = list(plan.source_warnings or [])
            if warning_msg not in warnings:
                warnings.append(warning_msg)
                plan.source_warnings = warnings
            
            # Log trace if not already present
            existing_trace = db.query(Trace).filter(
                Trace.project_id == project_id,
                Trace.action.like("Budget Guardrail: Capped requested samples%")
            ).first()
            if not existing_trace:
                trace = Trace(
                    project_id=project_id,
                    agent_name="System",
                    action=f"Budget Guardrail: Capped requested samples from {original_total} to {limit}.",
                    details={"original": original_total, "capped": limit}
                )
                db.add(trace)
            db.commit()

        elif mode == "warn":
            warning_msg = f"Budget Guardrail Warning: Run contains {requested_total} samples, which exceeds the configured limit of {limit}."
            warnings = list(plan.source_warnings or [])
            if warning_msg not in warnings:
                warnings.append(warning_msg)
                plan.source_warnings = warnings
            
            existing_trace = db.query(Trace).filter(
                Trace.project_id == project_id,
                Trace.action == warning_msg
            ).first()
            if not existing_trace:
                trace = Trace(
                    project_id=project_id,
                    agent_name="System",
                    action=warning_msg,
                    details={"requested": requested_total, "limit": limit}
                )
                db.add(trace)
            db.commit()
