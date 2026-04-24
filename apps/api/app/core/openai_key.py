from dataclasses import dataclass

from fastapi import Header, HTTPException

from app.core.config import settings

SUPPORTED_CHAT_PROVIDERS = {"openai", "grok", "claude"}


@dataclass(frozen=True)
class ChatProviderConfig:
    provider: str
    api_key: str
    model: str


def resolve_openai_api_key(x_openai_api_key: str | None = Header(default=None)) -> str:
    """Use a request-scoped OpenAI key when provided, otherwise fall back to server config."""
    api_key = x_openai_api_key or settings.OPENAI_API_KEY
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail="OpenAI API key required. Add one in the app or configure the server.",
        )
    return api_key


def _server_chat_key(provider: str) -> str:
    if provider == "openai":
        return settings.OPENAI_API_KEY
    if provider == "grok":
        return settings.XAI_API_KEY or settings.GROK_API_KEY
    if provider == "claude":
        return settings.ANTHROPIC_API_KEY or settings.CLAUDE_API_KEY
    return ""


def _default_chat_model(provider: str) -> str:
    if provider == "grok":
        return settings.GROK_CHAT_MODEL
    if provider == "claude":
        return settings.CLAUDE_CHAT_MODEL
    return settings.CHAT_MODEL


def resolve_chat_provider_config(
    x_ai_provider: str | None = Header(default=None),
    x_ai_api_key: str | None = Header(default=None),
    x_ai_chat_model: str | None = Header(default=None),
    x_openai_api_key: str | None = Header(default=None),
) -> ChatProviderConfig:
    """Resolve request-scoped chat provider settings with server fallbacks."""
    provider = (x_ai_provider or settings.CHAT_PROVIDER or "openai").strip().lower()
    if provider not in SUPPORTED_CHAT_PROVIDERS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported chat provider: {provider}. Use openai, grok, or claude.",
        )

    api_key = (x_ai_api_key or "").strip()
    if not api_key and provider == "openai":
        api_key = (x_openai_api_key or "").strip()
    if not api_key:
        api_key = _server_chat_key(provider)

    if not api_key:
        raise HTTPException(
            status_code=400,
            detail=f"{provider.title()} API key required. Add one in the app or configure the server.",
        )

    model = (x_ai_chat_model or _default_chat_model(provider)).strip()
    if not model:
        raise HTTPException(
            status_code=400,
            detail=f"Chat model required for {provider.title()}.",
        )

    return ChatProviderConfig(provider=provider, api_key=api_key, model=model)


def is_server_chat_key_configured(provider: str | None = None) -> bool:
    resolved_provider = (provider or settings.CHAT_PROVIDER or "openai").strip().lower()
    return bool(_server_chat_key(resolved_provider))
