from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from typing import List, Any, Dict
from backend.core.database import get_db, SessionLocal
from backend.models import Project, Document, BenchmarkPlan, Sample, AgentArtifact, Chunk, Evaluation
from backend.models.export import Export
from backend.models.trace import Trace
from backend.models.enums import WorkflowState, SampleStatus, DecisionType
from backend.core.config import settings
from pydantic import BaseModel
from datetime import datetime
import os
from pathlib import Path

from backend.pipeline.parser import DocumentParser
from backend.pipeline.chunker import DocumentChunker
from backend.agents.intake_planner import IntakePlannerAgent
from backend.agents.source_understanding import SourceUnderstandingAgent
from backend.agents.generator import BenchmarkGeneratorAgent
from backend.agents.evaluator import QualityEvaluatorAgent
from backend.agents.exporter import ExportReportAgent
from backend.services.workflow_logger import log_workflow_event, log_agent_run, log_tool_call, log_agent_artifact

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

class ToolCallLogResponse(BaseModel):
    id: str
    project_id: str
    agent_run_id: str | None = None
    tool_name: str
    input_summary: str | None = None
    output_summary: str | None = None
    status: str
    latency_ms: int | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class AgentRunResponse(BaseModel):
    id: str
    project_id: str
    agent_name: str
    status: str
    input_summary: str | None = None
    decision_summary: str | None = None
    output_json: Any | None = None
    warnings: Any | None = None
    confidence_score: float | None = None
    started_at: datetime
    completed_at: datetime | None = None
    tool_calls: List[ToolCallLogResponse] = []

    class Config:
        from_attributes = True

class WorkflowEventResponse(BaseModel):
    id: str
    project_id: str
    event_type: str
    message: str
    event_metadata: Any | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class AgentArtifactResponse(BaseModel):
    id: str
    project_id: str
    agent_run_id: str | None = None
    artifact_type: str
    title: str
    summary: str | None = None
    content_json: Any | None = None
    created_at: datetime

    class Config:
        from_attributes = True

