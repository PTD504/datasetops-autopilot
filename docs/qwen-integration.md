# Qwen Integration

DatasetOps Autopilot integrates seamlessly with Qwen Cloud via the OpenAI-compatible API to power its autonomous agents.

## Environments and Modes

The application supports two operating modes for the LLM backend: **Mock Mode** and **Real Qwen Mode**.

### 1. Mock Mode

Mock mode allows for rapid local development and deterministic demoing without consuming real API credits. This is the default configuration.

**To enable Mock Mode:**
Set `MOCK_LLM=true` in your `.env` file. The application will use deterministic mock data based on prompt keywords, designed specifically for the Vietnamese ecommerce benchmark demo.

### 2. Real Qwen Mode

Real Qwen Mode connects directly to the Qwen Cloud API for actual LLM generation and evaluation.

**To enable Real Qwen Mode:**
1. Set `MOCK_LLM=false` in your `.env` file.
2. Provide your Qwen API credentials in the `.env` file:
   - `QWEN_API_KEY=your_actual_api_key`
   - `QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1`
   - `QWEN_MODEL=qwen-plus`

### Fallback Configuration

By default, if the application is running in Real Qwen Mode but encounters an API error (e.g., network issue or rate limit), it will silently fall back to Mock Mode to keep the workflow running.

For final testing to definitively prove real Qwen usage, you should disable this fallback.

**To disable Mock Fallback:**
Set `ALLOW_LLM_FALLBACK=false` in your `.env` file. With this set, if `MOCK_LLM=false` and a Qwen API call fails, the application will raise a clear exception and halt, ensuring that only real Qwen responses are used.
