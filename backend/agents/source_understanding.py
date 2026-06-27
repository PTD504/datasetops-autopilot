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

    def run_document_understanding(
        self,
        docs: List[Any] = None,
        chunks: List[Any] = None
    ) -> Dict[str, Any]:
        self._log_trace("start_document_understanding", {})

        if docs is None:
            docs = self.db.query(Document).filter(Document.project_id == self.project_id).all()
        if chunks is None:
            chunks = self.db.query(Chunk).filter(Chunk.project_id == self.project_id).all()

        if not docs:
            return {
                "summary": "No documents found.",
                "warnings": ["No documents uploaded."],
                "report": {
                    "document_summaries": [],
                    "strong_sections": [],
                    "weak_sections": [],
                    "unsupported_content": [],
                    "source_warnings": ["No documents uploaded."]
                }
            }

        document_summaries = []
        for doc in docs:
            doc_id = get_field(doc, "id")
            doc_chunks = [c for c in chunks if get_field(c, "document_id") == doc_id]
            document_summaries.append({
                "document_id": doc_id,
                "filename": get_field(doc, "filename"),
                "chunk_count": len(doc_chunks)
            })

        if not chunks:
            return {
                "summary": "Documents found but no chunks generated.",
                "warnings": ["No document chunks available."],
                "report": {
                    "document_summaries": document_summaries,
                    "strong_sections": [],
                    "weak_sections": [],
                    "unsupported_content": [],
                    "source_warnings": ["No document chunks available."]
                }
            }

        max_chars = 150000
        combined_text = ""
        for chunk in chunks:
            text = get_field(chunk, "text") or ""
            if len(combined_text) + len(text) < max_chars:
                combined_text += f"\n--- Chunk index {get_field(chunk, 'index')} ---\n{text}"
            else:
                combined_text += f"\n--- [Truncated due to context limit] ---"
                break

        prompt = f"""
        Analyze the following document chunks and provide a high-level summary and analysis of the content.
        
        Document Content:
        {combined_text}
        
        Analyze:
        1. An overall summary of the uploaded documents.
        2. Strong sections: areas or topics that are covered in-depth and have abundant information.
        3. Weak sections: areas or topics that are mentioned but lack detail or have gaps.
        4. Unsupported content: key topics or RAG evaluation areas that are completely missing or not supported by these documents.
        5. Document warnings: any issues with the document quality, formatting, or size.
        
        Output JSON with these keys:
        - "summary": string (a concise summary of the documents)
        - "strong_sections": list of strings (topics/areas well covered)
        - "weak_sections": list of strings (topics/areas poorly covered)
        - "unsupported_content": list of strings (topics/areas completely missing)
        - "warnings": list of strings (issues/warnings about the documents)
        """
        
        try:
            response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG analyst. Analyze the document chunks and output JSON format.")
            summary = response.get("summary", f"Analyzed {len(docs)} documents containing {len(chunks)} chunks.")
            strong_sections = response.get("strong_sections", [])
            weak_sections = response.get("weak_sections", [])
            unsupported_content = response.get("unsupported_content", [])
            warnings = response.get("warnings", [])
        except Exception as e:
            logger.error(f"Error during document understanding LLM call: {e}")
            summary = f"Analyzed {len(docs)} documents containing {len(chunks)} chunks."
            strong_sections = ["General document content exists."]
            weak_sections = []
            unsupported_content = []
            warnings = []

        if len(chunks) < 5:
            warnings.append("Very few chunks available. Benchmark diversity may be low.")

        return {
            "summary": summary,
            "warnings": warnings,
            "report": {
                "document_summaries": document_summaries,
                "strong_sections": strong_sections,
                "weak_sections": weak_sections,
                "unsupported_content": unsupported_content,
                "source_warnings": warnings
            }
        }

    def run_coverage_audit(
        self,
        chunks: List[Any],
        categories: List[str],
        doc_understanding: Dict[str, Any],
        db=None,
        project_id: str = None
    ) -> Dict[str, Any]:
        self._log_trace("start_coverage_audit", {"categories": categories})

        from backend.core.config import settings

        # Use SemanticRetriever when a real DB session and project_id are provided
        # and we are not in mock mode. Otherwise fall back to verbatim string matching.
        use_semantic = (
            db is not None
            and project_id is not None
            and not (settings.effective_mock_llm or not settings.QWEN_API_KEY)
        )

        if use_semantic:
            from backend.pipeline.retriever import SemanticRetriever
            semantic_retriever = SemanticRetriever(db)

        def normalize_text(text: str) -> str:
            if not text:
                return ""
            t = text.lower()
            for char in ".,!?;:()[]{}'\"`*_-/":
                t = t.replace(char, " ")
            return " ".join(t.split())

        coverage_by_category = {}
        unsupported_categories = []
        warnings = []
        recommended_adjustments = []

        for cat in categories:
            if use_semantic:
                # Semantic path: retrieve top-10 chunks closest to the category name.
                retrieved = semantic_retriever.retrieve(project_id, cat, top_k=10)
                # Build a pseudo-chunk list from retrieval results so the scoring
                # block below works identically for both paths.
                matching_chunks = [
                    type("_C", (), {
                        "id": r["id"],
                        "document_id": r["document_id"],
                        "text": r["text"],
                    })()
                    for r in retrieved
                    if r.get("score", 0) > 0.5  # cosine similarity threshold
                ]
            else:
                # Naive path: verbatim normalized string matching (original logic).
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

                # Frequency/density bonus (not applicable for semantic path; always 0)
                freq_bonus = 0.0
                if not use_semantic:
                    norm_cat = normalize_text(cat)
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

            if level == "weak":
                warnings.append(f"Category '{cat}' has weak coverage in source documents.")
                recommended_adjustments.append(f"Consolidate or reduce sample count for weak category '{cat}' to avoid redundant questions.")
            elif level == "unsupported":
                unsupported_categories.append(cat)
                warnings.append(f"Category '{cat}' is unsupported by the uploaded documents.")
                recommended_adjustments.append(f"Remove unsupported category '{cat}' from the benchmark plan or upload documents covering this topic.")

        if categories:
            avg_score = sum(coverage_by_category[cat]["coverage_score"] for cat in categories) / len(categories)
        else:
            avg_score = 0.0
        confidence_score = round(avg_score, 2)

        report_data = doc_understanding.get("report") if "report" in doc_understanding else doc_understanding
        if not report_data or not isinstance(report_data, dict):
            report_data = {}

        combined_warnings = list(report_data.get("source_warnings", [])) + warnings

        report = {
            "document_summaries": report_data.get("document_summaries", []),
            "strong_sections": report_data.get("strong_sections", []),
            "weak_sections": report_data.get("weak_sections", []),
            "unsupported_content": report_data.get("unsupported_content", []),
            "coverage_by_category": coverage_by_category,
            "unsupported_categories": unsupported_categories,
            "source_warnings": combined_warnings,
            "recommended_adjustments_to_plan": recommended_adjustments,
            "confidence_score": confidence_score
        }

        summary = f"Analyzed {len(report['document_summaries'])} documents containing {len(chunks)} chunks. Overall source coverage confidence is {int(confidence_score * 100)}%."

        return {
            "summary": summary,
            "warnings": combined_warnings,
            "report": report
        }

    def run(
        self,
        docs: List[Any] = None,
        chunks: List[Any] = None,
        benchmark_request: str = None,
        plan_categories: List[str] = None
    ) -> Dict[str, Any]:
        self._log_trace("start_source_analysis", {})

        if docs is None:
            docs = self.db.query(Document).filter(Document.project_id == self.project_id).all()
        if chunks is None:
            chunks = self.db.query(Chunk).filter(Chunk.project_id == self.project_id).all()

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

        if benchmark_request is None:
            project = self.db.query(Project).filter(Project.id == self.project_id).first()
            benchmark_request = project.benchmark_request if project else ""
        if plan_categories is None:
            plan = self.db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == self.project_id).first()
            if plan and plan.categories:
                plan_categories = plan.categories

        doc_under = self.run_document_understanding(docs, chunks)
        categories = plan_categories if plan_categories else self._extract_categories_from_request(benchmark_request)
        
        result = self.run_coverage_audit(chunks, categories, doc_under)
        self._log_trace("source_analysis_complete", {"summary": result["summary"], "warnings": result["warnings"], "report": result["report"]})
        return result
