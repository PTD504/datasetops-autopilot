import pytest

from backend.core.config import settings


@pytest.fixture(autouse=True)
def default_tests_to_mock_llm(monkeypatch):
    monkeypatch.setattr(settings, "RUN_MODE", "mock")
    monkeypatch.setattr(settings, "MOCK_LLM", True)
    monkeypatch.setattr(settings, "QWEN_API_KEY", None)
