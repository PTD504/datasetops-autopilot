# DatasetOps Autopilot - Demo Script (< 3 min)

1. **Create Project**: Start by creating a new project. Use a descriptive name like "Vietnamese Ecommerce RAG Benchmark". Enter the following benchmark request:
   > "Build a Vietnamese RAG benchmark to evaluate whether a customer support chatbot can answer refund, shipping, warranty, cancellation, and payment questions."

2. **Upload Docs**: Navigate to your newly created project and upload the Vietnamese ecommerce policy documents provided in `examples/vietnamese-ecommerce-policy/` (refund, shipping, warranty, order cancellation, and payment).

3. **Start Workflow**: Click the "Start Workflow" button to kick off the autonomous pipeline. The agent will begin by parsing and chunking the documents.

4. **Show Workflow Timeline & Trace**: Once started, draw attention to the new "Project Status" timeline and "Autopilot Execution Trace" on the project page. Explain how the trace exposes the autonomous pipeline in real-time, showing actions taken by agents, tools, and the system without exposing raw secrets.

5. **Show Source Understanding**: Briefly demonstrate the source understanding output, noting how the agent extracted the key categories and summarized the policies.

6. **Approve Plan**: Review the generated benchmark plan. The plan should accurately reflect a 30-sample Vietnamese benchmark across the requested categories. Click "Approve Plan".

7. **Generate & Evaluate**: Wait a moment while the generator and evaluator agents create and score samples. Head over to the Human-in-the-Loop Workbench (Samples Review page).

8. **Review Evaluator Metrics & Uncertain Samples**: On the samples page, point out the new visual improvements. Show that samples include explicitly formatted sample types (`single_hop`, `multi_hop`, `unanswerable`, `edge_case`) and highlight the rich RAG-specific evaluation metrics (faithfulness, answer relevance, hallucination risk). Identify at least one sample flagged for "Human Review" or "Rejected" and show how the interface explicitly highlights the evaluator notes and failing metrics.

9. **Export Page Summary**: Once all samples are generated and processed, click to view the Export Package. Show the new dynamic export summary, highlighting the approved sample count, average quality metrics, and sample distribution.

10. **Show Generated Files**: Download and extract the `export.zip` file. Show the contents:
    - `rag_eval.jsonl` and `answer_key.jsonl` containing the samples and explicitly tracked sample types.
    - `dataset_card.md` summarizing the benchmark intent, sample counts, types, and categories.
    - `quality_report.md` detailing the number of passed/repaired/rejected samples, type distribution, and real calculated averages for the new RAG-specific metrics.

10. **Alibaba Proof**: Briefly mention that a separate recording provides proof of Alibaba ECS deployment and native Qwen/OSS API usage.

## Track 4 Judging Criteria Covered

Ensure the demo implicitly highlights these core Track 4 elements:

*   **Ambiguous Input Handling:** The system converts a vague user request into a structured benchmark plan.
*   **External Tool Usage:** The agent uses tools to chunk, parse, evaluate, and directly call Alibaba Cloud OSS for artifact storage.
*   **Human-in-the-Loop Checkpoints:** The user must explicitly approve the generated plan and manually review any uncertain generated samples.
*   **Production-Readiness:** The pipeline handles long-running jobs gracefully, uses multi-stage Docker builds, and connects properly to Alibaba Cloud infrastructure.
*   **Concrete Export Output:** The final deliverable is a tangible, ready-to-use RAG evaluation dataset zip package.
