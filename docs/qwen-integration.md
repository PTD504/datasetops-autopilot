# Qwen Integration Guide

DatasetOps Autopilot uses Alibaba Cloud's Qwen LLM family to automate data generation and evaluation pipelines.

## Modes of Operation

The system has three primary modes regarding LLM calls, configured via environment variables. These are further controlled by `RUN_MODE`.

1.  **Mock Mode (`MOCK_LLM=true` or `RUN_MODE=mock`)**: The system does not make network calls. It uses deterministic responses defined in `backend/wrappers/qwen_client.py`. This is ideal for local testing, frontend development, and guaranteed demos.
2.  **Real Qwen Mode (`MOCK_LLM=false`)**: The system uses the configured `QWEN_API_KEY` to make actual chat completion calls to Alibaba Cloud Model Studio.
    * **`RUN_MODE=real_test`**: A restricted safety mode. The system enforces strict caps on `QWEN_MAX_SAMPLES_PER_REAL_RUN` and `QWEN_MAX_REPAIR_ATTEMPTS_PER_SAMPLE` to prevent accidental large spends when working with a limited credit allowance.
    * **`RUN_MODE=real_full`**: Unrestricted operations subject only to the full `QWEN_MAX_*` budget guardrails.
3.  **Fallback Mode (`ALLOW_LLM_FALLBACK=true` combined with `MOCK_LLM=false`)**: If an API error occurs during Real Qwen Mode (e.g., rate limits, network issues), the system will log a warning and fallback to the deterministic mock responses to prevent pipeline crashes. If strict real responses are required, set `ALLOW_LLM_FALLBACK=false` to enforce failure.

## Budget Guardrails

A built-in safety layer checks token projections and tracks spending dynamically. You can review the current budget usage in the frontend UI or hit `/api/projects/{project_id}/usage`. If usage limits are hit, the workflow automatically blocks further LLM calls. If you wish to stop a runaway process, use the UI "Stop Workflow" button.

## Required Environment Variables

For Real Qwen mode (safely restricted), set the following in your `.env`:

```env
MOCK_LLM=false
RUN_MODE=real_test
ALLOW_LLM_FALLBACK=false # or true depending on preference
QWEN_API_KEY=your_qwen_api_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL=qwen-plus

# Example Budget Settings:
QWEN_GUARDRAILS_ENABLED=true
QWEN_MAX_CALLS_PER_RUN=50
QWEN_MAX_ESTIMATED_COST_USD_PER_RUN=1.0
```

## Verifying Integration

### Health Check Endpoint

You can check your system's current connectivity to Qwen by hitting the backend API:

`GET /api/health/qwen`

This endpoint returns a JSON payload detailing:
*   Whether mock mode is active (`mock_mode`)
*   Whether credentials are present (`credentials_configured`)
*   The currently targeted model (`model`)
*   Whether fallback is allowed (`fallback_allowed`)
*   The success of a tiny ping to Qwen if in Real Mode (`test_call_success`)

### Monitoring the Logs

The backend includes structured logging to confirm how calls are processed. Watch the backend terminal logs for messages such as:
*   `Using MOCK Qwen Client for generate_json`
*   `Using REAL Qwen Client (model: qwen-plus) for generate_json`
*   `Falling back to MOCK Qwen Client due to API error (ALLOW_LLM_FALLBACK=true)`

## Common Errors & Fixes

*   **`Exception: Qwen API error and fallback disabled`**: The API call failed and `ALLOW_LLM_FALLBACK` is `false`. Check your `QWEN_API_KEY` and network connection, or set fallback to `true` if you wish to proceed with mock data.
*   **Failed to parse JSON**: Sometimes Qwen returns plain text rather than structured JSON. The system attempts a 1-time automatic retry. If it fails again, it throws an error or triggers fallback based on your configuration.
