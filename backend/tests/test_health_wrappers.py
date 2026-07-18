import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.config import settings
from backend.wrappers.oss_client import AlibabaOSSClient

client = TestClient(app)

def test_oss_client_initialization_failure(monkeypatch):
    # If storage mode is oss but credentials are missing, it should raise ValueError
    monkeypatch.setattr(settings, "STORAGE_MODE", "oss")
    monkeypatch.setattr(settings, "ALIBABA_CLOUD_ACCESS_KEY_ID", None)

    with pytest.raises(ValueError, match="STORAGE_MODE is set to 'oss' but required OSS credentials are missing"):
        AlibabaOSSClient()

def test_oss_client_local_fallback_initialization(monkeypatch, tmp_path):
    monkeypatch.setattr(settings, "STORAGE_MODE", "local")
    monkeypatch.setattr(settings, "EXPORTS_DIR", str(tmp_path))

    oss = AlibabaOSSClient()
    assert oss.use_local is True
    assert oss.local_dir == str(tmp_path)

def test_health_qwen_endpoint():
    response = client.get("/api/health/qwen")
    assert response.status_code == 200
    data = response.json()
    assert "mock_mode" in data
    assert "credentials_configured" in data
    assert "models" in data
    assert "qwen_model" in data["models"]
    assert "fallback_allowed" in data

def test_health_storage_endpoint():
    response = client.get("/api/health/storage")
    assert response.status_code == 200
    data = response.json()
    assert "active_storage_mode" in data
    assert "oss_credentials_configured" in data
    assert "bucket_name" in data
    assert "local_fallback_active" in data
