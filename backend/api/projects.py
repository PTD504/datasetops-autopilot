from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from backend.core.database import get_db, SessionLocal
from backend.models import Project, Document, BenchmarkPlan, Sample
from pydantic import BaseModel
import os
from pathlib import Path

from backend.pipeline.parser import DocumentParser
from backend.pipeline.chunker import DocumentChunker
from backend.agents.intake_planner import IntakePlannerAgent
from backend.agents.source_understanding import SourceUnderstandingAgent
from backend.agents.generator import BenchmarkGeneratorAgent
from backend.agents.evaluator import QualityEvaluatorAgent
from backend.agents.exporter import ExportReportAgent
from backend.services.cancellation import (
    WorkflowCancellationRequested,
    raise_if_cancelled,
    request_cancellation,
    workflow_state_value,
)
from backend.services.errors import sanitize_error_message

router = APIRouter()

class ProjectCreate(BaseModel):
    name: str
    description: str | None = None
    benchmark_request: str

class ProjectResponse(BaseModel):
    id: str
    name: str
    workflow_state: str
    cancel_requested: bool = False
    cancel_reason: str | None = None
    last_error: str | None = None

    class Config:
        from_attributes = True

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

@router.post("/{project_id}/documents")
async def upload_document(project_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = await file.read()
    text_content = content.decode('utf-8', errors='ignore')
    safe_filename = Path(file.filename or "upload.txt").name

    # Store locally for fallback
    os.makedirs(f"backend/uploads/{project_id}", exist_ok=True)
    file_path = f"backend/uploads/{project_id}/{safe_filename}"
    with open(file_path, "wb") as f:
        f.write(content)

    parser = DocumentParser()
    cleaned_content = parser.parse(safe_filename, text_content)

    db_doc = Document(
        project_id=project_id,
        filename=safe_filename,
        file_path=file_path,
        content=cleaned_content
    )
    db.add(db_doc)

    project.workflow_state = "FILES_UPLOADED"
    project.last_error = None
    db.commit()
    db.refresh(db_doc)
    return {"id": db_doc.id, "filename": db_doc.filename}

@router.get("/{project_id}/documents")
def list_documents(project_id: str, db: Session = Depends(get_db)):
    docs = db.query(Document).filter(Document.project_id == project_id).all()
    return [{"id": d.id, "filename": d.filename, "status": d.status} for d in docs]

def _run_initial_workflow(project_id: str):
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return

        raise_if_cancelled(db, project_id, "initial_workflow.start")

        # 1. Chunking
        project.workflow_state = "CHUNKING"
        db.commit()

        chunker = DocumentChunker()
        docs = db.query(Document).filter(Document.project_id == project_id).all()
        for doc in docs:
             raise_if_cancelled(db, project_id, "chunking.document")
             chunks = chunker.chunk(doc.id, doc.content)
             from backend.models import Chunk
             for c_data in chunks:
                 new_chunk = Chunk(**c_data, project_id=project_id)
                 db.add(new_chunk)
             doc.status = "CHUNKED"
        db.commit()

        project.workflow_state = "CHUNKED"
        db.commit()

        # 2. Source Analyzing
        raise_if_cancelled(db, project_id, "source_understanding.before")
        project.workflow_state = "SOURCE_ANALYZING"
        db.commit()

        source_agent = SourceUnderstandingAgent(db, project_id)
        summary, warnings = source_agent.run()

        project.workflow_state = "SOURCE_ANALYZED"
        db.commit()

        # 3. Planning
        raise_if_cancelled(db, project_id, "planning.before")
        project.workflow_state = "PLANNING"
        db.commit()

        planner_agent = IntakePlannerAgent(db, project_id)
        planner_agent.run(project.benchmark_request, summary, warnings)

        project.workflow_state = "WAITING_FOR_PLAN_APPROVAL"
        db.commit()
    except WorkflowCancellationRequested as e:
        print(f"Initial workflow cancelled: {e}")
    except Exception as e:
        print(f"Error in initial workflow: {e}")
        project.workflow_state = "FAILED"
        project.last_error = sanitize_error_message(e)
        db.commit()
    finally:
        db.close()


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

    project.workflow_state = "PARSING"
    project.last_error = None
    db.commit()

    background_tasks.add_task(_run_initial_workflow, project_id)
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

def _run_generation_workflow(project_id: str):
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
        if not project or not plan:
            return

        raise_if_cancelled(db, project_id, "generation_workflow.start")

        project.workflow_state = "GENERATING"
        db.commit()

        generator = BenchmarkGeneratorAgent(db, project_id)
        evaluator = QualityEvaluatorAgent(db, project_id)

        # Determine total sample count to generate
        total_samples = 10
        if plan.sample_count and isinstance(plan.sample_count, dict):
            total_samples = plan.sample_count.get("total", 10)

        samples = generator.generate(plan, total_samples)

        raise_if_cancelled(db, project_id, "evaluation.before")
        project.workflow_state = "EVALUATING"
        db.commit()

        # Evaluate and trigger repair loop
        for sample in samples:
             raise_if_cancelled(db, project_id, "evaluation.sample")
             eval_result, needs_repair = evaluator.evaluate(sample)

             if needs_repair and sample.retry_count < 2:
                 raise_if_cancelled(db, project_id, "repair.before")
                 sample.retry_count += 1
                 db.commit()
                 # Send back for repair
                 generator.generate(plan, 1, mode="repair", sample=sample)
                 # Re-evaluate
                 raise_if_cancelled(db, project_id, "repair.evaluation")
                 evaluator.evaluate(sample)

        project.workflow_state = "WAITING_FOR_SAMPLE_REVIEW"
        db.commit()

        # For hackathon demo speed, immediately export if some samples are approved
        raise_if_cancelled(db, project_id, "export.before")
        exporter = ExportReportAgent(db, project_id)
        exporter.run()

    except WorkflowCancellationRequested as e:
        print(f"Generation workflow cancelled: {e}")
    except Exception as e:
        print(f"Error in generation workflow: {e}")
        project.workflow_state = "FAILED"
        project.last_error = sanitize_error_message(e)
        db.commit()
    finally:
        db.close()


@router.post("/{project_id}/plan/approve")
def approve_plan(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.cancel_requested:
        return request_cancellation(db, project)

    project.workflow_state = "PLAN_APPROVED"
    project.last_error = None
    db.commit()

    background_tasks.add_task(_run_generation_workflow, project_id)
    return {"status": "approved"}

@router.get("/{project_id}/samples")
def get_samples(project_id: str, status: str = None, db: Session = Depends(get_db)):
    query = db.query(Sample).filter(Sample.project_id == project_id)
    if status:
        query = query.filter(Sample.status == status)
    return query.all()
