from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import BenchmarkPlan, Project

class IntakePlannerAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id)
        self.purpose = "Analyze the benchmark request and create a detailed plan."

    def run(self, benchmark_request: str, source_summary: str, source_warnings: List[str]) -> BenchmarkPlan:
        self._log_trace("start_planning", {"request": benchmark_request})

        prompt = f"""
        Create a detailed RAG benchmark plan based on this request:
        "{benchmark_request}"

        Source documents summary:
        "{source_summary}"

        Warnings: {source_warnings}

        Output JSON with these keys: goal, language, sample_count (dict with total, easy, medium, hard), categories (list), quality_rules (list).
        """

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Benchmark Planner. Output JSON.")

        plan = BenchmarkPlan(
            project_id=self.project_id,
            goal=response.get("goal", "Default goal"),
            language=response.get("language", "English"),
            sample_count=response.get("sample_count", {"total": 10, "easy": 5, "medium": 3, "hard": 2}),
            categories=response.get("categories", ["General"]),
            quality_rules=response.get("quality_rules", ["Must be grounded"]),
            source_summary=source_summary,
            source_warnings=source_warnings
        )
        self.db.add(plan)
        self.db.commit()

        self._log_trace("plan_created", {"plan_id": plan.id})
        return plan
