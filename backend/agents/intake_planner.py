from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import BenchmarkPlan, Project

class IntakePlannerAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id)
        self.purpose = "Analyze the benchmark request and create a detailed plan."

    def run(
        self,
        benchmark_request: str,
        source_summary: str,
        source_warnings: List[str],
        source_report: Dict[str, Any] = None
    ) -> BenchmarkPlan:
        self._log_trace("start_planning", {"request": benchmark_request})

        # Extract coverage information from the source report when available.
        # This allows the planner to explicitly reason about which categories
        # are well-supported and which pose data coverage risks.
        coverage_by_category = {}
        if source_report and isinstance(source_report, dict):
            coverage_by_category = source_report.get("coverage_by_category", {})

        high_coverage = [
            cat for cat, info in coverage_by_category.items()
            if info.get("coverage_level") in ("strong", "medium")
        ]
        low_coverage = [
            cat for cat, info in coverage_by_category.items()
            if info.get("coverage_level") == "weak"
        ]
        unsupported = [
            cat for cat, info in coverage_by_category.items()
            if info.get("coverage_level") == "unsupported"
        ]

        # Build a compact coverage block for the prompt only when data exists.
        coverage_block = ""
        if coverage_by_category:
            lines = ["Document coverage analysis (use this to calibrate sample allocation):"]
            for cat, info in coverage_by_category.items():
                level = info.get("coverage_level", "unknown")
                score = info.get("coverage_score", 0.0)
                lines.append(f"  - {cat}: {level} (score {score:.2f})")
            if high_coverage:
                lines.append(f"Strong/medium coverage areas (safe to allocate more samples): {high_coverage}")
            if low_coverage:
                lines.append(f"Weak coverage areas (reduce sample count to avoid redundant questions): {low_coverage}")
            if unsupported:
                lines.append(f"Unsupported categories (avoid or remove from plan): {unsupported}")
            coverage_block = "\n".join(lines)

        recommended_adjustments = []
        if source_report and isinstance(source_report, dict):
            recommended_adjustments = source_report.get("recommended_adjustments_to_plan", [])

        prompt = f"""
        Create a detailed RAG benchmark plan based on this request:
        "{benchmark_request}"

        Source documents summary:
        "{source_summary}"

        Warnings: {source_warnings}

        {coverage_block}

        Recommended adjustments from source analysis: {recommended_adjustments}

        Planning instructions:
        - Prioritize categories with strong or medium document coverage.
        - Reduce or eliminate samples for weak-coverage categories to avoid ungrounded questions.
        - Do NOT include unsupported categories unless explicitly required by the benchmark request.
        - Surface any mismatch between the benchmark goal and actual document coverage in quality_rules.

        Output JSON with these keys: goal, language, sample_count (dict with total, easy, medium, hard), categories (list), quality_rules (list).
        """

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Benchmark Planner. Output JSON.")

        proposed_categories = response.get("categories", ["General"])

        if coverage_by_category:
            supported_set = {
                cat for cat, info in coverage_by_category.items()
                if info.get("coverage_level") in ("strong", "medium", "weak")
            }
            filtered_categories = [c for c in proposed_categories if c in supported_set]

            if not filtered_categories:
                filtered_categories = [
                    cat for cat, info in coverage_by_category.items()
                    if info.get("coverage_level") in ("strong", "medium", "weak")
                ]
        else:
            filtered_categories = proposed_categories

        stripped_categories = [c for c in proposed_categories if c not in filtered_categories]

        plan = BenchmarkPlan(
            project_id=self.project_id,
            goal=response.get("goal", "Default goal"),
            language=response.get("language", "English"),
            sample_count=response.get("sample_count", {"total": 10, "easy": 5, "medium": 3, "hard": 2}),
            categories=filtered_categories,
            quality_rules=response.get("quality_rules", ["Answerable samples must be grounded in the source documents. Intentional unanswerable samples are allowed when clearly labeled as unanswerable and the expected answer states that the documents do not contain enough information."]),
            source_summary=source_summary,
            source_warnings=source_warnings
        )
        self.db.add(plan)
        self.db.commit()

        self._log_trace("plan_created", {"plan_id": plan.id})

        # Log planning_adjustments artifact so the workflow trace shows explicitly
        # how source coverage analysis influenced the resulting benchmark plan.
        from backend.services.workflow_logger import log_agent_artifact

        planning_adjustments_content = {
            "coverage_summary": {
                cat: {
                    "coverage_level": info.get("coverage_level"),
                    "coverage_score": info.get("coverage_score")
                }
                for cat, info in coverage_by_category.items()
            },
            "high_coverage_categories": high_coverage,
            "low_coverage_categories": low_coverage,
            "unsupported_categories": unsupported,
            "warnings_considered": list(source_warnings or []),
            "planning_adjustments": recommended_adjustments,
            "proposed_categories": proposed_categories,
            "stripped_categories": stripped_categories,
        }
        log_agent_artifact(
            db=self.db,
            project_id=self.project_id,
            artifact_type="planning_adjustments",
            title="Planning Adjustments",
            summary=(
                f"Planning used source coverage data for {len(coverage_by_category)} categories. "
                f"High/medium: {len(high_coverage)}, weak: {len(low_coverage)}, unsupported: {len(unsupported)}."
            ),
            content_json=planning_adjustments_content
        )

        return plan
