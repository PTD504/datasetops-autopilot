from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import BenchmarkPlan, Sample
from backend.pipeline.retriever import NaiveRetriever
from backend.models.enums import SampleStatus

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import BenchmarkPlan, Sample
from backend.pipeline.retriever import NaiveRetriever
from backend.models.enums import SampleStatus

class BenchmarkGeneratorAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id)
        self.purpose = "Generate benchmark samples based on the plan and source documents."
        self.retriever = NaiveRetriever(db)
        self._samples = []

    def generate(self, plan: BenchmarkPlan, count: int, mode: str = "generation", sample: Sample = None) -> List[Sample]:
        self._log_trace(f"start_generation_{mode}", {"count": count})

        from backend.core.config import settings

        # Determine target difficulties to generate
        easy_count = 0
        medium_count = 0
        hard_count = 0
        
        if plan.sample_count and isinstance(plan.sample_count, dict):
            easy_count = plan.sample_count.get("easy", 0)
            medium_count = plan.sample_count.get("medium", 0)
            hard_count = plan.sample_count.get("hard", 0)
            
        # Fallback if counts are empty or sum doesn't match count
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

        target_difficulties = ["easy"] * easy_count + ["medium"] * medium_count + ["hard"] * hard_count
        # Ensure target_difficulties length is exactly count
        if len(target_difficulties) < count:
            target_difficulties.extend(["medium"] * (count - len(target_difficulties)))
        else:
            target_difficulties = target_difficulties[:count]

        # Retrieve a larger pool of chunks to allow context variation
        all_chunks = self.retriever.retrieve(self.project_id, " ".join(plan.categories), top_k=15)
        # Fallback context/chunks in case loop doesn't vary
        chunks = all_chunks[:5] if len(all_chunks) >= 5 else all_chunks
        context = "\n".join([f"[{c['id']}] {c['text']}" for c in chunks])

        if mode == "repair" and sample:
             prompt = f"""
             Repair this sample based on evaluator feedback.
             Original Question: {sample.question}
             Original Answer: {sample.expected_answer}
             Original Sample Type: {sample.sample_type}
             Context: {context}
             Output JSON with: category, difficulty, sample_type, question, expected_answer, source_chunk_ids.
             Ensure sample_type is one of: single_hop, multi_hop, unanswerable, edge_case.
             - single_hop: question can be answered from one strong evidence chunk.
             - multi_hop: question requires combining information from at least two source chunks.
             - unanswerable: question is relevant to the domain but cannot be answered from the uploaded documents.
             - edge_case: question targets boundary conditions, exceptions, ambiguous policy cases, or adversarial user phrasing.
             """
             responses = [self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Generator. Output JSON.")]
        elif self.llm.use_mock:
             # Keep mock mode as a single fast call
             prompt = f"""
             Generate {count} RAG benchmark samples.
             Categories: {plan.categories}
             Context: {context}
             Output JSON with a list 'samples', each containing: category, difficulty, sample_type, question, expected_answer, source_chunk_ids.
             Ensure sample_type is one of: single_hop, multi_hop, unanswerable, edge_case. Ensure a good mix of these types.
             - single_hop: question can be answered from one strong evidence chunk.
             - multi_hop: question requires combining information from at least two source chunks.
             - unanswerable: question is relevant to the domain but cannot be answered from the uploaded documents.
             - edge_case: question targets boundary conditions, exceptions, ambiguous policy cases, or adversarial user phrasing.
             """
             resp = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Generator. Output JSON.")
             if "samples" in resp and isinstance(resp["samples"], list):
                 samples_list = resp["samples"]
                 scaled_samples = []
                 for i in range(count):
                     base_sample = samples_list[i % len(samples_list)] if len(samples_list) > 0 else {}
                     copied = base_sample.copy()
                     # Override difficulty to match target_difficulties
                     copied["difficulty"] = target_difficulties[i]
                     # Add slight variation to question text if it's scaled or duplicated
                     if i >= len(samples_list) or len(samples_list) == 1:
                         copied["question"] = f"{base_sample.get('question', 'Mock Question?')} (Var {i})"
                     scaled_samples.append(copied)
                 resp["samples"] = scaled_samples
             responses = [resp]
        else:
             # Real Qwen Mode: Loop and call API batch_size times
             batch_size = max(1, settings.QWEN_MAX_SAMPLES_PER_REAL_RUN or 1)
             responses = []
             remaining = count
             attempts = 0
             max_attempts = count * 2 # Prevent infinite loop
             generated_questions = []
             
             while remaining > 0 and attempts < max_attempts:
                 current_batch = min(batch_size, remaining)
                 
                 # Select targeted difficulties for this batch
                 start_diff_idx = count - remaining
                 batch_diffs = target_difficulties[start_diff_idx : start_diff_idx + current_batch]
                 
                 # Select a subset/window of chunks to vary the context per API call
                 if len(all_chunks) > 5:
                     start_idx = (attempts * 2) % (len(all_chunks) - 4)
                     chunks = all_chunks[start_idx : start_idx + 5]
                 else:
                     chunks = all_chunks
                 context = "\n".join([f"[{c['id']}] {c['text']}" for c in chunks])
                 
                 prompt = f"""
                 Generate {current_batch} RAG benchmark samples.
                 Categories: {plan.categories}
                 Target Difficulties: {batch_diffs}
                 Context: {context}
                 Previously generated questions (avoid duplicates): {generated_questions}
                 
                 Output JSON with a list 'samples', each containing: category, difficulty, sample_type, question, expected_answer, source_chunk_ids.
                 The 'samples' list must have length {current_batch}, matching the Target Difficulties order.
                 Ensure sample_type is one of: single_hop, multi_hop, unanswerable, edge_case. Ensure a good mix of these types.
                 - single_hop: question can be answered from one strong evidence chunk.
                 - multi_hop: question requires combining information from at least two source chunks.
                 - unanswerable: question is relevant to the domain but cannot be answered from the uploaded documents.
                 - edge_case: question targets boundary conditions, exceptions, ambiguous policy cases, or adversarial user phrasing.
                 Do NOT generate questions that are similar to or duplicate any of the previously generated questions.
                 """
                 resp = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Generator. Output JSON.")
                 responses.append(resp)
                 
                 num_samples = 0
                 if "samples" in resp and isinstance(resp["samples"], list):
                     num_samples = len(resp["samples"])
                     for s_data in resp["samples"]:
                         q_text = s_data.get("question")
                         if q_text:
                             generated_questions.append(q_text)
                 
                 decrement = num_samples if num_samples > 0 else max(1, current_batch)
                 remaining -= decrement
                 attempts += 1

        generated_samples = []
        for response in responses:
            if "samples" in response and isinstance(response["samples"], list):
                for s_data in response["samples"]:
                    if mode == "generation" and len(generated_samples) >= count:
                        break

                    sample_type = s_data.get("sample_type", "single_hop")
                    if sample_type not in ["single_hop", "multi_hop", "unanswerable", "edge_case"]:
                        sample_type = "single_hop"

                    source_chunk_ids = s_data.get("source_chunk_ids", [c['id'] for c in chunks][:1])
                    expected_answer = s_data.get("expected_answer", "Mock Answer.")

                    # Deterministic validation logic
                    if sample_type == "multi_hop" and len(source_chunk_ids) < 2:
                        if len(chunks) >= 2:
                            source_chunk_ids = [c['id'] for c in chunks][:2]
                        else:
                            sample_type = "single_hop"
                    elif sample_type == "single_hop" and len(source_chunk_ids) < 1:
                        if len(chunks) >= 1:
                            source_chunk_ids = [c['id'] for c in chunks][:1]
                    elif sample_type == "unanswerable":
                        if plan.language and plan.language.lower() == "vietnamese":
                            expected_answer = "Không đủ thông tin trong tài liệu."
                        else:
                            expected_answer = "Not enough information in the document."

                    # Target difficulty for this index
                    target_diff = "medium"
                    if mode == "generation" and len(generated_samples) < len(target_difficulties):
                        target_diff = target_difficulties[len(generated_samples)]
                    else:
                        target_diff = s_data.get("difficulty", "medium")

                    if mode == "repair" and sample:
                        sample.question = s_data.get("question", sample.question)
                        sample.expected_answer = expected_answer
                        sample.sample_type = sample_type
                        sample.source_chunk_ids = source_chunk_ids
                        sample.status = SampleStatus.GENERATED
                        generated_samples.append(sample)
                    else:
                        new_sample = Sample(
                            project_id=self.project_id,
                            category=s_data.get("category", plan.categories[0] if plan.categories else "general"),
                            difficulty=target_diff,
                            sample_type=sample_type,
                            question=s_data.get("question", "Mock Question?"),
                            expected_answer=expected_answer,
                            source_chunk_ids=source_chunk_ids
                        )
                        self.db.add(new_sample)
                        generated_samples.append(new_sample)

        self.db.commit()
        self._log_trace(f"generation_{mode}_complete", {"generated_count": len(generated_samples)})
        return generated_samples
