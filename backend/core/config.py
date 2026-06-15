from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{BACKEND_DIR.as_posix()}/datasetops.db" # fallback
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
    LOCAL_STORAGE_DIR: str = (BACKEND_DIR / "storage").as_posix()
    EXPORTS_DIR: str = (BACKEND_DIR / "exports").as_posix()
    UPLOADS_DIR: str = (BACKEND_DIR / "uploads").as_posix()
    MOCK_LLM: bool = True
    ALLOW_LLM_FALLBACK: bool = True
    RUN_MODE: str = "mock"

    QWEN_GUARDRAILS_ENABLED: bool = True
    QWEN_MAX_CALLS_PER_RUN: int = 150
    QWEN_MAX_INPUT_TOKENS_PER_RUN: int = 100000
    QWEN_MAX_OUTPUT_TOKENS_PER_RUN: int = 20000
    QWEN_MAX_TOTAL_TOKENS_PER_RUN: int = 120000
    QWEN_MAX_ESTIMATED_COST_USD_PER_RUN: float = 1.0
    QWEN_MAX_SAMPLES_PER_REAL_RUN: int = 1
    QWEN_MAX_REPAIR_ATTEMPTS_PER_SAMPLE: int = 1
    QWEN_STOP_ON_BUDGET_EXCEEDED: bool = True

    MAX_SAMPLES_PER_RUN: Optional[int] = 50
    MAX_REPAIR_RETRIES_PER_SAMPLE: Optional[int] = None
    MAX_LLM_CALLS_PER_WORKFLOW: Optional[int] = 150
    BUDGET_GUARDRAIL_MODE: str = "cap"

    @field_validator("BUDGET_GUARDRAIL_MODE")
    @classmethod
    def validate_guardrail_mode(cls, v: str) -> str:
        mode = v.lower()
        if mode not in {"cap", "strict", "warn"}:
            raise ValueError("BUDGET_GUARDRAIL_MODE must be one of: 'cap', 'strict', 'warn'")
        return mode

    @property
    def max_samples_per_run_limit(self) -> int:
        if self.MAX_SAMPLES_PER_RUN is not None:
            return self.MAX_SAMPLES_PER_RUN
        return 50

    @property
    def max_repair_retries_limit(self) -> int:
        if self.MAX_REPAIR_RETRIES_PER_SAMPLE is not None:
            return self.MAX_REPAIR_RETRIES_PER_SAMPLE
        return self.QWEN_MAX_REPAIR_ATTEMPTS_PER_SAMPLE or 1

    @property
    def max_llm_calls_limit(self) -> int:
        if self.MAX_LLM_CALLS_PER_WORKFLOW is not None:
            return self.MAX_LLM_CALLS_PER_WORKFLOW
        return self.QWEN_MAX_CALLS_PER_RUN or 150


    @property
    def effective_mock_llm(self) -> bool:
        run_mode = (self.RUN_MODE or "mock").lower()
        if run_mode == "mock":
            return True
        if run_mode in {"real_test", "real_full"}:
            return False
        return self.MOCK_LLM

    @property
    def effective_llm_mode(self) -> str:
        if self.effective_mock_llm or not self.QWEN_API_KEY:
            return "mock"
        return self.RUN_MODE

    class Config:
        env_file = ".env"

settings = Settings()
