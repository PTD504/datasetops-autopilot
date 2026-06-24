import time
import re
import logging
from dataclasses import dataclass
from sqlalchemy.orm import Session
from backend.models import Sample
from backend.services.workflow_logger import log_tool_call

logger = logging.getLogger(__name__)

@dataclass
class DuplicateCheckResult:
    is_duplicate: bool
    duplicate_score: float       # 0.0 → 1.0
    duplicate_type: str          # "none" | "exact" | "lexical_near" | "pattern"
    matched_sample_id: str | None
    reason: str

class DuplicateCheckerTool:
    def __init__(self, db: Session, project_id: str):
        self.db = db
        self.project_id = project_id

    def check(
        self,
        candidate_question: str,
        candidate_source_chunk_ids: list[str],
        candidate_category: str,
        existing_samples: list[Sample] = None,
        existing_questions: list[str] = None
    ) -> DuplicateCheckResult:
        """
        Checks if candidate question/evidence pattern is duplicate of existing generated questions/samples.
        """
        start_time = time.time()
        status = "success"
        output_summary = ""

        try:
            if existing_samples is None:
                # Query all samples from DB except for uncommitted/dummy state, filter by project_id
                existing_samples = self.db.query(Sample).filter(Sample.project_id == self.project_id).all()

            def normalize(text: str) -> str:
                if not text:
                    return ""
                text = text.lower()
                text = re.sub(r'[^\w\s]', '', text)
                return " ".join(text.split())

            def get_jaccard_similarity(s1: str, s2: str) -> float:
                ns1 = normalize(s1)
                ns2 = normalize(s2)
                tokens1 = set(ns1.split())
                tokens2 = set(ns2.split())
                if not tokens1 and not tokens2:
                    return 1.0
                if not tokens1 or not tokens2:
                    return 0.0
                return len(tokens1.intersection(tokens2)) / len(tokens1.union(tokens2))

            best_score = 0.0
            best_type = "none"
            matched_sample_id = None
            reason = "No duplicate found."

            norm_candidate = normalize(candidate_question)
            candidate_chunks = set(candidate_source_chunk_ids or [])

            for sample in existing_samples:
                # 1. Exact normalized match
                norm_exist = normalize(sample.question)
                if norm_candidate == norm_exist:
                    best_score = 1.0
                    best_type = "exact"
                    matched_sample_id = sample.id
                    reason = f"Exact normalized match found with sample {sample.id}."
                    break

                # 2. Lexical near-duplicate Jaccard similarity
                jaccard_score = get_jaccard_similarity(candidate_question, sample.question)

                # 3. Same evidence pattern check
                sample_chunks = set(sample.source_chunk_ids or [])
                same_evidence = (candidate_chunks == sample_chunks) and (candidate_category == sample.category)

                sample_score = 0.0
                sample_type = "none"

                if jaccard_score >= 0.82:
                    sample_score = jaccard_score
                    sample_type = "lexical_near"

                if same_evidence:
                    # same evidence pattern score = 0.85
                    if 0.85 > sample_score:
                        sample_score = 0.85
                        sample_type = "pattern"

                if sample_score > best_score:
                    best_score = sample_score
                    best_type = sample_type
                    matched_sample_id = sample.id
                    if sample_type == "lexical_near":
                        reason = f"Lexical near-duplicate found with sample {sample.id} (Jaccard similarity: {jaccard_score:.2f})."
                    elif sample_type == "pattern":
                        reason = f"Same evidence pattern found with sample {sample.id} (same category and chunk IDs)."

            is_duplicate = best_score >= 0.92

            result = DuplicateCheckResult(
                is_duplicate=is_duplicate,
                duplicate_score=best_score,
                duplicate_type=best_type,
                matched_sample_id=matched_sample_id,
                reason=reason
            )

            output_summary = f"Result: is_duplicate={is_duplicate}, score={best_score:.2f}, type={best_type}, matched={matched_sample_id}"
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
                tool_name="DuplicateCheckerTool.check",
                input_summary=f"Candidate: '{candidate_question[:50]}...'",
                output_summary=output_summary,
                status=status,
                latency_ms=latency_ms
            )
