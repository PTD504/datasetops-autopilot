# API Documentation

## Projects
* `POST /api/projects/`: Create a new project.
* `GET /api/projects/{project_id}`: Get project details.
* `POST /api/projects/{project_id}/documents`: Upload a document.
* `GET /api/projects/{project_id}/documents`: List project documents.
* `POST /api/projects/{project_id}/start`: Start the autopilot workflow.
* `POST /api/projects/{project_id}/stop`: Request cancellation for an active workflow before later guarded steps or Qwen calls.
* `GET /api/projects/{project_id}/status`: Get current workflow state.
* `GET /api/projects/{project_id}/usage`: Get Qwen usage guardrail totals plus cancellation state.

## Planning
* `GET /api/projects/{project_id}/plan`: Get the proposed benchmark plan.
* `POST /api/projects/{project_id}/plan/approve`: Approve the plan and continue workflow.

## Samples
* `GET /api/projects/{project_id}/samples`: List generated samples.

## Export
* `GET /api/projects/{project_id}/export`: Get export status and artifact URLs.
