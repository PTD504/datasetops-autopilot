import time
import re
import logging
from dataclasses import dataclass
from sqlalchemy.orm import Session
from backend.services.workflow_logger import log_tool_call

logger = logging.getLogger(__name__)

@dataclass 
class EvidencePack:
    slot_id: str
    primary_chunks: list[dict]    # chunk dicts với id, text, score
    supporting_chunks: list[dict] # optional additional context
    evidence_summary: str         # short human-readable summary of what evidence covers
    total_tokens_estimate: int
    coverage_notes: str           # e.g. "Strong coverage for refund deadline, weak for exception cases"

class EvidenceAssemblerTool:
    def __init__(self, db: Session, project_id: str):
        self.db = db
        self.project_id = project_id

    def assemble(self, slot: dict, retrieved_chunks: list[dict]) -> EvidencePack:
        """
        Assembles evidence chunks for a slot, including preferred chunks, supporting chunks,
        deduplicating them using Jaccard sentence overlap, and formatting summaries and token estimates.
        """
        start_time = time.time()
        status = "success"
        output_summary = ""

        try:
            slot_id = slot.get("slot_id")
            preferred_ids = slot.get("preferred_chunk_ids") or []
            required_evidence_count = slot.get("required_evidence_count", 1)
            sample_type = slot.get("sample_type", "single_hop")
            category = slot.get("category", "general")
            coverage_level = slot.get("source_coverage_level", "strong")

            # 1. Resolve preferred chunk ids
            retrieved_by_id = {c["id"]: c for c in retrieved_chunks}
            primary_chunks = []
            
            for pid in preferred_ids:
                if pid in retrieved_by_id:
                    # Make sure score is present
                    chunk_dict = retrieved_by_id[pid].copy()
                    if "score" not in chunk_dict:
                        chunk_dict["score"] = 1.0  # high fallback score for preferred chunks
                    primary_chunks.append(chunk_dict)
                else:
                    # Query from DB if db is available and we can find it
                    from backend.models import Chunk
                    chunk_obj = self.db.query(Chunk).filter(Chunk.id == pid).first()
                    if chunk_obj:
                        primary_chunks.append({
                            "id": chunk_obj.id,
                            "document_id": chunk_obj.document_id,
                            "text": chunk_obj.text,
                            "score": 1.0
                        })

            # Missing preferred_chunk_ids fallback
            if not primary_chunks and retrieved_chunks:
                for chunk in retrieved_chunks[:required_evidence_count]:
                    chunk_dict = chunk.copy()
                    if "score" not in chunk_dict:
                        chunk_dict["score"] = 0.5
                    primary_chunks.append(chunk_dict)

            # 2. Support chunks for multi_hop
            supporting_chunks = []
            if sample_type == "multi_hop" or required_evidence_count >= 2:
                primary_ids = {c["id"] for c in primary_chunks}
                for chunk in retrieved_chunks:
                    if chunk["id"] not in primary_ids:
                        score = chunk.get("score", 0.0)
                        if score > 0.3:
                            chunk_dict = chunk.copy()
                            if "score" not in chunk_dict:
                                chunk_dict["score"] = score
                            supporting_chunks.append(chunk_dict)

            # 3. Deduplication: text overlap > 70% (Jaccard on sentences)
            def get_sentence_jaccard_overlap(t1: str, t2: str) -> float:
                sents1 = set([s.strip().lower() for s in re.split(r'[.?!]', t1) if s.strip()])
                sents2 = set([s.strip().lower() for s in re.split(r'[.?!]', t2) if s.strip()])
                if not sents1 and not sents2:
                    return 1.0
                if not sents1 or not sents2:
                    return 0.0
                return len(sents1.intersection(sents2)) / len(sents1.union(sents2))

            # Combine pool
            all_pool = []
            for c in primary_chunks:
                all_pool.append((c, True))
            for c in supporting_chunks:
                all_pool.append((c, False))

            to_keep = []
            for chunk, is_primary in all_pool:
                dup_found = False
                for idx, (kept_chunk, kept_is_primary) in enumerate(to_keep):
                    overlap = get_sentence_jaccard_overlap(chunk["text"], kept_chunk["text"])
                    if overlap > 0.70:
                        dup_found = True
                        score_curr = chunk.get("score", 0.0)
                        score_kept = kept_chunk.get("score", 0.0)
                        if score_curr > score_kept:
                            to_keep[idx] = (chunk, is_primary)
                        break
                if not dup_found:
                    to_keep.append((chunk, is_primary))

            primary_chunks = [c for c, is_prim in to_keep if is_prim]
            supporting_chunks = [c for c, is_prim in to_keep if not is_prim]

            # 4. Cap total chunks: primary + supporting <= 5
            if len(primary_chunks) > 5:
                primary_chunks = primary_chunks[:5]
                supporting_chunks = []
            elif len(primary_chunks) + len(supporting_chunks) > 5:
                supporting_chunks = supporting_chunks[:5 - len(primary_chunks)]

            # 5. Generate evidence_summary: concatenate texts (truncated to 200 chars each)
            summary_parts = []
            for c in primary_chunks + supporting_chunks:
                text = c["text"]
                truncated = text[:200] + "..." if len(text) > 200 else text
                summary_parts.append(truncated)
            evidence_summary = " | ".join(summary_parts)

            # 6. Estimate token count
            total_tokens_estimate = int(sum(len(c["text"].split()) * 1.3 for c in primary_chunks + supporting_chunks))

            # 7. Coverage notes
            coverage_notes = f"{coverage_level.capitalize()} coverage for category '{category}'."
            if coverage_level == "weak":
                coverage_notes += " Warning: weak coverage in source documents."
            elif coverage_level == "unsupported":
                coverage_notes += " Warning: category is unsupported by source documents."

            result = EvidencePack(
                slot_id=slot_id,
                primary_chunks=primary_chunks,
                supporting_chunks=supporting_chunks,
                evidence_summary=evidence_summary,
                total_tokens_estimate=total_tokens_estimate,
                coverage_notes=coverage_notes
            )

            output_summary = f"Slot {slot_id}: {len(primary_chunks)} primary, {len(supporting_chunks)} supporting chunks. Total tokens: {total_tokens_estimate}"
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
                tool_name="EvidenceAssemblerTool.assemble",
                input_summary=f"Slot ID: {slot.get('slot_id')}, category: {slot.get('category')}",
                output_summary=output_summary,
                status=status,
                latency_ms=latency_ms
            )
