from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{BACKEND_DIR.as_posix()}/datasetops.db" # fallback
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 100

    QWEN_API_KEY: Optional[str] = None
    QWEN_BASE_URL: str = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    QWEN_MODEL: str = "qwen-plus"
    QWEN_GENERATOR_MODEL: Optional[str] = None
    QWEN_EVALUATOR_MODEL: Optional[str] = None
    QWEN_EMBEDDING_MODEL: str = "text-embedding-v3"
    QWEN_EMBEDDING_DIM: int = 1024

    ALIBABA_CLOUD_ACCESS_KEY_ID: Optional[str] = None
    ALIBABA_CLOUD_ACCESS_KEY_SECRET: Optional[str] = None
    ALIBABA_CLOUD_OSS_ENDPOINT: Optional[str] = None
    ALIBABA_CLOUD_OSS_BUCKET: Optional[str] = None

    STORAGE_MODE: str = "local"
    EXPORTS_DIR: str = (BACKEND_DIR / "exports").as_posix()
    UPLOADS_DIR: str = (BACKEND_DIR / "uploads").as_posix()
    QWEN_ALLOW_LLM_FALLBACK: bool = True
    QWEN_RUN_MODE: str = "mock"

    QWEN_GUARDRAILS_ENABLED: bool = True
    QWEN_MAX_CALLS_PER_RUN: int = 150
    QWEN_MAX_INPUT_TOKENS_PER_RUN: int = 100000
    QWEN_MAX_OUTPUT_TOKENS_PER_RUN: int = 20000
    QWEN_MAX_TOTAL_TOKENS_PER_RUN: int = 120000
    QWEN_MAX_ESTIMATED_COST_USD_PER_RUN: float = 1.0
    QWEN_MAX_REPAIR_ATTEMPTS_PER_SAMPLE: int = 1
    QWEN_STOP_ON_BUDGET_EXCEEDED: bool = True

    QWEN_MAX_SAMPLES_PER_RUN: int = 50
    QWEN_BUDGET_GUARDRAIL_MODE: str = "cap"

    @field_validator("QWEN_BUDGET_GUARDRAIL_MODE")
    @classmethod
    def validate_guardrail_mode(cls, v: str) -> str:
        mode = v.lower()
        if mode not in {"cap", "strict", "warn"}:
            raise ValueError("QWEN_BUDGET_GUARDRAIL_MODE must be one of: 'cap', 'strict', 'warn'")
        return mode

    @property
    def generator_model_name(self) -> str:
        return self.QWEN_GENERATOR_MODEL or self.QWEN_MODEL

    @property
    def evaluator_model_name(self) -> str:
        return self.QWEN_EVALUATOR_MODEL or self.QWEN_MODEL


    @property
    def effective_mock_llm(self) -> bool:
        run_mode = (self.QWEN_RUN_MODE or "mock").lower()
        if run_mode == "real":
            return False
        return True

    @property
    def effective_llm_mode(self) -> str:
        if self.effective_mock_llm or not self.QWEN_API_KEY:
            return "mock"
        return self.QWEN_RUN_MODE

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
