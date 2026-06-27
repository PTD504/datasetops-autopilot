from fastapi import APIRouter
from backend.core.config import settings
from backend.wrappers.qwen_client import QwenClient
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/qwen")
def health_qwen():
    mock_mode = settings.effective_mock_llm or not settings.QWEN_API_KEY
    creds_configured = bool(settings.QWEN_API_KEY)

    # We use QwenClient to perform a tiny real test if applicable
    test_success = None
    if not mock_mode and creds_configured:
        client = QwenClient()
        try:
            # Minimal prompt just to test connectivity
            result = client.generate_json("Say hello in JSON", 'You are a helpful assistant. Output JSON format.')
            test_success = True
        except Exception as e:
            logger.error(f"Health check Qwen real call failed: {e}")
            test_success = False

    return {
        "mock_mode": mock_mode,
        "run_mode": settings.RUN_MODE,
        "effective_llm_mode": settings.effective_llm_mode,
        "credentials_configured": creds_configured,
        "model": settings.QWEN_MODEL if not mock_mode else "mock",
        "fallback_allowed": settings.ALLOW_LLM_FALLBACK,
        "test_call_success": test_success
    }

@router.get("/storage")
def health_storage():
    storage_mode = settings.STORAGE_MODE
    oss_configured = bool(
        settings.ALIBABA_CLOUD_ACCESS_KEY_ID and
        settings.ALIBABA_CLOUD_ACCESS_KEY_SECRET and
        settings.ALIBABA_CLOUD_OSS_ENDPOINT and
        settings.ALIBABA_CLOUD_OSS_BUCKET
    )

    # Tiny write/read/delete test for OSS
    test_success = None
    if storage_mode == "oss" and oss_configured:
        from backend.wrappers.oss_client import AlibabaOSSClient
        import os
        import tempfile
        temp_path = None
        dl_path = None
        try:
            client = AlibabaOSSClient()
            with tempfile.NamedTemporaryFile(delete=False) as tf:
                tf.write(b"health check")
                temp_path = tf.name

            test_object_name = "health_check_test_file.txt"
            # Write
            client.upload_file(test_object_name, temp_path)

            # Read
            with tempfile.NamedTemporaryFile(delete=False) as tf2:
                dl_path = tf2.name
            client.download_file(test_object_name, dl_path)

            # Delete
            client.bucket.delete_object(test_object_name)

            test_success = True
        except Exception as e:
            logger.error(f"Health check storage real call failed: {e}")
            test_success = False
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
            if dl_path and os.path.exists(dl_path):
                os.remove(dl_path)

    return {
        "active_storage_mode": storage_mode,
        "oss_credentials_configured": oss_configured,
        "bucket_name": settings.ALIBABA_CLOUD_OSS_BUCKET if storage_mode == 'oss' else None,
        "endpoint": settings.ALIBABA_CLOUD_OSS_ENDPOINT if storage_mode == 'oss' else None,
        "local_fallback_active": storage_mode == "local",
        "test_call_success": test_success
    }
