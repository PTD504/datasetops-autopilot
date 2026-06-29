from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

from backend.api import api_router
from backend.core.database import Base, engine, ensure_project_cancel_columns

# Automatically create DB schema on startup (especially useful for postgres container initialization)
Base.metadata.create_all(bind=engine)
ensure_project_cancel_columns()

load_dotenv()

# Parse allowed origins from environment variable
cors_origins_raw = os.getenv("CORS_ORIGINS", "")
cors_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

# Always ensure http://localhost:3000 and http://localhost:8000 are in the list
for fallback in ["http://localhost:3000", "http://localhost:8000"]:
    if fallback not in cors_origins:
        cors_origins.append(fallback)

app = FastAPI(title="DatasetOps Autopilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "1.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
