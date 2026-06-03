from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./datasetops.db" # fallback
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000"]'

    QWEN_API_KEY: Optional[str] = None
    QWEN_BASE_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    QWEN_MODEL: str = "qwen-plus"

    ALIBABA_CLOUD_ACCESS_KEY_ID: Optional[str] = None
    ALIBABA_CLOUD_ACCESS_KEY_SECRET: Optional[str] = None
    ALIBABA_CLOUD_OSS_ENDPOINT: Optional[str] = None
    ALIBABA_CLOUD_OSS_BUCKET: Optional[str] = None
    ALIBABA_CLOUD_OSS_REGION: Optional[str] = None

    STORAGE_MODE: str = "local"
    LOCAL_STORAGE_DIR: str = "backend/storage"
    MOCK_LLM: bool = True
    ALLOW_LLM_FALLBACK: bool = True
    RUN_MODE: str = "mock"

    QWEN_GUARDRAILS_ENABLED: bool = True
    QWEN_MAX_CALLS_PER_RUN: int = 50
    QWEN_MAX_INPUT_TOKENS_PER_RUN: int = 100000
    QWEN_MAX_OUTPUT_TOKENS_PER_RUN: int = 20000
    QWEN_MAX_TOTAL_TOKENS_PER_RUN: int = 120000
    QWEN_MAX_ESTIMATED_COST_USD_PER_RUN: float = 1.0
    QWEN_MAX_SAMPLES_PER_REAL_RUN: int = 5
    QWEN_MAX_REPAIR_ATTEMPTS_PER_SAMPLE: int = 1
    QWEN_STOP_ON_BUDGET_EXCEEDED: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
