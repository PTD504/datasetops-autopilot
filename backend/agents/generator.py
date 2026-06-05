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

    def generate(self, plan: BenchmarkPlan, count: int, mode: str = "generation", sample: Sample = None) -> List[Sample]:
        self._log_trace(f"start_generation_{mode}", {"count": count})

        # In a real system, we'd retrieve chunks per category/difficulty
        # For MVP, we'll just get some chunks
        chunks = self.retriever.retrieve(self.project_id, " ".join(plan.categories), top_k=5)
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
        else:
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

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Generator. Output JSON.")

        generated_samples = []
        if "samples" in response:
            for s_data in response["samples"]:
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
                        difficulty=s_data.get("difficulty", "medium"),
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
