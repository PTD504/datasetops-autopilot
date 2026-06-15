from typing import Dict, Any, Tuple, List
import logging
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import Chunk, Document, Project, BenchmarkPlan

logger = logging.getLogger(__name__)

def get_field(item: Any, field_name: str, default: Any = None) -> Any:
    if isinstance(item, dict):
        return item.get(field_name, default)
    return getattr(item, field_name, default)

class SourceUnderstandingAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id)
        self.purpose = "Analyze parsed source documents and provide a summary and warnings."

    def _extract_categories_from_request(self, benchmark_request: str) -> List[str]:
        if not benchmark_request:
            return ["general", "specific"]

        # 1. Try deterministic lightweight matching from benchmark_request first
        req_lower = benchmark_request.lower()
        extracted_categories = []
        if "refund" in req_lower or "hoàn tiền" in req_lower:
            extracted_categories.append("refund policy")
        if "shipping" in req_lower or "vận chuyển" in req_lower:
            extracted_categories.append("shipping policy")
        if "warranty" in req_lower or "bảo hành" in req_lower:
            extracted_categories.append("warranty")
        if "cancellation" in req_lower or "hủy đơn" in req_lower:
            extracted_categories.append("order cancellation")
        if "payment" in req_lower or "thanh toán" in req_lower:
            extracted_categories.append("payment policy")

        if extracted_categories:
            return extracted_categories

        # 2. Fall back to LLM category extraction
        prompt = f"""
        Extract a list of distinct benchmark evaluation categories (topics, domains, or themes) from this benchmark request:
        "{benchmark_request}"
        
        Output JSON with a single key "categories" (list of strings).
        """
        try:
            response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG analyst. Extract categories in JSON format.")
            categories = response.get("categories", ["general", "specific"])
            if not isinstance(categories, list):
                categories = ["general", "specific"]
            categories = [str(c).strip() for c in categories if c]
            if not categories:
                categories = ["general", "specific"]
            return categories
        except Exception as e:
            logger.error(f"Error extracting categories from request: {e}")
            return ["general", "specific"]

    def run(
        self,
        docs: List[Any] = None,
        chunks: List[Any] = None,
        benchmark_request: str = None,
        plan_categories: List[str] = None
    ) -> Dict[str, Any]:
        self._log_trace("start_source_analysis", {})

        # Query from DB if not passed
        if docs is None:
            docs = self.db.query(Document).filter(Document.project_id == self.project_id).all()
        if chunks is None:
            chunks = self.db.query(Chunk).filter(Chunk.project_id == self.project_id).all()
        if benchmark_request is None:
            project = self.db.query(Project).filter(Project.id == self.project_id).first()
            benchmark_request = project.benchmark_request if project else ""
        if plan_categories is None:
            plan = self.db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == self.project_id).first()
            if plan and plan.categories:
                plan_categories = plan.categories

        if not docs:
            report = {
                "document_summaries": [],
                "coverage_by_category": {},
                "strong_sections": [],
                "weak_sections": [],
                "unsupported_categories": [],
                "source_warnings": ["No documents uploaded."],
                "recommended_adjustments_to_plan": ["Please upload source documents before starting."],
                "confidence_score": 0.0
            }
            summary = "No documents found."
            warnings = ["No documents uploaded."]
            self._log_trace("source_analysis_complete", {"summary": summary, "warnings": warnings, "report": report})
            return {
                "summary": summary,
                "warnings": warnings,
                "report": report
            }

        # Resolve the categories to check coverage for
        categories = plan_categories if plan_categories else self._extract_categories_from_request(benchmark_request)

        # Document summaries without exposing raw text
        document_summaries = []
        for doc in docs:
            doc_id = get_field(doc, "id")
            doc_chunks = [c for c in chunks if get_field(c, "document_id") == doc_id]
            document_summaries.append({
                "document_id": doc_id,
                "filename": get_field(doc, "filename"),
                "chunk_count": len(doc_chunks)
            })

        # Heuristic coverage auditing
        coverage_by_category = {}
        strong_sections = []
        weak_sections = []
        unsupported_categories = []
        warnings = []
        recommended_adjustments = []

        def normalize_text(text: str) -> str:
            if not text:
                return ""
            t = text.lower()
            for char in ".,!?;:()[]{}'\"`*_-/":
                t = t.replace(char, " ")
            return " ".join(t.split())

        for cat in categories:
            norm_cat = normalize_text(cat)
            matching_chunks = []
            for c in chunks:
                norm_chunk = normalize_text(get_field(c, "text"))
                if norm_cat in norm_chunk:
                    matching_chunks.append(c)

            num_chunks = len(matching_chunks)
            if num_chunks == 0:
                score = 0.0
            else:
                if num_chunks == 1:
                    base_score = 0.3
                elif num_chunks == 2:
                    base_score = 0.6
                else:
                    base_score = 0.8

                # Unique documents bonus
                unique_doc_ids = {get_field(c, "document_id") for c in matching_chunks if get_field(c, "document_id")}
                doc_bonus = 0.1 if len(unique_doc_ids) > 1 else 0.0

                # Frequency/density bonus
                freq_count = 0
                for c in matching_chunks:
                    norm_chunk = normalize_text(get_field(c, "text"))
                    freq_count += norm_chunk.count(norm_cat)
                freq_bonus = min(0.1, max(0.0, (freq_count - 1) * 0.05))

                score = min(1.0, base_score + doc_bonus + freq_bonus)
                score = round(score, 2)

            # Map score to level
            if score >= 0.8:
                level = "strong"
            elif score >= 0.5:
                level = "medium"
            elif score >= 0.2:
                level = "weak"
            else:
                level = "unsupported"

            matching_chunk_ids = [get_field(c, "id") for c in matching_chunks]
            # Concise evidence summaries (only the first 120 characters, sanitized of extra whitespace)
            matching_snippets = []
            for c in matching_chunks:
                text_content = get_field(c, "text") or ""
                clean_chunk = " ".join(text_content.split())
                snippet = clean_chunk[:120] + "..." if len(clean_chunk) > 120 else clean_chunk
                matching_snippets.append(snippet)

            coverage_by_category[cat] = {
                "coverage_level": level,
                "coverage_score": score,
                "matching_chunk_ids": matching_chunk_ids,
                "matching_snippets": matching_snippets
            }

            if level == "strong":
                strong_sections.append(f"Category '{cat}' is well supported by matching chunks.")
            elif level == "medium":
                strong_sections.append(f"Category '{cat}' has moderate support from matching chunks.")
            elif level == "weak":
                weak_sections.append(f"Category '{cat}' has weak support (only {num_chunks} chunk).")
                warnings.append(f"Category '{cat}' has weak coverage in source documents.")
                recommended_adjustments.append(f"Consolidate or reduce sample count for weak category '{cat}' to avoid redundant questions.")
            elif level == "unsupported":
                unsupported_categories.append(cat)
                warnings.append(f"Category '{cat}' is unsupported by the uploaded documents.")
                recommended_adjustments.append(f"Remove unsupported category '{cat}' from the benchmark plan or upload documents covering this topic.")

        # General warnings
        if len(chunks) < 5:
            warnings.append("Very few chunks available. Benchmark diversity may be low.")
            recommended_adjustments.append("Reduce overall benchmark sample size or upload more diverse source documents.")

        # Confidence score
        if categories:
            avg_score = sum(coverage_by_category[cat]["coverage_score"] for cat in categories) / len(categories)
        else:
            avg_score = 0.0
        confidence_score = round(avg_score, 2)

        report = {
            "document_summaries": document_summaries,
            "coverage_by_category": coverage_by_category,
            "strong_sections": strong_sections,
            "weak_sections": weak_sections,
            "unsupported_categories": unsupported_categories,
            "source_warnings": warnings,
            "recommended_adjustments_to_plan": recommended_adjustments,
            "confidence_score": confidence_score
        }

        summary = f"Analyzed {len(docs)} documents containing {len(chunks)} chunks. Overall source coverage confidence is {int(confidence_score * 100)}%."

        self._log_trace("source_analysis_complete", {"summary": summary, "warnings": warnings, "report": report})

        return {
            "summary": summary,
            "warnings": warnings,
            "report": report
        }
