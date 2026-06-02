# Alibaba Cloud Object Storage Service (OSS) Integration

DatasetOps Autopilot uses Object Storage to persist uploaded source documents and generated RAG benchmark ZIP exports.

This project is built to run cleanly with either local storage (for offline mock demos) or real Alibaba Cloud OSS (for hackathon proofs and production deployments).

## Code Abstraction

The integration is centralized in `backend/wrappers/oss_client.py`. This wrapper exposes uniform methods:
*   `upload_file`
*   `download_file`
*   `get_signed_url`

Regardless of whether the underlying storage is your local filesystem (`backend/storage`) or an Alibaba OSS bucket, the rest of the application interacts with files identically.

## Switching to OSS Mode

To configure real OSS, update your `.env` file. You must set `STORAGE_MODE=oss` and provide all 4 credential variables:

```env
STORAGE_MODE=oss
ALIBABA_CLOUD_ACCESS_KEY_ID=your_access_key_id
ALIBABA_CLOUD_ACCESS_KEY_SECRET=your_access_key_secret
ALIBABA_CLOUD_OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
ALIBABA_CLOUD_OSS_BUCKET=your_bucket_name
ALIBABA_CLOUD_OSS_REGION=cn-hangzhou
```

*If `STORAGE_MODE=oss` is set but credentials are missing, the backend will aggressively throw a `ValueError` on startup rather than silently falling back to local files.*

## Verifying Connectivity

### Health Check Endpoint

Ensure your bucket policies and credentials are correct by hitting the health check:

`GET /api/health/storage`

This will return a JSON payload detailing:
*   The active mode (`active_storage_mode`)
*   If credentials are detected (`oss_credentials_configured`)
*   The configured bucket and endpoint
*   The result of a tiny, safe read/write/delete test against the bucket (`test_call_success` - `True` means your permissions are fully correct).

## Hackathon Proof Requirement

This integration explicitly satisfies hackathon requirements for Alibaba Cloud utilization by directly mapping the core asset pipeline (Document Intake -> Processing -> Package Export) through native Alibaba OSS endpoints using the official `oss2` Python SDK.
