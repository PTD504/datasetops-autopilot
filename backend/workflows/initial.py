import time
import asyncio
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models import Project, Document, Chunk
from backend.models.enums import WorkflowState
from backend.pipeline.chunker import DocumentChunker
from backend.pipeline.embedder import embed_chunks
from backend.agents.source_understanding import SourceUnderstandingAgent
from backend.agents.intake_planner import IntakePlannerAgent
from backend.services.workflow_logger import (
    log_workflow_event,
    log_agent_run,
    log_tool_call,
    log_agent_artifact,
)
from backend.services.cancellation import (
    WorkflowCancellationRequested,
    raise_if_cancelled,
)
from backend.services.errors import sanitize_error_message
from backend.services.quota import enforce_quota_guardrails
from backend.services.state_manager import transition_to

def run_initial_workflow(project_id: str):
    """Background task executing the document chunking, embedding, source understanding, and diversity planning phases."""
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return

        log_workflow_event(db, project_id, "workflow_started", f"Initial workflow started for project: {project.name}")

        raise_if_cancelled(db, project_id, "initial_workflow.start")

        # 1. Chunking
        transition_to(db, project, WorkflowState.CHUNKING)
        db.commit()
        
        from backend.core.config import settings
        log_workflow_event(
            db,
            project_id,
            "chunking_started",
            "Document chunking step started.",
            metadata={
                "chunk_size": settings.CHUNK_SIZE,
                "chunk_overlap": settings.CHUNK_OVERLAP
            }
        )

        chunker = DocumentChunker(
            chunk_size=settings.CHUNK_SIZE,
            overlap=settings.CHUNK_OVERLAP
        )
        docs = db.query(Document).filter(Document.project_id == project_id).all()
        total_chunks = 0
        for doc in docs:
             raise_if_cancelled(db, project_id, "chunking.document")
             if doc.status == "CHUNKED":
                 existing_count = db.query(Chunk).filter(Chunk.document_id == doc.id).count()
                 total_chunks += existing_count
                 print(f"Document {doc.filename} is already chunked. Skipping chunking.")
                 continue

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

             for c_data in chunks:
                 new_chunk = Chunk(**c_data, project_id=project_id)
                 db.add(new_chunk)
             doc.status = "CHUNKED"
             total_chunks += len(chunks)
        db.commit()

        transition_to(db, project, WorkflowState.CHUNKED)
        db.commit()
        log_workflow_event(db, project_id, "chunking_completed", f"Document chunking step completed. Total chunks: {total_chunks}")

        # 2. Embedding
        raise_if_cancelled(db, project_id, "embedding.before")
        transition_to(db, project, WorkflowState.EMBEDDING)
        db.commit()
        log_workflow_event(db, project_id, "embedding_started", "Chunk embedding step started.")
        asyncio.run(embed_chunks(project_id, db))

        # 3. Source Analyzing (Phase 1)
        raise_if_cancelled(db, project_id, "source_understanding.before")
        transition_to(db, project, WorkflowState.SOURCE_ANALYZING)
        db.commit()
        log_workflow_event(db, project_id, "source_analysis_started", "Source document analysis agent run started.")

        with log_agent_run(db, project_id, "SourceUnderstandingAgent (Phase 1)", f"Analyzing {len(docs)} documents") as agent_logger:
            project_chunks = db.query(Chunk).filter(Chunk.project_id == project_id).all()

            source_agent = SourceUnderstandingAgent(db, project_id)
            result = source_agent.run_document_understanding(
                docs=docs,
                chunks=project_chunks
            )
            summary = result["summary"]
            warnings = result["warnings"]
            report = result["report"]

            agent_logger.update(
                decision_summary=summary,
                output_json={
                    "summary": summary,
                    "warnings": warnings,
                    "report": report
                },
                warnings=warnings
            )

        # 4. Source Coverage Audit (Phase 2)
        log_workflow_event(db, project_id, "source_coverage_audit_started", "Source coverage audit step started.")
        with log_agent_run(db, project_id, "SourceUnderstandingAgent (Phase 2)", "Coverage Audit") as audit_logger:
            candidate_categories = report.get("recommended_categories", []) or report.get("strong_sections", [])
            audit_result = source_agent.run_coverage_audit(
                chunks=project_chunks,
                categories=candidate_categories,
                doc_understanding=report,
                db=db,
                project_id=project_id
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

        log_workflow_event(db, project_id, "source_coverage_audit_completed", f"Source coverage audit complete. Summary: {final_summary}")

        # Persist intermediate document understanding to DB
        project.doc_understanding = final_report
        db.commit()

        transition_to(db, project, WorkflowState.SOURCE_ANALYZED)
        db.commit()
        log_workflow_event(db, project_id, "source_analysis_completed", f"Source analysis complete. Summary: {summary}")

        # 3. Planning
        raise_if_cancelled(db, project_id, "planning.before")
        transition_to(db, project, WorkflowState.PLANNING)
        db.commit()
        log_workflow_event(db, project_id, "planning_started", "Intake planner agent run started.")

        with log_agent_run(db, project_id, "IntakePlannerAgent", f"Generating benchmark plan for request: {project.benchmark_request[:200]}...") as agent_logger:
            planner_agent = IntakePlannerAgent(db, project_id)
            plan = planner_agent.run(project.benchmark_request, final_summary, final_warnings, source_report=final_report)
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

        # Enforce budget/quota guardrails on plan creation
        enforce_quota_guardrails(db, project_id, raise_on_strict=False)

        transition_to(db, project, WorkflowState.WAITING_FOR_PLAN_APPROVAL)
        db.commit()
        log_workflow_event(db, project_id, "plan_ready", "Benchmark plan ready. Waiting for human approval.")
    except WorkflowCancellationRequested as e:
        print(f"Initial workflow cancelled: {e}")
        log_workflow_event(db, project_id, "workflow_cancelled", f"Initial workflow cancelled: {str(e)}")
        transition_to(db, project, WorkflowState.FAILED)
        db.commit()
    except Exception as e:
        print(f"Error in initial workflow: {e}")
        transition_to(db, project, WorkflowState.FAILED, log_message=sanitize_error_message(e), event_type="workflow_failed")
        db.commit()
    finally:
        db.close()