class TraceItemResponse(BaseModel):
    type: str  # "workflow_event" | "agent_run" | "tool_call" | "artifact"
    timestamp: datetime
    data: Any


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
    os.makedirs(os.path.join(settings.UPLOADS_DIR, project_id), exist_ok=True)
    file_path = os.path.join(settings.UPLOADS_DIR, project_id, safe_filename)
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
    import time
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return

        log_workflow_event(db, project_id, "workflow_started", f"Initial workflow started for project: {project.name}")

        raise_if_cancelled(db, project_id, "initial_workflow.start")

        # 1. Chunking
        project.workflow_state = "CHUNKING"
        db.commit()
        log_workflow_event(db, project_id, "chunking_started", "Document chunking step started.")

        chunker = DocumentChunker()
        docs = db.query(Document).filter(Document.project_id == project_id).all()
        total_chunks = 0
        for doc in docs:
             raise_if_cancelled(db, project_id, "chunking.document")
             start_time = time.time()
             chunks = chunker.chunk(doc.id, doc.content)
             latency = int((time.time() - start_time) * 1000)

             # Log chunker call as a tool call outside an agent run
             log_tool_call(
                 db=db,
                 project_id=project_id,
                 tool_name="DocumentChunker.chunk",
                 input_summary=f"Filename: {doc.filename}, Content size: {len(doc.content)} chars",
                 output_summary=f"Generated {len(chunks)} chunks",
                 status="success",
                 latency_ms=latency
             )

             from backend.models import Chunk
             for c_data in chunks:
                 new_chunk = Chunk(**c_data, project_id=project_id)
                 db.add(new_chunk)
             doc.status = "CHUNKED"
             total_chunks += len(chunks)
        db.commit()

        project.workflow_state = "CHUNKED"
        db.commit()
        log_workflow_event(db, project_id, "chunking_completed", f"Document chunking step completed. Total chunks: {total_chunks}")

        # 2. Source Analyzing
        raise_if_cancelled(db, project_id, "source_understanding.before")
        project.workflow_state = "SOURCE_ANALYZING"
        db.commit()
        log_workflow_event(db, project_id, "source_analysis_started", "Source document analysis agent run started.")

        with log_agent_run(db, project_id, "SourceUnderstandingAgent", f"Analyzing {len(docs)} documents") as agent_logger:
            # Query existing plan categories if available
            from backend.models import BenchmarkPlan, Chunk
            plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
            plan_categories = plan.categories if plan else None
            project_chunks = db.query(Chunk).filter(Chunk.project_id == project_id).all()

            source_agent = SourceUnderstandingAgent(db, project_id)
            result = source_agent.run(
                docs=docs,
                chunks=project_chunks,
                benchmark_request=project.benchmark_request,
                plan_categories=plan_categories
            )
            summary = result["summary"]
            warnings = result["warnings"]
            report = result["report"]

            agent_logger.update(
                decision_summary=summary,
                output_json={
                    "summary": summary,
                    "warnings": warnings,
                    "recommended_adjustments_to_plan": report.get("recommended_adjustments_to_plan", []),
                    "report": report
                },
                warnings=warnings
            )

        # Log Source Understanding Report Artifact
        log_agent_artifact(
            db=db,
            project_id=project_id,
            artifact_type="source_understanding_report",
            title="Source Understanding Report",
            summary=summary,
            content_json=report,
            agent_run_id=agent_logger.run_id
        )

        project.workflow_state = "SOURCE_ANALYZED"
        db.commit()
        log_workflow_event(db, project_id, "source_analysis_completed", f"Source analysis complete. Summary: {summary}")

        # 3. Planning
        raise_if_cancelled(db, project_id, "planning.before")
        project.workflow_state = "PLANNING"
        db.commit()
        log_workflow_event(db, project_id, "planning_started", "Intake planner agent run started.")

        with log_agent_run(db, project_id, "IntakePlannerAgent", f"Generating benchmark plan for request: {project.benchmark_request[:200]}...") as agent_logger:
            planner_agent = IntakePlannerAgent(db, project_id)
            plan = planner_agent.run(project.benchmark_request, summary, warnings)
            agent_logger.update(
                decision_summary=f"Goal: {plan.goal[:100]}..., Total samples planned: {plan.sample_count.get('total') if isinstance(plan.sample_count, dict) else plan.sample_count}",
                output_json={
                    "plan_id": plan.id,
                    "goal": plan.goal[:100],
                    "categories": plan.categories,
                    "sample_count": plan.sample_count
                },
                warnings=plan.source_warnings if hasattr(plan, "source_warnings") else []
            )

        # Log Benchmark Plan Draft Artifact
        plan_total = plan.sample_count.get("total") if isinstance(plan.sample_count, dict) else plan.sample_count
        log_agent_artifact(
            db=db,
            project_id=project_id,
            artifact_type="benchmark_plan_draft",
            title="Benchmark Plan Draft",
            summary=f"Drafted benchmark plan targeting {plan_total} samples across categories: {', '.join(plan.categories or [])}.",
            content_json={
                "domain": "RAG Evaluation",
                "language": plan.language or "English",
                "sample_count": plan_total,
                "categories": plan.categories or [],
                "difficulty_distribution": plan.sample_count if isinstance(plan.sample_count, dict) else {},
                "quality_rules": plan.quality_rules or [],
                "warnings": plan.source_warnings or []
            },
            agent_run_id=agent_logger.run_id
        )


        # Enforce budget/quota guardrails on plan creation (e.g. cap sample count or warn early)
        enforce_quota_guardrails(db, project_id, raise_on_strict=False)

        project.workflow_state = "WAITING_FOR_PLAN_APPROVAL"
        db.commit()
        log_workflow_event(db, project_id, "plan_ready", "Benchmark plan ready. Waiting for human approval.")
    except WorkflowCancellationRequested as e:
        print(f"Initial workflow cancelled: {e}")
        log_workflow_event(db, project_id, "workflow_cancelled", f"Initial workflow cancelled: {str(e)}")
    except Exception as e:
        print(f"Error in initial workflow: {e}")
        project.workflow_state = "FAILED"
        project.last_error = sanitize_error_message(e)
        db.commit()
        log_workflow_event(db, project_id, "workflow_failed", f"Initial workflow failed: {sanitize_error_message(e)}")
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

        log_workflow_event(db, project_id, "generation_started", f"Generation workflow started for project: {project.name}")

        raise_if_cancelled(db, project_id, "generation_workflow.start")

        project.workflow_state = "GENERATING"
        db.commit()

        generator = BenchmarkGeneratorAgent(db, project_id)
        evaluator = QualityEvaluatorAgent(db, project_id)

        # Determine total sample count to generate
        total_samples = 10
        if plan.sample_count and isinstance(plan.sample_count, dict):
            total_samples = plan.sample_count.get("total", 10)

        with log_agent_run(db, project_id, "BenchmarkGeneratorAgent", f"Generating {total_samples} samples") as agent_logger:
            samples = generator.generate(plan, total_samples)
            agent_logger.update(
                decision_summary=f"Successfully generated {len(samples)} samples.",
                output_json={"sample_ids": [s.id for s in samples]}
            )

        # Log Generated Samples Snapshot Artifact
        cat_dist = {}
        diff_dist = {}
        type_dist = {}
        preview = []
        for s in samples:
            cat_dist[s.category] = cat_dist.get(s.category, 0) + 1
            diff_dist[s.difficulty] = diff_dist.get(s.difficulty, 0) + 1
            type_dist[s.sample_type] = type_dist.get(s.sample_type, 0) + 1
            if len(preview) < 3:
                preview.append({
                    "id": s.id,
                    "category": s.category,
                    "difficulty": s.difficulty,
                    "sample_type": s.sample_type,
                    "question": s.question[:100] + "..." if len(s.question) > 100 else s.question
                })

        log_agent_artifact(
            db=db,
            project_id=project_id,
            artifact_type="generated_samples_snapshot",
            title="Generated Samples Snapshot",
            summary=f"Generated {len(samples)} samples. Distribution: easy={diff_dist.get('easy', 0)}, medium={diff_dist.get('medium', 0)}, hard={diff_dist.get('hard', 0)}.",
            content_json={
                "total_generated": len(samples),
                "sample_ids": [s.id for s in samples],
                "category_distribution": cat_dist,
                "difficulty_distribution": diff_dist,
                "sample_type_distribution": type_dist,
                "sample_preview": preview,
                "warnings": []
            },
            agent_run_id=agent_logger.run_id
        )


        raise_if_cancelled(db, project_id, "evaluation.before")
        project.workflow_state = "EVALUATING"
        db.commit()
        log_workflow_event(db, project_id, "evaluation_started", f"Quality evaluation started for {len(samples)} samples.")

        # Evaluate and trigger repair loop
        for idx, sample in enumerate(samples):
             raise_if_cancelled(db, project_id, "evaluation.sample")
             
             with log_agent_run(db, project_id, "QualityEvaluatorAgent", f"Evaluating sample {idx + 1}/{len(samples)} (ID: {sample.id})") as agent_logger:
                 eval_result, needs_repair = evaluator.evaluate(sample)
                 agent_logger.update(
                     decision_summary=f"Evaluation result: {eval_result.decision}, overall score: {eval_result.overall_score}",
                     output_json={
                         "sample_id": sample.id,
                         "decision": eval_result.decision,
                         "overall_score": eval_result.overall_score,
                         "issues": eval_result.issues
                     },
                     confidence_score=eval_result.overall_score
                 )

             if needs_repair:
                 if sample.retry_count < settings.max_repair_retries_limit:
                     raise_if_cancelled(db, project_id, "repair.before")
                     sample.retry_count += 1
                     db.commit()
                     log_workflow_event(db, project_id, "repair_started", f"Repairing sample {sample.id} (Retry {sample.retry_count})")
                     
                     # Send back for repair
                     with log_agent_run(db, project_id, "BenchmarkGeneratorAgent", f"Repairing sample {sample.id} (Retry {sample.retry_count})") as repair_logger:
                         generator.generate(plan, 1, mode="repair", sample=sample)
                         repair_logger.update(
                             decision_summary=f"Repaired sample {sample.id} successfully.",
                             output_json={"sample_id": sample.id}
                         )
                     
                     # Re-evaluate
                     raise_if_cancelled(db, project_id, "repair.evaluation")
                     with log_agent_run(db, project_id, "QualityEvaluatorAgent", f"Evaluating repaired sample {sample.id} (Retry {sample.retry_count})") as re_eval_logger:
                         eval_result, needs_repair = evaluator.evaluate(sample)
                         re_eval_logger.update(
                             decision_summary=f"Post-repair evaluation result: {eval_result.decision}, overall score: {eval_result.overall_score}",
                             output_json={
                                 "sample_id": sample.id,
                                 "decision": eval_result.decision,
                                 "overall_score": eval_result.overall_score,
                                 "issues": eval_result.issues
                             },
                             confidence_score=eval_result.overall_score
                         )
                 else:
                     # Log trace that repair was skipped
                     trace = Trace(
                         project_id=project_id,
                         agent_name="System",
                         action=f"Budget Guardrail: Skipped repair for sample {sample.id} because retry count ({sample.retry_count}) reached maximum limit of {settings.max_repair_retries_limit}.",
                         details={"sample_id": sample.id, "retry_count": sample.retry_count, "limit": settings.max_repair_retries_limit}
                     )
                     db.add(trace)
                     db.commit()
                     log_workflow_event(db, project_id, "repair_skipped", f"Skipped repair for sample {sample.id} because retry count reached maximum limit.")

        # Log Quality Evaluation Report
        evals = db.query(Evaluation).join(Sample).filter(Sample.project_id == project_id).all()
        eval_scores = [e.overall_score for e in evals if e.overall_score is not None]
        faith_scores = [e.faithfulness_score for e in evals if e.faithfulness_score is not None]
        rel_scores = [e.answer_relevance_score for e in evals if e.answer_relevance_score is not None]
        
        passed_count = len([s for s in samples if s.status == SampleStatus.APPROVED])
        human_review_count = len([s for s in samples if s.status == SampleStatus.HUMAN_REVIEW])
        rejected_count = len([s for s in samples if s.status == SampleStatus.REJECTED])
        repairing_count = len([s for s in samples if s.status == SampleStatus.REPAIRING])
        
        all_issues = []
        for e in evals:
            if e.issues:
                all_issues.extend(e.issues)
        unique_issues = list(set(all_issues))[:5]
        
        def safe_avg(scores):
            return round(sum(scores) / len(scores), 3) if scores else 0.0

        log_agent_artifact(
            db=db,
            project_id=project_id,
            artifact_type="evaluation_report",
            title="Quality Evaluation Report",
            summary=f"Evaluated {len(samples)} samples. Pass: {passed_count}, Human Review: {human_review_count}, Reject: {rejected_count}.",
            content_json={
                "total_evaluated": len(samples),
                "average_scores": {
                    "overall": safe_avg(eval_scores),
                    "faithfulness": safe_avg(faith_scores),
                    "answer_relevance": safe_avg(rel_scores)
                },
                "decision_counts": {
                    "pass": passed_count,
                    "human_review": human_review_count,
                    "reject": rejected_count,
                    "repair": repairing_count
                },
                "common_issues": unique_issues,
                "warnings": []
            }
        )

        repaired_samples = [s for s in samples if s.retry_count > 0]
        if repaired_samples:
            successful_repairs = len([s for s in repaired_samples if s.status == SampleStatus.APPROVED])
            failed_repairs = len(repaired_samples) - successful_repairs
            log_agent_artifact(
                db=db,
                project_id=project_id,
                artifact_type="repair_attempts_summary",
                title="Repair Attempts Summary",
                summary=f"Attempted repairs on {len(repaired_samples)} samples. Success: {successful_repairs}, Failed: {failed_repairs}.",
                content_json={
                    "total_repairs": len(repaired_samples),
                    "successful_repairs": successful_repairs,
                    "failed_repairs": failed_repairs,
                    "repaired_sample_ids": [s.id for s in repaired_samples]
                }
            )

        project.workflow_state = "WAITING_FOR_SAMPLE_REVIEW"
        db.commit()
        log_workflow_event(db, project_id, "waiting_for_sample_review", "Workflow waiting for human sample review.")


    except WorkflowCancellationRequested as e:
        print(f"Generation workflow cancelled: {e}")
        log_workflow_event(db, project_id, "workflow_cancelled", f"Generation workflow cancelled: {str(e)}")
    except Exception as e:
        print(f"Error in generation workflow: {e}")
        project.workflow_state = "FAILED"
        project.last_error = sanitize_error_message(e)
        db.commit()
        log_workflow_event(db, project_id, "workflow_failed", f"Generation workflow failed: {sanitize_error_message(e)}")
    finally:
        db.close()


