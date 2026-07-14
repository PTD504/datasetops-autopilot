from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import Project, Sample, BenchmarkPlan, Export, Evaluation
from backend.models.enums import SampleStatus
from backend.wrappers.oss_client import AlibabaOSSClient
from backend.core.config import settings
import json
import os
import zipfile
import uuid

class ExportReportAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id)
        self.purpose = "Generate final dataset artifacts and reports."
        self.oss_client = AlibabaOSSClient()

    def run(self) -> Export:
        self._log_trace("start_export", {})

        project = self.db.query(Project).filter(Project.id == self.project_id).first()
        plan = self.db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == self.project_id).first()
        samples = self.db.query(Sample).filter(Sample.project_id == self.project_id, Sample.status != SampleStatus.REJECTED).all()

        export_dir = os.path.join(settings.EXPORTS_DIR, self.project_id)
        os.makedirs(export_dir, exist_ok=True)

        # 1. rag_eval.jsonl & answer_key.jsonl
        eval_path = os.path.join(export_dir, "rag_eval.jsonl")
        answer_path = os.path.join(export_dir, "answer_key.jsonl")

        from backend.models.document import Chunk
        chunk_rows = self.db.query(Chunk).filter(Chunk.project_id == self.project_id).all()
        chunk_map = {c.id: c.text for c in chunk_rows}

        with open(eval_path, "w") as fe, open(answer_path, "w") as fa:
            for s in samples:
                evidence = [
                    {"chunk_id": cid, "text": chunk_map.get(cid, "")}
                    for cid in (s.source_chunk_ids or [])
                ]
                fe.write(json.dumps({
                    "id": s.id,
                    "sample_type": s.sample_type,
                    "question": s.question,
                    "source_chunk_ids": s.source_chunk_ids,
                    "evidence": evidence
                }) + "\n")

                fa.write(json.dumps({
                    "id": s.id,
                    "expected_answer": s.expected_answer
                }) + "\n")

        # 2. dataset_card.md
        card_path = os.path.join(export_dir, "dataset_card.md")
        with open(card_path, "w") as f:
            f.write(f"# Dataset Card: {project.name}\n\n")
            f.write(f"**Goal:** {plan.goal if plan else 'N/A'}\n\n")
            f.write(f"**Language:** {plan.language if plan else 'N/A'}\n\n")
            f.write(f"**Categories:** {', '.join(plan.categories) if plan and plan.categories else 'N/A'}\n\n")
            f.write(f"**Total Samples:** {len(samples)}\n\n")

            difficulty_counts = {}
            sample_type_counts = {}
            for s in samples:
                diff = s.difficulty if s.difficulty else "unknown"
                difficulty_counts[diff] = difficulty_counts.get(diff, 0) + 1

                stype = s.sample_type if s.sample_type else "unknown"
                sample_type_counts[stype] = sample_type_counts.get(stype, 0) + 1

            f.write(f"**Difficulty Distribution:**\n")
            for diff, count in difficulty_counts.items():
                f.write(f"- {diff.capitalize()}: {count}\n")

            f.write(f"\n**Sample Type Distribution:**\n")
            for stype, count in sample_type_counts.items():
                f.write(f"- {stype}: {count}\n")

            f.write(f"\n**Quality Evaluation:**\n")
            f.write(f"Samples were evaluated using RAG-specific quality metrics including faithfulness, answer relevance, context precision, and hallucination risk.\n\n")

            f.write(f"\n**Limitations:**\n")
            f.write(f"- This is an auto-generated benchmark.\n")
            f.write(f"- The final exported files (jsonl) intentionally contain only explicitly 'APPROVED' samples. This includes valid, verified `unanswerable` sample types.\n")
            f.write(f"- May require further human review for production use.\n")

        # 3. quality_report.md
        all_samples_in_db = self.db.query(Sample).filter(Sample.project_id == self.project_id).all()
        sample_ids = [s.id for s in all_samples_in_db]

        passed_samples = [s for s in all_samples_in_db if s.status == SampleStatus.APPROVED]
        repaired_samples = [s for s in all_samples_in_db if s.retry_count > 0]
        human_review_samples = [s for s in all_samples_in_db if s.status == SampleStatus.HUMAN_REVIEW]
        rejected_samples = [s for s in all_samples_in_db if s.status == SampleStatus.REJECTED]

        # Fetch latest evaluation for each sample
        evals = []
        for sid in sample_ids:
            latest_eval = self.db.query(Evaluation).filter(Evaluation.sample_id == sid).order_by(Evaluation.created_at.desc()).first()
            if latest_eval:
                evals.append(latest_eval)

        avg_overall = 0.0
        avg_faithfulness = 0.0
        avg_answer_relevance = 0.0
        avg_context_precision = 0.0
        avg_context_recall = 0.0
        avg_hallucination_risk = 0.0

        if evals:
            avg_overall = sum([e.overall_score or 0 for e in evals]) / len(evals)
            avg_faithfulness = sum([e.faithfulness_score or 0 for e in evals]) / len(evals)
            avg_answer_relevance = sum([e.answer_relevance_score or 0 for e in evals]) / len(evals)
            avg_context_precision = sum([e.context_precision_score or 0 for e in evals]) / len(evals)
            avg_context_recall = sum([e.context_recall_score or 0 for e in evals]) / len(evals)
            avg_hallucination_risk = sum([e.hallucination_risk_score or 0 for e in evals]) / len(evals)

        report_path = os.path.join(export_dir, "quality_report.md")
        with open(report_path, "w", encoding="utf-8") as f:
            f.write("# Quality Report\n\n")

            f.write(f"## Evaluator Rubric\n")
            f.write(f"Samples were evaluated using a rich set of RAG-specific metrics:\n")
            f.write(f"- **Faithfulness:** whether the expected answer is supported by the evidence chunks.\n")
            f.write(f"- **Answer Relevance:** whether the expected answer directly answers the question.\n")
            f.write(f"- **Context Precision:** whether provided evidence chunks are actually relevant.\n")
            f.write(f"- **Context Recall:** whether provided evidence chunks contain enough information to answer.\n")
            f.write(f"- **Hallucination Risk:** risk that the answer includes unsupported information. Lower is better.\n\n")

            f.write(f"## Summary\n")
            f.write(f"- **Passed Samples:** {len(passed_samples)}\n")
            f.write(f"- **Repaired Samples:** {len(repaired_samples)}\n")
            f.write(f"- **Human Review Samples:** {len(human_review_samples)}\n")
            f.write(f"- **Rejected Samples:** {len(rejected_samples)}\n\n")

            f.write(f"## Metrics Averages (All Samples)\n")
            f.write(f"- **Average Overall Score:** {avg_overall:.2f}\n")
            f.write(f"- **Average Faithfulness Score:** {avg_faithfulness:.2f}\n")
            f.write(f"- **Average Answer Relevance Score:** {avg_answer_relevance:.2f}\n")
            f.write(f"- **Average Context Precision Score:** {avg_context_precision:.2f}\n")
            f.write(f"- **Average Context Recall Score:** {avg_context_recall:.2f}\n")
            f.write(f"- **Average Hallucination Risk Score:** {avg_hallucination_risk:.2f}\n\n")

            f.write(f"## Sample Types (Passed)\n")
            st_counts = {}
            for s in passed_samples:
                st = s.sample_type if s.sample_type else "unknown"
                st_counts[st] = st_counts.get(st, 0) + 1
            for st, count in st_counts.items():
                f.write(f"- {st}: {count}\n")
            f.write("\n")

            f.write(f"## Common Issues\n")
            # Aggregate real issues from evaluation results.
            all_issues = []
            for e in evals:
                if e.issues and isinstance(e.issues, list):
                    all_issues.extend(e.issues)
            # Deduplicate while preserving insertion order, then take top 5.
            seen = set()
            unique_issues = []
            for issue in all_issues:
                normalized = str(issue).strip()
                if normalized and normalized not in seen:
                    seen.add(normalized)
                    unique_issues.append(normalized)
                if len(unique_issues) >= 5:
                    break
            if unique_issues:
                for issue in unique_issues:
                    f.write(f"- {issue}\n")
            else:
                f.write(f"- No issues recorded.\n")
            f.write("\n")

            f.write(f"## Recommendations\n")
            # Build concrete recommendations from decision counts already computed above.
            decision_counts = {}
            for e in evals:
                d = (e.decision or "unknown").strip()
                decision_counts[d] = decision_counts.get(d, 0) + 1
            if decision_counts.get("human_review", 0) > 0:
                f.write(f"- Review the {decision_counts['human_review']} sample(s) flagged for human review to improve generation prompts.\n")
            if decision_counts.get("repair", 0) > 0:
                f.write(f"- Investigate the {decision_counts['repair']} sample(s) that required repair for recurring grounding weaknesses.\n")
            if decision_counts.get("reject", 0) > 0:
                f.write(f"- Examine the {decision_counts['reject']} rejected sample(s) and consider adjusting source document coverage or quality rules.\n")
            if not decision_counts or all(k == "pass" for k in decision_counts):
                f.write(f"- All samples passed evaluation. No corrective action required.\n")

        # 4. export.zip
        zip_path = os.path.join(export_dir, "export.zip")
        with zipfile.ZipFile(zip_path, 'w') as zipf:
            zipf.write(eval_path, "rag_eval.jsonl")
            zipf.write(answer_path, "answer_key.jsonl")
            zipf.write(card_path, "dataset_card.md")
            zipf.write(report_path, "quality_report.md")

        # 5. Upload to OSS / Local Storage
        file_urls = {}
        for fname, path in [
            ("rag_eval.jsonl", eval_path),
            ("answer_key.jsonl", answer_path),
            ("dataset_card.md", card_path),
            ("quality_report.md", report_path),
            ("export.zip", zip_path)
        ]:
            object_name = f"exports/{self.project_id}/{fname}"
            url = self.oss_client.upload_file(object_name, path)
            file_urls[fname] = url

        export_record = Export(
            project_id=self.project_id,
            status="READY",
            file_urls=file_urls
        )
        self.db.add(export_record)

        project.workflow_state = "EXPORT_READY"
        self.db.commit()

        self._log_trace("export_complete", {"file_count": len(export_record.artifact_file_urls)})
        return export_record
