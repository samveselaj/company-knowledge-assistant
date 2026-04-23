from fastapi import Header, HTTPException

from app.core.config import settings


def resolve_openai_api_key(x_openai_api_key: str | None = Header(default=None)) -> str:
    """Use a request-scoped OpenAI key when provided, otherwise fall back to server config."""
    api_key = x_openai_api_key or settings.OPENAI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="OpenAI API key required. Add one in the app or configure the server.",
        )
    return api_key
