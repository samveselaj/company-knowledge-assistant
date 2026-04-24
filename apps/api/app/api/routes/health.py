"""Health check endpoint."""

from fastapi import APIRouter

from app.core.config import settings
from app.core.openai_key import is_server_chat_key_configured

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
        "server_chat_provider": settings.CHAT_PROVIDER,
        "server_chat_key_configured": is_server_chat_key_configured(),
        "server_chat_keys_configured": {
            "openai": is_server_chat_key_configured("openai"),
            "grok": is_server_chat_key_configured("grok"),
            "claude": is_server_chat_key_configured("claude"),
        },
    }
