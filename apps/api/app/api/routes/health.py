"""Health check endpoint."""

from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("")
def health_check():
    """Basic health check."""
    return {"status": "ok"}


@router.get("/config")
def health_config():
    """Expose non-secret frontend configuration state."""
    return {
        "status": "ok",
        "server_openai_key_configured": bool(settings.OPENAI_API_KEY),
    }
