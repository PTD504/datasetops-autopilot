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

    class Config:
        env_file = ".env"

settings = Settings()
