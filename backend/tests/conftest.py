import os
import pathlib

# Override DATABASE_URL to a local SQLite file before any backend module is
# imported. backend.core.database creates the SQLAlchemy engine at import time,
# so this must be set in os.environ before the first import of any backend code.
_BACKEND_DIR = pathlib.Path(__file__).resolve().parent.parent
os.environ.setdefault(
    "DATABASE_URL",
    f"sqlite:///{(_BACKEND_DIR / 'datasetops_test.db').as_posix()}"
)
# If DATABASE_URL is already set to a PostgreSQL URL (e.g. from .env), replace it
# with SQLite so tests run without a running PostgreSQL instance.
if os.environ.get("DATABASE_URL", "").startswith("postgresql"):
    os.environ["DATABASE_URL"] = (
        f"sqlite:///{(_BACKEND_DIR / 'datasetops_test.db').as_posix()}"
    )

import pytest

from backend.core.config import settings


@pytest.fixture(autouse=True)
def default_tests_to_mock_llm(monkeypatch):
    monkeypatch.setattr(settings, "RUN_MODE", "mock")
    monkeypatch.setattr(settings, "MOCK_LLM", True)
    monkeypatch.setattr(settings, "QWEN_API_KEY", None)
