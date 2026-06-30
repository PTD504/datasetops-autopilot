from backend.pipeline.retriever import SemanticRetriever
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.core.config import settings
from backend.models import Project, BenchmarkPlan, Sample, AgentArtifact, Evaluation
from backend.models.enums import WorkflowState, SampleStatus
from backend.agents.generator import BenchmarkGeneratorAgent
from backend.agents.evaluator import QualityEvaluatorAgent
from backend.agents.negotiation import negotiate
from backend.services.workflow_logger import (
    log_workflow_event,
    log_agent_run,
    log_agent_artifact,
)
from backend.services.cancellation import (
    WorkflowCancellationRequested,
    raise_if_cancelled,
)
from backend.services.errors import sanitize_error_message
from backend.services.state_manager import transition_to

def run_generation_workflow(project_id: str):
    """Background task executing diversity planning, sample generation, negotiation, and quality evaluation."""
    db = SessionLocal()
    try:
        project = db.query(Project).filter(Project.id == project_id).first()
        plan = db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == project_id).first()
        if not project or not plan:
            return

        log_workflow_event(db, project_id, "generation_started", f"Generation workflow started for project: {project.name}")

        raise_if_cancelled(db, project_id, "generation_workflow.start")

        transition_to(db, project, WorkflowState.GENERATING)
        db.commit()

        # Fetch the latest source_understanding_report if available
        source_report_json = None
        source_report_artifact = db.query(AgentArtifact).filter(
            AgentArtifact.project_id == project_id,
            AgentArtifact.artifact_type == "source_understanding_report"
        ).order_by(AgentArtifact.created_at.desc()).first()
        if source_report_artifact and source_report_artifact.content_json:
            source_report_json = source_report_artifact.content_json

        # Determine total sample count to generate
        total_samples = 10
        if plan.sample_count and isinstance(plan.sample_count, dict):
            total_samples = plan.sample_count.get("total", 10)

        # Run diversity planning.
        from backend.tools.diversity_planner import DiversityPlannerTool

        planner = DiversityPlannerTool(db, project_id, retriever=SemanticRetriever(db))

        log_workflow_event(db, project_id, "sample_slots_planning_started", "Sample slots planning started.")
        with log_agent_run(db, project_id, "BenchmarkGeneratorAgent", "Planning sample slots") as slots_logger:
            plan_result = planner.plan_slots(plan, source_report_json, total_samples)
            slots = plan_result.get("slots", [])
            summary = plan_result.get("summary", {})
            slots_logger.update(
                decision_summary=f"Planned {len(slots)} sample slots.",
                output_json={"total_slots": len(slots), "category_counts": summary.get("category_counts", {})}
            )

        log_agent_artifact(
            db=db,
            project_id=project_id,
            artifact_type="sample_slots",
            title="Planned Sample Slots",
            summary=f"Planned {len(slots)} sample slots. Category counts: {summary.get('category_counts', {})}",
            content_json=plan_result
        )
        log_workflow_event(db, project_id, "sample_slots_created", f"Successfully planned {len(slots)} sample slots.")

        generator = BenchmarkGeneratorAgent(db, project_id)
        evaluator = QualityEvaluatorAgent(db, project_id)

        # Wire up slot loop.
        # Evidence is retrieved per-slot using SemanticRetriever (falls back to
        # NaiveRetriever in mock/SQLite mode). The workflow drives retrieval here
        # directly — rather than calling BenchmarkGeneratorAgent.generate() — so
        # that cancellation checks (raise_if_cancelled) and per-slot log_agent_run
        # wrappers can be interleaved without restructuring the agent interface.
        # BenchmarkGeneratorAgent.generate() is preserved for direct-call and test
        # contexts (e.g., test_generator_evaluator.py::test_pipeline).
        from backend.tools.evidence_assembler import EvidenceAssemblerTool
        assembler = EvidenceAssemblerTool(db, project_id)

        samples = []
        # Seed existing_questions with Sample objects already in the DB for this project.
        # This ensures even the first slot's evaluate() call has full prior context
        # and avoids a full-table query inside evaluate() on every call.
        existing_questions: list = list(
            db.query(Sample).filter(Sample.project_id == project_id).all()
        )
        existing_chunk_combos: list = [
            tuple(sorted(s.source_chunk_ids or [])) for s in existing_questions
        ]

        # Run generator and evaluator slot-by-slot
        for idx, slot in enumerate(slots):
            raise_if_cancelled(db, project_id, f"generation.slot_{idx}")

            # 1. Per-slot semantic retrieval + evidence assembly
            slot_chunks = SemanticRetriever(db).retrieve(project_id, slot['category'], top_k=15)
            evidence_pack = assembler.assemble(slot, slot_chunks)

            # 2. Sample Generation
            with log_agent_run(db, project_id, "BenchmarkGeneratorAgent", f"Generating sample for slot {slot['slot_id']}") as agent_logger:
                candidate_sample = generator.generate_one(slot, evidence_pack)
                agent_logger.update(
                    decision_summary=f"Generated candidate sample {candidate_sample.id} for slot {slot['slot_id']}.",
                    output_json={"sample_id": candidate_sample.id}
                )

            # 4. Generator-Critic Negotiation
            raise_if_cancelled(db, project_id, f"negotiation.slot_{idx}.start")

            max_turns = settings.QWEN_MAX_REPAIR_ATTEMPTS_PER_SAMPLE
            negotiate(
                slot=slot,
                sample=candidate_sample,
                evidence_pack=evidence_pack,
                generator=generator,
                evaluator=evaluator,
                db=db,
                project_id=project_id,
                max_turns=max_turns,
                existing_questions=existing_questions,
                existing_chunk_combos=existing_chunk_combos,
            )

            # Append the completed sample object so subsequent slots see it as a
            # duplicate candidate without re-querying the DB.
            existing_questions.append(candidate_sample)
            existing_chunk_combos.append(tuple(sorted(candidate_sample.source_chunk_ids or [])))
            samples.append(candidate_sample)

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
            }
        )

        raise_if_cancelled(db, project_id, "evaluation.after")
        transition_to(db, project, WorkflowState.EVALUATING)
        db.commit()
        log_workflow_event(db, project_id, "evaluation_started", f"Quality evaluation completed for {len(samples)} samples.")

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

        transition_to(db, project, WorkflowState.WAITING_FOR_SAMPLE_REVIEW)
        db.commit()
        log_workflow_event(db, project_id, "waiting_for_sample_review", "Workflow waiting for human sample review.")

    except WorkflowCancellationRequested as e:
        print(f"Generation workflow cancelled: {e}")
        log_workflow_event(db, project_id, "workflow_cancelled", f"Generation workflow cancelled: {str(e)}")
    except Exception as e:
        print(f"Error in generation workflow: {e}")
        transition_to(db, project, WorkflowState.FAILED, log_message=sanitize_error_message(e), event_type="workflow_failed")
        db.commit()
    finally:
        db.close()
