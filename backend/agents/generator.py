from typing import Dict, Any, List
from sqlalchemy.orm import Session
from .base import BaseAgent
from backend.models import BenchmarkPlan, Sample
from backend.pipeline.retriever import NaiveRetriever, SemanticRetriever
from backend.models.enums import SampleStatus
from backend.tools.evidence_assembler import EvidenceAssemblerTool
from backend.core.config import settings

class BenchmarkGeneratorAgent(BaseAgent):
    def __init__(self, db: Session, project_id: str):
        super().__init__(db, project_id, model=settings.generator_model_name)
        self.purpose = "Generate benchmark samples based on the plan and source documents."
        self.retriever = SemanticRetriever(db)
        self._samples = []

    def generate(self, plan: BenchmarkPlan, count: int, mode: str = "generation", sample: Sample = None, sample_slots: List[Dict[str, Any]] = None) -> List[Sample]:
        """Generate benchmark samples using a self-contained retrieval + assembly path.

        NOTE: This method is the direct-call path used in tests and standalone
        invocations (e.g., test_generator_evaluator.py::test_pipeline). It is NOT
        called by run_generation_workflow() in workflows/generation.py.

        The workflow manages its own per-slot SemanticRetriever retrieval and
        EvidenceAssemblerTool calls directly so that it can interleave
        cancellation checks (raise_if_cancelled) and per-slot log_agent_run
        wrappers without restructuring the agent interface. Both paths use
        SemanticRetriever, so retrieval quality is consistent.
        """
        self._log_trace(f"start_generation_{mode}", {"count": count})

        if mode == "repair" and sample:
            assembler = EvidenceAssemblerTool(self.db, self.project_id)
            all_chunks = self.retriever.retrieve(self.project_id, sample.category, top_k=5)
            slot = {
                "slot_id": "repair_slot",
                "category": sample.category,
                "difficulty": sample.difficulty,
                "sample_type": sample.sample_type,
                "required_evidence_count": 2 if sample.sample_type == "multi_hop" else 1,
                "preferred_chunk_ids": sample.source_chunk_ids or []
            }
            evidence_pack = assembler.assemble(slot, all_chunks)
            repaired_sample = self.repair(sample, "Repair original sample", evidence_pack)
            return [repaired_sample]

        slots = sample_slots
        if not slots:
            from backend.tools.diversity_planner import DiversityPlannerTool
            planner = DiversityPlannerTool(self.db, self.project_id, retriever=self.retriever)
            source_report_json = None
            from backend.models.logging_models import AgentArtifact
            source_report_artifact = self.db.query(AgentArtifact).filter(
                AgentArtifact.project_id == self.project_id,
                AgentArtifact.artifact_type == "source_understanding_report"
            ).order_by(AgentArtifact.created_at.desc()).first()
            if source_report_artifact and source_report_artifact.content_json:
                source_report_json = source_report_artifact.content_json

            plan_result = planner.plan_slots(plan, source_report_json, count)
            slots = plan_result.get("slots", [])

        retriever = SemanticRetriever(self.db)
        all_chunks = retriever.retrieve(self.project_id, " ".join(plan.categories), top_k=15)
        assembler = EvidenceAssemblerTool(self.db, self.project_id)

        generated_samples = []
        for slot in slots[:count]:
            evidence_pack = assembler.assemble(slot, all_chunks)
            new_sample = self.generate_one(slot, evidence_pack)
            generated_samples.append(new_sample)

        self._log_trace(f"generation_{mode}_complete", {"generated_count": len(generated_samples)})
        return generated_samples

    def generate_one(self, slot: Dict[str, Any], evidence_pack: Any) -> Sample:
        """
        Generates a single benchmark sample based on slot parameters and assembled evidence pack.
        """
        # Format the context from primary and supporting chunks
        context_parts = []
        for chunk in evidence_pack.primary_chunks:
            context_parts.append(f"[Primary Context - ID: {chunk['id']}] {chunk['text']}")
        for chunk in evidence_pack.supporting_chunks:
            context_parts.append(f"[Supporting Context - ID: {chunk['id']}] {chunk['text']}")
        context_str = "\n".join(context_parts)
        if len(context_str) > 12000:
            context_str = context_str[:12000] + "...[context truncated]"

        # Build prompt
        prompt = f"""
        Generate ONE RAG benchmark sample.
        Category: {slot['category']}
        Difficulty: {slot['difficulty']}
        Sample Type: {slot['sample_type']} (Question Type: {slot.get('question_type', 'general_query')})
        Target Reasoning: {slot.get('target_reasoning', '')}
        Required Evidence Count: {slot.get('required_evidence_count', 1)}
        Avoid Topics: {slot.get('avoid_topics', [])}
        Notes: {slot.get('notes', [])}
        
        Provided Context:
        {context_str}
        
        Output JSON with:
        category (str): must match '{slot['category']}'
        difficulty (str): must match '{slot['difficulty']}'
        sample_type (str): must match '{slot['sample_type']}'
        question (str): the generated benchmark question.
        expected_answer (str): the ground truth answer. If sample_type is 'unanswerable', this must state that the context does not contain enough information.
        source_chunk_ids (list of str): list of chunk IDs from the provided context that support the answer.
        """

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Generator. Output JSON.")

        if "samples" in response and isinstance(response["samples"], list) and len(response["samples"]) > 0:
            response = response["samples"][0]

        sample_type = response.get("sample_type", slot['sample_type'])
        source_chunk_ids = response.get("source_chunk_ids", [c['id'] for c in evidence_pack.primary_chunks])
        expected_answer = response.get("expected_answer", "No answer generated.")

        # Deterministic validation
        if sample_type == "unanswerable":
            from backend.models import BenchmarkPlan
            plan = self.db.query(BenchmarkPlan).filter(BenchmarkPlan.project_id == self.project_id).first()
            if plan and plan.language and plan.language.lower() == "vietnamese":
                expected_answer = "Không đủ thông tin trong tài liệu."
            else:
                expected_answer = "Not enough information in the document."

        # Ensure source_chunk_ids is not empty
        if not source_chunk_ids and evidence_pack.primary_chunks:
            source_chunk_ids = [evidence_pack.primary_chunks[0]["id"]]

        new_sample = Sample(
            project_id=self.project_id,
            category=slot['category'],
            difficulty=slot['difficulty'],
            sample_type=sample_type,
            question=response.get("question", "What is the policy detail?"),
            expected_answer=expected_answer,
            source_chunk_ids=source_chunk_ids
        )
        self.db.add(new_sample)
        self.db.commit()
        return new_sample

    def repair(self, sample: Sample, repair_instruction: str, evidence_pack: Any) -> Sample:
        """
        Repairs an existing sample using evaluator feedback/repair instructions.
        """
        context_parts = []
        for chunk in evidence_pack.primary_chunks:
            context_parts.append(f"[Primary Context - ID: {chunk['id']}] {chunk['text']}")
        for chunk in evidence_pack.supporting_chunks:
            context_parts.append(f"[Supporting Context - ID: {chunk['id']}] {chunk['text']}")
        context_str = "\n".join(context_parts)
        if len(context_str) > 12000:
            context_str = context_str[:12000] + "...[context truncated]"

        prompt = f"""
        Repair the following RAG sample.
        Original Question: {sample.question}
        Original Expected Answer: {sample.expected_answer}
        Category: {sample.category}
        Difficulty: {sample.difficulty}
        Sample Type: {sample.sample_type}
        
        Repair Instruction: {repair_instruction}
        
        Provided Context:
        {context_str}
        
        Output JSON with:
        category (str): must match '{sample.category}'
        difficulty (str): must match '{sample.difficulty}'
        sample_type (str): must match '{sample.sample_type}'
        question (str): repaired question.
        expected_answer (str): repaired expected answer.
        source_chunk_ids (list of str): chunk IDs from the provided context.
        """

        response = self.llm.generate_json(prompt, system_prompt="You are an expert RAG Data Generator. Output JSON.")

        if "samples" in response and isinstance(response["samples"], list) and len(response["samples"]) > 0:
            response = response["samples"][0]

        sample.question = response.get("question", sample.question)
        sample.expected_answer = response.get("expected_answer", sample.expected_answer)
        sample.sample_type = response.get("sample_type", sample.sample_type)
        sample.source_chunk_ids = response.get("source_chunk_ids", sample.source_chunk_ids)
        sample.status = SampleStatus.GENERATED
        self.db.commit()
        return sample
