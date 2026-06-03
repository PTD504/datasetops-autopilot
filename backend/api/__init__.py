from fastapi import APIRouter
from .projects import router as projects_router
from .health import router as health_router

api_router = APIRouter()
api_router.include_router(health_router, prefix="/health", tags=["health"])
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
