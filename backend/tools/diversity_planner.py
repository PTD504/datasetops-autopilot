import time
import logging
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models import BenchmarkPlan

logger = logging.getLogger(__name__)

class DiversityPlannerTool:
    def __init__(self, db: Session, project_id: str, retriever=None):
        self.db = db
        self.project_id = project_id
        self.retriever = retriever

    def plan_slots(self, plan: BenchmarkPlan, source_report: Dict[str, Any] = None, count: int = 10) -> Dict[str, Any]:
        """
        Converts approved benchmark plan + source coverage report into structured sample slots.
        """
        from backend.services.workflow_logger import log_tool_call

        start_time = time.time()
        status = "success"
        output_summary = ""

        try:
            # 1. Resolve source coverage mapping
            coverage = {}
            if source_report and isinstance(source_report, dict):
                coverage = source_report.get("coverage_by_category", {})
                if not isinstance(coverage, dict):
                    coverage = {}

            # Helper to assign score to levels for sorting
            def level_score(lvl: str) -> int:
                return {"strong": 4, "medium": 3, "weak": 2, "unsupported": 1}.get(lvl, 3)

            # Sort categories by coverage level and score descending (alphabetical ascending for tie-break)
            categories_sorted = sorted(
                plan.categories,
                key=lambda c: (
                    -level_score(coverage.get(c, {}).get("coverage_level", "strong")),
                    -coverage.get(c, {}).get("coverage_score", 1.0),
                    c
                )
            )

            if not categories_sorted:
                categories_sorted = ["general"]

            # 2. Distribute difficulties
            easy_count = 0
            medium_count = 0
            hard_count = 0
            if plan.sample_count and isinstance(plan.sample_count, dict):
                easy_count = plan.sample_count.get("easy", 0)
                medium_count = plan.sample_count.get("medium", 0)
                hard_count = plan.sample_count.get("hard", 0)

            total_dist = easy_count + medium_count + hard_count
            if total_dist == 0:
                easy_count = count // 3
                medium_count = count // 3
                hard_count = count - (easy_count + medium_count)
            elif total_dist != count:
                factor = count / total_dist
                easy_count = int(round(easy_count * factor))
                medium_count = int(round(medium_count * factor))
                hard_count = count - (easy_count + medium_count)
                if hard_count < 0:
                    hard_count = 0
                    medium_count = count - easy_count

            difficulties_list = ["easy"] * easy_count + ["medium"] * medium_count + ["hard"] * hard_count
            if len(difficulties_list) < count:
                difficulties_list.extend(["medium"] * (count - len(difficulties_list)))
            else:
                difficulties_list = difficulties_list[:count]

            # 3. Sample types
            sample_types = ["single_hop", "multi_hop", "unanswerable", "edge_case"]

            # 4. Generate structured slots
            slots = []
            category_counts = {}
            difficulty_counts = {}
            sample_type_counts = {}
            warnings_set = set()
            retrieved_cache = {}

            for i in range(count):
                slot_id = f"slot_{i+1:03d}"
                category = categories_sorted[i % len(categories_sorted)]
                difficulty = difficulties_list[i]
                sample_type = sample_types[i % len(sample_types)]

                # Accumulate counts
                category_counts[category] = category_counts.get(category, 0) + 1
                difficulty_counts[difficulty] = difficulty_counts.get(difficulty, 0) + 1
                sample_type_counts[sample_type] = sample_type_counts.get(sample_type, 0) + 1

                # Set question type, target reasoning, and evidence count based on sample type
                if sample_type == "single_hop":
                    question_type = "policy_lookup"
                    target_reasoning = "Find a direct answer from one policy chunk."
                    required_evidence_count = 1
                elif sample_type == "multi_hop":
                    question_type = "multi_policy_synthesis"
                    target_reasoning = "Combine information from multiple policy chunks to answer."
                    required_evidence_count = 2
                elif sample_type == "unanswerable":
                    question_type = "out_of_scope_query"
                    target_reasoning = "Identify that the question is not answerable from the text. Answerability: unanswerable_from_sources. Expected behavior: model should refuse or state insufficient information."
                    required_evidence_count = 1
                elif sample_type == "edge_case":
                    question_type = "ambiguous_boundary"
                    target_reasoning = "Resolve an ambiguous case, exception, or boundary condition."
                    required_evidence_count = 1
                else:
                    question_type = "general_query"
                    target_reasoning = "Answer the question based on context."
                    required_evidence_count = 1

                # Chunks retrieval
                matching_chunk_ids = coverage.get(category, {}).get("matching_chunk_ids", [])
                if not matching_chunk_ids and self.retriever:
                    if category not in retrieved_cache:
                        try:
                            retrieved = self.retriever.retrieve(self.project_id, category, top_k=5)
                            retrieved_cache[category] = [c["id"] for c in retrieved] if retrieved else []
                        except Exception as e:
                            logger.error(f"Error retrieving chunks in DiversityPlannerTool: {e}")
                            retrieved_cache[category] = []
                    matching_chunk_ids = retrieved_cache[category]

                # Slice chunks deterministically
                preferred_chunk_ids = []
                if matching_chunk_ids:
                    if required_evidence_count == 1:
                        preferred_chunk_ids = [matching_chunk_ids[i % len(matching_chunk_ids)]]
                    elif required_evidence_count == 2:
                        if len(matching_chunk_ids) >= 2:
                            preferred_chunk_ids = [
                                matching_chunk_ids[i % len(matching_chunk_ids)],
                                matching_chunk_ids[(i + 1) % len(matching_chunk_ids)]
                            ]
                        else:
                            preferred_chunk_ids = [matching_chunk_ids[0]]

                # Warnings & notes
                notes = []
                source_coverage_level = coverage.get(category, {}).get("coverage_level", "strong")
                if source_coverage_level == "weak":
                    note = f"Warning: Category '{category}' has weak coverage in source documents. Generated question might be less specific or harder to ground."
                    notes.append(note)
                    warnings_set.add(note)
                elif source_coverage_level == "unsupported":
                    note = f"Warning: Category '{category}' is unsupported by source documents. Generated question may be ungrounded or require human review."
                    notes.append(note)
                    warnings_set.add(note)

                avoid_topics = [f"do not repeat generic {category} questions or basic definitions"]

                slots.append({
                    "slot_id": slot_id,
                    "category": category,
                    "difficulty": difficulty,
                    "sample_type": sample_type,
                    "question_type": question_type,
                    "target_reasoning": target_reasoning,
                    "required_evidence_count": required_evidence_count,
                    "preferred_chunk_ids": preferred_chunk_ids,
                    "source_coverage_level": source_coverage_level,
                    "avoid_topics": avoid_topics,
                    "notes": notes
                })

            summary = {
                "total_slots": count,
                "category_counts": category_counts,
                "difficulty_counts": difficulty_counts,
                "sample_type_counts": sample_type_counts,
                "warnings": list(warnings_set)
            }

            result = {
                "slots": slots,
                "summary": summary
            }

            output_summary = f"Planned {count} slots successfully."
            return result

        except Exception as e:
            status = "error"
            output_summary = f"Error: {str(e)}"
            raise e
        finally:
            latency_ms = int((time.time() - start_time) * 1000)
            log_tool_call(
                db=self.db,
                project_id=self.project_id,
                tool_name="DiversityPlannerTool.plan_slots",
                input_summary=f"Plan count: {count}, categories: {plan.categories}",
                output_summary=output_summary[:200],
                status=status,
                latency_ms=latency_ms
            )
