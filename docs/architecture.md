# Architecture

The DatasetOps Autopilot system is designed as an autonomous workflow agent that processes documents and generates RAG evaluation benchmarks.

![Architecture Diagram](assets/architecture.png)

*(Note: The diagram above is a placeholder. A detailed architecture diagram should be placed here if available. For now, see the textual description below.)*

## Components

1. **Frontend (Next.js)**: Provides the user interface for project creation, plan review, sample validation, and artifact download.
2. **Backend (FastAPI)**: Exposes a REST API for the frontend and coordinates the document pipeline and agent workflows.
3. **Database (PostgreSQL)**: Stores project state, benchmark plans, document metadata, chunks, generated samples, and evaluations.
4. **Document Pipeline**: Responsible for parsing (cleaning) and chunking source documents, and providing naive retrieval capabilities.
5. **LLM Provider (Qwen Cloud)**: Used by agents for reasoning, generation, and evaluation tasks.
6. **Object Storage (Alibaba Cloud OSS)**: Stores the final generated export artifacts securely.

## Agents

The core logic is driven by a set of specialized agents:

*   **IntakePlannerAgent**: Analyzes the initial user request and creates a structured benchmark plan.
*   **SourceUnderstandingAgent**: Analyzes uploaded documents to summarize their contents and warn about potential issues (e.g., lack of diversity).
*   **BenchmarkGeneratorAgent**: Generates RAG question-answer pairs (supporting `single_hop`, `multi_hop`, `unanswerable`, and `edge_case` sample types) based on the retrieved document chunks and the benchmark plan. It can also operate in a "repair" mode to fix failing samples.
*   **QualityEvaluatorAgent**: Evaluates generated samples using rich RAG-specific metrics (faithfulness, answer relevance, context precision, context recall, hallucination risk) and decides whether they pass, need repair, or require human review based on explicit thresholds.
*   **ExportReportAgent**: Compiles the approved samples into the final deliverable formats (`jsonl`, `md`, `zip`), calculates dataset quality metrics, and uploads them to OSS.
