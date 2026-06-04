# DatasetOps Autopilot — RAG Benchmark Builder

**Track 4: Autopilot Agent** for the Qwen Cloud Global Hackathon.

A Qwen-powered autonomous workflow agent that converts raw source documents plus an ambiguous benchmark request into a validated RAG evaluation benchmark package.

## Core Features
* Automated document chunking and parsing.
* Autonomous agent workflow planning.
* Sample generation, validation, and evaluation via Qwen Cloud.
* Bounded repair loops for low-quality samples.
* Human-in-the-loop plan and sample review.
* Full integration with Alibaba Cloud OSS for artifact storage.

## Architecture
See `docs/architecture.md` for full details.

## Documentation
* [Demo Script](docs/demo-script.md) - A <3 minute guide to demoing the MVP.
* [Qwen Integration](docs/qwen-integration.md) - Details on mock mode, real Qwen mode, and the fallback config.

## Tech Stack
* **Frontend:** Next.js, TailwindCSS, TypeScript
* **Backend:** FastAPI, PostgreSQL, SQLAlchemy
* **AI:** Qwen Cloud / Alibaba Cloud Model Studio
* **Storage:** Alibaba Cloud OSS (with local fallback)

## Setup and Running

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Run with Docker Compose:
   ```bash
   docker compose up --build
   ```

   Local Compose reads `.env` for `RUN_MODE`, `MOCK_LLM`, and Qwen settings. Use `RUN_MODE=real_test` plus `QWEN_API_KEY` for a guarded real-Qwen run.

3. Open `http://localhost:3000`

See more details in `docs/deployment.md` and `docs/alibaba-ecs-deployment.md`.

## Deployment Verification

Once deployed (locally or on ECS), verify your environment configuration using the built-in health checks:

*   **Core Backend Health**: `GET /api/health`
*   **Qwen API Health**: `GET /api/health/qwen` (Verifies connection to Model Studio)
*   **OSS Storage Health**: `GET /api/health/storage` (Verifies Read/Write permissions to your Alibaba Cloud OSS bucket)
*   **Frontend Check**: Open the root URL in a browser and ensure the UI loads.
*   **End-to-End Check**: Run a quick test project and verify a sample export ZIP successfully downloads.
*   **Manual Stop Check**: `POST /api/projects/{project_id}/stop` requests cancellation before later workflow stages or real Qwen calls.
