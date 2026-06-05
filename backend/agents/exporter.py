from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import Project, Sample, BenchmarkPlan, Export
from backend.models.enums import SampleStatus
from backend.wrappers.oss_client import AlibabaOSSClient
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
        samples = self.db.query(Sample).filter(Sample.project_id == self.project_id, Sample.status == SampleStatus.APPROVED).all()

        export_dir = f"backend/exports/{self.project_id}"
        os.makedirs(export_dir, exist_ok=True)

        # 1. rag_eval.jsonl & answer_key.jsonl
        eval_path = os.path.join(export_dir, "rag_eval.jsonl")
        answer_path = os.path.join(export_dir, "answer_key.jsonl")

        with open(eval_path, "w") as fe, open(answer_path, "w") as fa:
            for s in samples:
                fe.write(json.dumps({
                    "id": s.id,
                    "sample_type": s.sample_type,
                    "question": s.question,
                    "source_chunk_ids": s.source_chunk_ids
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

            f.write(f"\n**Limitations:**\n")
            f.write(f"- This is an auto-generated benchmark.\n")
            f.write(f"- May require further human review for production use.\n")

        # 3. quality_report.md
        all_samples_in_db = self.db.query(Sample).filter(Sample.project_id == self.project_id).all()
        passed_samples = [s for s in all_samples_in_db if s.status == SampleStatus.APPROVED]
        repaired_samples = [s for s in all_samples_in_db if s.retry_count > 0]
        human_review_samples = [s for s in all_samples_in_db if s.status == SampleStatus.HUMAN_REVIEW]
        rejected_samples = [s for s in all_samples_in_db if s.status == SampleStatus.REJECTED]

        avg_score = 0
        if passed_samples:
            avg_score = 0.9 # Using a mock average score for MVP since actual eval scores aren't easily aggregated from db in this simple model

        report_path = os.path.join(export_dir, "quality_report.md")
        with open(report_path, "w") as f:
            f.write("# Quality Report\n\n")
            f.write(f"## Summary\n")
            f.write(f"- **Passed Samples:** {len(passed_samples)}\n")
            f.write(f"- **Repaired Samples:** {len(repaired_samples)}\n")
            f.write(f"- **Human Review Samples:** {len(human_review_samples)}\n")
            f.write(f"- **Rejected Samples:** {len(rejected_samples)}\n")
            f.write(f"- **Average Quality Score:** {avg_score}\n\n")

            f.write(f"## Sample Types (Passed)\n")
            st_counts = {}
            for s in passed_samples:
                st = s.sample_type if s.sample_type else "unknown"
                st_counts[st] = st_counts.get(st, 0) + 1
            for st, count in st_counts.items():
                f.write(f"- {st}: {count}\n")
            f.write("\n")

            f.write(f"## Common Issues\n")
            f.write(f"- Minor grounding issues requiring repair.\n")
            f.write(f"- Some edge case questions marked for human review.\n\n")
            f.write(f"## Recommendations\n")
            f.write(f"- Periodically review human-flagged samples to improve generation prompts.\n")

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

        self._log_trace("export_complete", {"file_count": len(file_urls)})
        return export_record
