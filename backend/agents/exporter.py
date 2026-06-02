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
            f.write(f"Goal: {plan.goal if plan else 'N/A'}\n")
            f.write(f"Language: {plan.language if plan else 'N/A'}\n")
            f.write(f"Total Samples: {len(samples)}\n")

        # 3. quality_report.md
        report_path = os.path.join(export_dir, "quality_report.md")
        with open(report_path, "w") as f:
            f.write("# Quality Report\n\nAll approved samples met the quality thresholds.\n")

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
