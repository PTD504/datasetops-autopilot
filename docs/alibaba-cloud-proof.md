# Alibaba Cloud Integration Proof

This project integrates directly with two major Alibaba Cloud services:

1. **Qwen Cloud / Model Studio**:
   * **Source File**: `backend/wrappers/qwen_client.py`
   * **Description**: Uses the standard OpenAI-compatible client pointed at `https://dashscope.aliyuncs.com/compatible-mode/v1` to utilize Qwen models (e.g., `qwen-plus`) for all agent reasoning, generation, and evaluation tasks.

2. **Alibaba Cloud OSS**:
   * **Source File**: `backend/wrappers/oss_client.py`
   * **Description**: Uses the official `oss2` Python SDK to upload the final benchmark artifacts (JSONL files, ZIP package) securely to an OSS bucket for delivery.
