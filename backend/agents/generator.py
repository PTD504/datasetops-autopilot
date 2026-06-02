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
             Context: {context}
             Output JSON with: category, difficulty, question, expected_answer, source_chunk_ids.
             """
        else:
            prompt = f"""
            Generate {count} RAG benchmark samples.
            Categories: {plan.categories}
            Context: {context}
            Output JSON with a list 'samples', each containing: category, difficulty, question, expected_answer, source_chunk_ids.
            """

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Generator. Output JSON.")

        generated_samples = []
        if "samples" in response:
            for s_data in response["samples"]:
                if mode == "repair" and sample:
                    sample.question = s_data.get("question", sample.question)
                    sample.expected_answer = s_data.get("expected_answer", sample.expected_answer)
                    sample.status = SampleStatus.GENERATED
                    generated_samples.append(sample)
                else:
                    new_sample = Sample(
                        project_id=self.project_id,
                        category=s_data.get("category", plan.categories[0] if plan.categories else "general"),
                        difficulty=s_data.get("difficulty", "medium"),
                        question=s_data.get("question", "Mock Question?"),
                        expected_answer=s_data.get("expected_answer", "Mock Answer."),
                        source_chunk_ids=s_data.get("source_chunk_ids", [c['id'] for c in chunks][:1])
                    )
                    self.db.add(new_sample)
                    generated_samples.append(new_sample)

        self.db.commit()
        self._log_trace(f"generation_{mode}_complete", {"generated_count": len(generated_samples)})
        return generated_samples
