from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db
from backend.models import Project, Document, BenchmarkPlan, AgentArtifact, Sample
from backend.models.enums import WorkflowState
from backend.core.config import settings
from pydantic import BaseModel
from backend.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ToolCallLogResponse,
    AgentRunResponse,
    WorkflowEventResponse,
    AgentArtifactResponse,
    TraceItemResponse,
)

from backend.services.workflow_logger import log_workflow_event, log_agent_artifact
from backend.services.cancellation import (
    request_cancellation,
    workflow_state_value,
)

router = APIRouter()


@router.post("/", response_model=ProjectResponse)
def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    db_project = Project(
        name=project.name,
        description=project.description,
        benchmark_request=project.benchmark_request
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.post("/{project_id}/stop")
def stop_workflow(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return request_cancellation(db, project)

@router.post("/{project_id}/resume")
def resume_workflow(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    non_resumable_states = {
        WorkflowState.DONE,
        WorkflowState.EXPORT_READY,
        WorkflowState.WAITING_FOR_PLAN_APPROVAL,
        WorkflowState.WAITING_FOR_SAMPLE_REVIEW,
    }
    if project.workflow_state in non_resumable_states:
        raise HTTPException(
            status_code=400,
            detail=f"Workflow in state '{project.workflow_state}' does not need to be resumed.",
        )

    # Reset cancellation flags and clear last error before dispatching.
    project.cancel_requested = False
    project.last_error = None
    db.commit()

    # Dispatch heuristic: states that belong to the generation pipeline (at or
    # past PLAN_APPROVED). BenchmarkPlan has no status column, so project state
    # is the sole reliable signal.
    generation_pipeline_states = {
        WorkflowState.PLAN_APPROVED,
        WorkflowState.GENERATING,
        WorkflowState.VALIDATING,
        WorkflowState.EVALUATING,
        WorkflowState.REPAIRING,
    }
    # For FAILED, check whether a BenchmarkPlan exists to determine which
    # pipeline was active when the failure occurred. If the project's last
    # known state was in the generation pipeline, prefer that check.
    if project.workflow_state in generation_pipeline_states:
        use_generation = True
    elif project.workflow_state == WorkflowState.FAILED:
        plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
        use_generation = plan is not None
    else:
        use_generation = False

    if use_generation:
        from backend.workflows import run_generation_workflow
        background_tasks.add_task(run_generation_workflow, project_id)
    else:
        from backend.workflows import run_initial_workflow
        background_tasks.add_task(run_initial_workflow, project_id)

    return {
        "project_id": project.id,
        "workflow_state": workflow_state_value(project),
        "message": "Workflow resumed",
    }

@router.post("/{project_id}/documents")
async def upload_document(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = await file.read()
    from backend.services.document_service import process_document_upload
    db_doc = process_document_upload(db, project, file.filename, content)
    db.commit()
    db.refresh(db_doc)
    return {"id": db_doc.id, "filename": db_doc.filename}

@router.get("/{project_id}/documents")
def list_documents(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    from backend.services.document_service import list_project_documents
    return list_project_documents(db, project_id)

@router.post("/{project_id}/start")
def start_workflow(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.cancel_requested:
        return request_cancellation(db, project)
    document_count = db.query(Document).filter(Document.project_id == project_id).count()
    if document_count == 0:
        raise HTTPException(
            status_code=400,
            detail="Upload at least one source document before starting the workflow."
        )

    from backend.services.state_manager import transition_to
    transition_to(db, project, WorkflowState.PARSING)
    db.commit()

    from backend.workflows import run_initial_workflow
    background_tasks.add_task(run_initial_workflow, project_id)
    return {"status": "started"}

@router.get("/{project_id}/status")
def get_project_status(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return {
        "project_id": project.id,
        "workflow_state": workflow_state_value(project),
        "cancel_requested": project.cancel_requested,
        "cancel_reason": project.cancel_reason,
        "last_error": project.last_error,
    }

@router.get("/{project_id}/usage")
def get_project_usage(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from backend.services.llm_budget import LLMBudgetGuard
    from backend.core.config import settings

    guard = LLMBudgetGuard(db, project_id)
    summary = guard.get_summary()
    policy = guard.policy

    budget_status = "ok"
    if guard.enabled and not settings.effective_mock_llm:
        if summary.calls_used >= policy.max_calls or summary.total_tokens_used >= policy.max_total_tokens or summary.estimated_cost_used >= policy.max_cost_usd:
            budget_status = "exceeded"

    if project.cancel_requested:
        budget_status = "stopped"

    return {
        "project_id": project.id,
        "workflow_state": workflow_state_value(project),
        "llm_mode": settings.effective_llm_mode,
        "run_mode": settings.RUN_MODE,
        "mock_mode": settings.effective_mock_llm or not settings.QWEN_API_KEY,
        "guardrails_enabled": guard.enabled,
        "attempted_calls": summary.attempted_calls,
        "calls_used": summary.calls_used,
        "failed_calls": summary.failed_calls,
        "blocked_calls": summary.blocked_calls,
        "max_calls": policy.max_calls,
        "input_tokens_used": summary.input_tokens_used,
        "max_input_tokens": policy.max_input_tokens,
        "output_tokens_used": summary.output_tokens_used,
        "max_output_tokens": policy.max_output_tokens,
        "total_tokens_used": summary.total_tokens_used,
        "max_total_tokens": policy.max_total_tokens,
        "estimated_cost_used": summary.estimated_cost_used,
        "max_estimated_cost": policy.max_cost_usd,
        "budget_status": budget_status,
        "cancel_requested": project.cancel_requested,
        "cancel_reason": project.cancel_reason,
        "last_error": project.last_error,
    }

@router.get("/{project_id}/plan")
def get_plan(project_id: str, db: Session = Depends(get_db)):
    plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

@router.post("/{project_id}/plan/approve")
def approve_plan(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.cancel_requested:
        return request_cancellation(db, project)

    from backend.services.quota import enforce_quota_guardrails
    enforce_quota_guardrails(db, project_id, raise_on_strict=True)

    from backend.services.state_manager import transition_to
    transition_to(db, project, WorkflowState.PLAN_APPROVED)
    log_workflow_event(db, project_id, "plan_approved", "Benchmark plan approved by human review.")
    db.commit()

    plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
    if plan:
        plan_total = plan.sample_count.get("total") if isinstance(plan.sample_count, dict) else plan.sample_count
        log_agent_artifact(
            db=db,
            project_id=project_id,
            artifact_type="approved_benchmark_plan",
            title="Approved Benchmark Plan",
            summary=f"Plan approved by human review with total samples: {plan_total}.",
            content_json={
                "domain": "RAG Evaluation",
                "language": plan.language or "English",
                "sample_count": plan_total,
                "categories": plan.categories or [],
                "difficulty_distribution": plan.sample_count if isinstance(plan.sample_count, dict) else {},
                "quality_rules": plan.quality_rules or [],
                "warnings": plan.source_warnings or []
            }
        )

    from backend.workflows import run_generation_workflow
    background_tasks.add_task(run_generation_workflow, project_id)
    return {"status": "approved"}

@router.get("/{project_id}/traces")
def get_traces(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    from backend.services.trace_service import get_traces
    return get_traces(db, project_id)

@router.get("/{project_id}/agent-runs", response_model=List[AgentRunResponse])
def get_agent_runs(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    from backend.models.logging_models import AgentRun
    runs = db.query(AgentRun).filter(AgentRun.project_id == project_id).order_by(AgentRun.started_at.asc()).all()
    return runs

@router.get("/{project_id}/workflow-events", response_model=List[WorkflowEventResponse])
def get_workflow_events(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    from backend.models.logging_models import WorkflowEvent
    events = db.query(WorkflowEvent).filter(WorkflowEvent.project_id == project_id).order_by(WorkflowEvent.created_at.asc()).all()
    return events

@router.get("/{project_id}/artifacts", response_model=List[AgentArtifactResponse])
def get_artifacts(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    artifacts = db.query(AgentArtifact).filter(AgentArtifact.project_id == project_id).order_by(AgentArtifact.created_at.asc()).all()
    return artifacts

@router.get("/{project_id}/artifacts/{artifact_id}", response_model=AgentArtifactResponse)
def get_artifact(project_id: str, artifact_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    artifact = db.query(AgentArtifact).filter(AgentArtifact.project_id == project_id, AgentArtifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return artifact

@router.get("/{project_id}/trace", response_model=List[TraceItemResponse])
def get_combined_trace_endpoint(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    from backend.services.trace_service import get_combined_trace
    return get_combined_trace(db, project_id)

@router.get("/{project_id}/export/download")
def download_export(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from backend.models import Export
    export_record = db.query(Export).filter(
        Export.project_id == project_id,
        Export.status == "READY"
    ).order_by(Export.created_at.desc()).first()

    if not export_record:
        raise HTTPException(
            status_code=404,
            detail="Export is not ready yet. Please complete the workflow first."
        )

    from backend.services.export_service import resolve_export_download_path
    resolved = resolve_export_download_path(db, project_id, export_record)
    if not resolved:
        raise HTTPException(
            status_code=404,
            detail="Export package zip file not found on server storage."
        )

    if resolved.startswith("http://") or resolved.startswith("https://"):
        return RedirectResponse(url=resolved)
    else:
        return FileResponse(
            path=resolved,
            filename=f"datasetops-export-{project_id}.zip",
            media_type="application/zip"
        )

@router.get("/{project_id}/export/summary")
def get_export_summary_endpoint(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    from backend.services.export_service import get_export_summary
    return get_export_summary(db, project)

@router.get("/{project_id}/samples")
def get_samples_endpoint(project_id: str, status: str = None, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    from backend.services.sample_service import get_samples
    return get_samples(db, project_id, status)

class PlanUpdate(BaseModel):
    goal: str
    language: str
    sample_count: dict
    categories: List[str]
    quality_rules: List[str]

@router.put("/{project_id}/plan")
def update_plan(project_id: str, plan_update: PlanUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    post_gen_states = {
        "PLAN_APPROVED", "GENERATING", "VALIDATING", "EVALUATING",
        "REPAIRING", "WAITING_FOR_SAMPLE_REVIEW", "EXPORTING",
        "EXPORT_READY", "DONE"
    }
    if project.workflow_state in post_gen_states:
        raise HTTPException(
            status_code=400,
            detail="Cannot edit plan after generation has started."
        )

    plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Benchmark plan not found")

    total = plan_update.sample_count.get("total", 0)
    if total <= 0:
        raise HTTPException(status_code=400, detail="Total sample count must be positive.")

    if not plan_update.categories:
        raise HTTPException(status_code=400, detail="Categories list cannot be empty.")

    easy = plan_update.sample_count.get("easy", 0)
    medium = plan_update.sample_count.get("medium", 0)
    hard = plan_update.sample_count.get("hard", 0)

    if easy < 0 or medium < 0 or hard < 0:
        raise HTTPException(status_code=400, detail="Difficulty counts cannot be negative.")

    if easy + medium + hard != total:
        raise HTTPException(
            status_code=400,
            detail="The sum of easy, medium, and hard samples must equal the total sample count."
        )

    from backend.services.plan_service import update_plan_and_reaudit
    return update_plan_and_reaudit(db, project, plan, plan_update)

class SampleUpdate(BaseModel):
    question: str
    expected_answer: str
    category: str
    difficulty: str

@router.post("/{project_id}/samples/{sample_id}/approve")
def approve_sample_endpoint(project_id: str, sample_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sample = db.query(Sample).filter(Sample.id == sample_id, Sample.project_id == project_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    from backend.services.sample_service import approve_sample
    approve_sample(db, sample)
    db.commit()
    db.refresh(sample)
    return sample

@router.post("/{project_id}/samples/{sample_id}/reject")
def reject_sample_endpoint(project_id: str, sample_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sample = db.query(Sample).filter(Sample.id == sample_id, Sample.project_id == project_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    from backend.services.sample_service import reject_sample
    reject_sample(db, sample)
    db.commit()
    db.refresh(sample)
    return sample

@router.put("/{project_id}/samples/{sample_id}")
def update_sample_endpoint(project_id: str, sample_id: str, sample_update: SampleUpdate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sample = db.query(Sample).filter(Sample.id == sample_id, Sample.project_id == project_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    if not sample_update.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if not sample_update.expected_answer.strip():
        raise HTTPException(status_code=400, detail="Expected answer cannot be empty.")

    valid_difficulties = {"easy", "medium", "hard"}
    if sample_update.difficulty.lower() not in valid_difficulties:
        raise HTTPException(status_code=400, detail=f"Difficulty must be one of: {valid_difficulties}")

    from backend.services.sample_service import update_sample
    update_sample(db, sample, sample_update.question, sample_update.expected_answer, sample_update.category, sample_update.difficulty)
    db.commit()
    db.refresh(sample)
    return sample

@router.post("/{project_id}/samples/approve-and-export")
def approve_and_export(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    if project.workflow_state not in ["WAITING_FOR_SAMPLE_REVIEW", "EXPORT_READY"]:
        raise HTTPException(
            status_code=400,
            detail=f"Project is not in a valid state for finalization: {project.workflow_state}"
        )

    from backend.workflows import run_export_workflow
    export_record = run_export_workflow(db, project)
    return {"status": "success", "export_id": export_record.id if export_record else None}

@router.post("/{project_id}/export")
def rebuild_export(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from backend.workflows import rebuild_export_workflow
    export_record = rebuild_export_workflow(db, project)
    return {"status": "success", "export_id": export_record.id}