def enforce_quota_guardrails(db: Session, project_id: str, raise_on_strict: bool = True):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        return

    plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
    if not plan:
        return

    requested_total = 10
    if plan.sample_count and isinstance(plan.sample_count, dict):
        requested_total = plan.sample_count.get("total", 10)

    limit = settings.max_samples_per_run_limit
    mode = settings.BUDGET_GUARDRAIL_MODE.lower()

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


@router.post("/{project_id}/plan/approve")
def approve_plan(project_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.cancel_requested:
        return request_cancellation(db, project)

    # Enforce quota guardrails. This can raise an HTTPException(400) in strict mode.
    enforce_quota_guardrails(db, project_id, raise_on_strict=True)

    project.workflow_state = "PLAN_APPROVED"
    project.last_error = None
    log_workflow_event(db, project_id, "plan_approved", "Benchmark plan approved by human review.")
    db.commit()

    # Log Approved Benchmark Plan Artifact
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


    background_tasks.add_task(_run_generation_workflow, project_id)
    return {"status": "approved"}

@router.get("/{project_id}/traces")
def get_traces(project_id: str, db: Session = Depends(get_db)):
    from backend.models.trace import Trace
    traces = db.query(Trace).filter(Trace.project_id == project_id).order_by(Trace.created_at.asc()).all()
    return [{
        "id": t.id,
        "agent_name": t.agent_name,
        "action": t.action,
        "details": t.details,
        "created_at": t.created_at
    } for t in traces]

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

def get_combined_trace(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from backend.models.logging_models import AgentRun, ToolCallLog, WorkflowEvent, AgentArtifact

    events = db.query(WorkflowEvent).filter(WorkflowEvent.project_id == project_id).all()
    runs = db.query(AgentRun).filter(AgentRun.project_id == project_id).all()
    tool_calls = db.query(ToolCallLog).filter(ToolCallLog.project_id == project_id).all()
    artifacts = db.query(AgentArtifact).filter(AgentArtifact.project_id == project_id).all()

    items = []

    for event in events:
        items.append({
            "type": "workflow_event",
            "timestamp": event.created_at,
            "data": {
                "id": event.id,
                "project_id": event.project_id,
                "event_type": event.event_type,
                "message": event.message,
                "event_metadata": event.event_metadata,
                "created_at": event.created_at
            }
        })

    for run in runs:
        items.append({
            "type": "agent_run",
            "timestamp": run.started_at,
            "data": {
                "id": run.id,
                "project_id": run.project_id,
                "agent_name": run.agent_name,
                "status": run.status,
                "input_summary": run.input_summary,
                "decision_summary": run.decision_summary,
                "output_json": run.output_json,
                "warnings": run.warnings,
                "confidence_score": run.confidence_score,
                "started_at": run.started_at,
                "completed_at": run.completed_at
            }
        })

    for tc in tool_calls:
        items.append({
            "type": "tool_call",
            "timestamp": tc.created_at,
            "data": {
                "id": tc.id,
                "project_id": tc.project_id,
                "agent_run_id": tc.agent_run_id,
                "tool_name": tc.tool_name,
                "input_summary": tc.input_summary,
                "output_summary": tc.output_summary,
                "status": tc.status,
                "latency_ms": tc.latency_ms,
                "created_at": tc.created_at
            }
        })

    for art in artifacts:
        items.append({
            "type": "artifact",
            "timestamp": art.created_at,
            "data": {
                "id": art.id,
                "project_id": art.project_id,
                "agent_run_id": art.agent_run_id,
                "artifact_type": art.artifact_type,
                "title": art.title,
                "summary": art.summary,
                "content_json": art.content_json,
                "created_at": art.created_at
            }
        })

    items.sort(key=lambda x: x["timestamp"])
    return items

@router.get("/{project_id}/export/download")
def download_export(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    export_record = db.query(Export).filter(
        Export.project_id == project_id,
        Export.status == "READY"
    ).order_by(Export.created_at.desc()).first()

    if not export_record:
        raise HTTPException(
            status_code=404,
            detail="Export is not ready yet. Please complete the workflow first."
        )

    # OSS mode support
    if settings.STORAGE_MODE == "oss":
        try:
            from backend.wrappers.oss_client import AlibabaOSSClient
            oss = AlibabaOSSClient()
            if not oss.use_local:
                signed_url = oss.get_signed_url(f"exports/{project_id}/export.zip")
                return RedirectResponse(url=signed_url)
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate presigned download link for OSS: {str(e)}"
            )

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
        # Check settings local storage dir
        p = os.path.join(settings.LOCAL_STORAGE_DIR, f"exports/{project_id}/export.zip")
        if os.path.exists(p):
            local_path = p

    if not local_path:
        # Check backend build directory fallback
        p = os.path.join(settings.EXPORTS_DIR, project_id, "export.zip")
        if os.path.exists(p):
            local_path = p

    if not local_path or not os.path.exists(local_path):
        raise HTTPException(
            status_code=404,
            detail="Export package zip file not found on server storage."
        )

    return FileResponse(
        path=local_path,
        filename=f"datasetops-export-{project_id}.zip",
        media_type="application/zip"
    )

@router.get("/{project_id}/export/summary")
def get_export_summary(project_id: str, db: Session = Depends(get_db)):
    from backend.models.sample import Evaluation
    from backend.models.enums import SampleStatus

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    all_samples = db.query(Sample).filter(Sample.project_id == project_id).all()
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

@router.get("/{project_id}/samples")
def get_samples(project_id: str, status: str = None, db: Session = Depends(get_db)):
    from backend.models.sample import Evaluation
    from backend.models.document import Chunk
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
            "evidence_unavailable": evidence_unavailable or (len(evidence) == 0)
        }
        results.append(s_dict)

    return results


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

    enforce_quota_guardrails(db, project_id, raise_on_strict=True)

    db.refresh(plan)
    return plan


class SampleUpdate(BaseModel):
    question: str
    expected_answer: str
    category: str
    difficulty: str


@router.post("/{project_id}/samples/{sample_id}/approve")
def approve_sample(project_id: str, sample_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sample = db.query(Sample).filter(Sample.id == sample_id, Sample.project_id == project_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    from backend.models.sample import ReviewDecision

    sample.status = SampleStatus.APPROVED

    decision = ReviewDecision(
        sample_id=sample_id,
        decision=DecisionType.APPROVE,
        notes="Manually approved"
    )
    db.add(decision)

    trace = Trace(
        project_id=project_id,
        agent_name="System",
        action=f"Approved sample {sample_id}.",
        details={"sample_id": sample_id}
    )
    db.add(trace)
    db.commit()
    db.refresh(sample)
    return sample


@router.post("/{project_id}/samples/{sample_id}/reject")
def reject_sample(project_id: str, sample_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    sample = db.query(Sample).filter(Sample.id == sample_id, Sample.project_id == project_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")

    from backend.models.sample import ReviewDecision

    sample.status = SampleStatus.REJECTED

    decision = ReviewDecision(
        sample_id=sample_id,
        decision=DecisionType.REJECT,
        notes="Manually rejected"
    )
    db.add(decision)

    trace = Trace(
        project_id=project_id,
        agent_name="System",
        action=f"Rejected sample {sample_id}.",
        details={"sample_id": sample_id}
    )
    db.add(trace)
    db.commit()
    db.refresh(sample)
    return sample


@router.put("/{project_id}/samples/{sample_id}")
def update_sample(project_id: str, sample_id: str, sample_update: SampleUpdate, db: Session = Depends(get_db)):
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

    from backend.models.sample import ReviewDecision

    sample.question = sample_update.question
    sample.expected_answer = sample_update.expected_answer
    sample.category = sample_update.category
    sample.difficulty = sample_update.difficulty.lower()

    decision = ReviewDecision(
        sample_id=sample_id,
        decision=DecisionType.EDIT,
        notes="Manually edited content"
    )
    db.add(decision)

    trace = Trace(
        project_id=project_id,
        agent_name="System",
        action=f"Edited sample {sample_id}.",
        details={"sample_id": sample_id}
    )
    db.add(trace)
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

    # 1. Update remaining non-rejected samples to APPROVED
    samples = db.query(Sample).filter(Sample.project_id == project_id).all()
    for s in samples:
        if s.status in [SampleStatus.HUMAN_REVIEW, SampleStatus.GENERATED, SampleStatus.REPAIRING] or s.status is None:
            s.status = SampleStatus.APPROVED

    db.commit()

    # 2. Log workflow event for sample review approval
    log_workflow_event(db, project_id, "sample_review_approved", "Human sample review completed and approved.")

    # 3. Transition to EXPORTING
    project.workflow_state = WorkflowState.EXPORTING.value
    db.commit()

    # 4. Run Export
    log_workflow_event(db, project_id, "export_started", "Starting human-approved benchmark package export.")
    
    from backend.agents.exporter import ExportReportAgent
    with log_agent_run(db, project_id, "ExportReportAgent", "Generating final benchmark package") as agent_logger:
        exporter = ExportReportAgent(db, project_id)
        export_record = exporter.run()
        
        agent_logger.update(
            decision_summary=f"Exported package successfully: {export_record.file_urls.get('export.zip') if (export_record and export_record.file_urls) else 'N/A'}",
            output_json={
                "export_id": export_record.id if export_record else None,
                "file_urls": export_record.file_urls if export_record else None
            }
        )

    # 5. Transition project to EXPORT_READY
    project.workflow_state = WorkflowState.EXPORT_READY.value
    db.commit()
    log_workflow_event(db, project_id, "export_completed", "Benchmark export completed successfully.")

    # 6. Log Artifacts
    approved_samples = [s for s in samples if s.status == SampleStatus.APPROVED]
    rejected_samples = [s for s in samples if s.status == SampleStatus.REJECTED]

    # Log approved_samples_summary
    log_agent_artifact(
        db=db,
        project_id=project_id,
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
            project_id=project_id,
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

    return {"status": "success", "export_id": export_record.id if export_record else None}


@router.post("/{project_id}/export")
def rebuild_export(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    from backend.agents.exporter import ExportReportAgent
    log_workflow_event(db, project_id, "export_rebuild_started", "Rebuilding benchmark export package.")
    with log_agent_run(db, project_id, "ExportReportAgent", "Rebuilding final benchmark package") as agent_logger:
        exporter = ExportReportAgent(db, project_id)
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
            from backend.models.enums import SampleStatus
            all_samples = db.query(Sample).filter(Sample.project_id == project_id).all()
            approved_count = len([s for s in all_samples if s.status == SampleStatus.APPROVED])
            rejected_count = len([s for s in all_samples if s.status == SampleStatus.REJECTED])
            log_agent_artifact(
                db=db,
                project_id=project_id,
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

    log_workflow_event(db, project_id, "export_rebuild_completed", "Benchmark export rebuild completed successfully.")

    return {"status": "success", "export_id": export_record.id}
