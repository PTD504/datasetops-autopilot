# DatasetOps Autopilot

An autonomous multi-agent pipeline for generating, evaluating, and refining high-quality RAG evaluation datasets from raw source documents.

## Architecture Overview

DatasetOps Autopilot operates as an autonomous workflow agent coordinating multi-agent loops to ingest, parse, and process raw documents into high-quality benchmark datasets. 

- **Frontend Interface**: A Next.js web application that supports project initialization, document upload, review of generated benchmark plans, live execution tracing, and deliverable downloading.
- **Backend API Gateway**: A FastAPI backend that hosts rest endpoints, runs the core document parsing and chunking pipeline, and manages the lifecycle of the workflow state machine.
- **Agent Orchestrator**: Executes specialized, message-driven agent reasoning steps and coordinates multi-turn generator-critic sessions.
- **Vector Database**: PostgreSQL with the `pgvector` extension is used to store document chunks and compute cosine distance for semantic evidence retrieval.
- **Storage Layer**: Alibaba Cloud Object Storage Service (OSS) is used to persist final zipped benchmark deliverable packages.

## Agent Pipeline

The core lifecycle of a dataset generation run is governed by five specialized, cooperative agents:

*   **IntakePlannerAgent**: Analyzes the initial, ambiguous user request and generates a structured benchmark plan containing target categories, difficulty distributions, and generation guidelines.
*   **SourceUnderstandingAgent**: Evaluates the uploaded source files to verify document quality, analyze content distribution, and raise warnings about potential coverage issues.
*   **BenchmarkGeneratorAgent**: Receives specific generation slots and uses retrieved source evidence chunks to formulate questions, expected answers, and source mappings.
*   **QualityEvaluatorAgent**: Analyzes generated benchmark samples against rich, RAG-specific criteria to determine if they pass, require repair, or are rejected.
*   **ExportReportAgent**: Aggregates all passed samples, calculates final dataset quality metrics, compiles output formats (JSONL, Markdown, ZIP), and uploads the package to Alibaba Cloud OSS.

## Key Technical Features

- **Generator-Critic Negotiation Loop**: Implements a structured, turn-bounded message exchange between the generator agent (`BenchmarkGeneratorAgent`) and the evaluator agent (`QualityEvaluatorAgent`) to resolve quality issues collaboratively without redundant regeneration.
- **Semantic Embedding Pipeline**: Leverages `text-embedding-v3` embeddings to index source document chunks. The `SemanticRetriever` executes cosine distance search (`<=>` operator) against PostgreSQL to match evidence context to generation requirements, falling back gracefully to naive keyword matching when vector capabilities are absent.
- **RAG Evaluation Metrics**: The evaluation agent grades samples on a 0-1 scale across multiple metrics, including faithfulness (groundedness in source context), answer relevance (addressing the query), context precision, context recall, and hallucination risk.
- **Human-in-the-Loop Checkpoints**: Implements blocking execution states where progress halts until a human approves the drafted benchmark plan or reviews the evaluated samples, ensuring final dataset quality control.
- **Bounded Repair Loop**: Evaluator-rejected samples are automatically routed back to the generator with specific feedback instructions, restricted by a strict quota of maximum 2 repair retries to control LLM cost.

## Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | Next.js, TailwindCSS, TypeScript, Shadcn UI |
| **Backend** | Python, FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| **Database** | PostgreSQL + pgvector (with SQLite fallback for local testing) |
| **LLM** | Qwen Cloud (via DashScope API / OpenAI-compatible client) |
| **Storage** | Alibaba Cloud OSS (with local folder storage fallback) |
| **Deployment** | Backend-only Alibaba Cloud ECS (Docker Compose) + Frontend on Vercel |

## Local Development Setup

To run a fully functional development environment locally in **mock mode** (no external API keys or cloud credentials required):

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/PTD504/datasetops-autopilot.git
   cd datasetops-autopilot
   ```

2. **Configure Environment File**:
   Copy `.env.example` to `.env`. The default settings enable mock mode:
   ```bash
   cp .env.example .env
   ```
   *Note: Ensure `MOCK_LLM=true` and `STORAGE_MODE=local` are active in the `.env` file.*

3. **Start the Docker Services**:
   ```bash
   docker compose up --build
   ```

4. **Access the Applications**:
   - Frontend UI: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - Swagger Documentation: `http://localhost:8000/docs`

## Production Deployment

The project is structured with a decoupled, production-ready architecture:

- **Backend (Alibaba Cloud ECS)**:
  - Deployed via `docker-compose.prod.yml` to run the database (`db` using pgvector) and the API (`backend`).
  - An Nginx reverse proxy container (`nginx`) acts as the single API gateway, managing incoming traffic for `/api/`, `/docs`, `/openapi.json`, and `/health`.
  - Configured with environment variables `BACKEND_HOST`, `BACKEND_PORT`, and `CORS_ORIGINS` (enforcing dynamic cross-origin policies).
- **Frontend (Vercel)**:
  - Deployed separately as a serverless static application on Vercel.
  - Connects to the ECS instance using the `NEXT_PUBLIC_API_URL` environment variable.

## Project Structure

```
datasetops-autopilot/
├── backend/
│   ├── agents/          # Agent implementations (planner, generator, evaluator, etc.)
│   ├── api/             # FastAPI routing and endpoints
│   ├── core/            # Config and Database connections
│   ├── models/          # Database ORM models (Project, Sample, Plan, etc.)
│   ├── pipeline/        # Chunker, parser, and retriever components
│   ├── services/        # Quotas, logs, and cancellation management
│   ├── tests/           # Integration and unit tests
│   ├── wrappers/        # DashScope Qwen client and Alibaba OSS client
│   └── main.py          # FastAPI entry point
├── deploy/
│   └── nginx.conf       # Nginx API Gateway configuration
├── docs/                # Architecture and deployment guides
├── frontend/            # Next.js frontend code
├── docker-compose.yml   # Local development compose file
├── docker-compose.prod.yml # Production compose file (backend-only)
└── README.md
```

## Hackathon Track

**Track 4: Autopilot Agent**  
Submitted to the Qwen Cloud Global Hackathon.
