"""Dynamic provider model lookup — proxies provider /models endpoints with caching."""

from __future__ import annotations

import hashlib
import re
import time
from typing import Any

import httpx
from fastapi import APIRouter, Header, HTTPException

from app.core.openai_key import SUPPORTED_CHAT_PROVIDERS, _server_chat_key

router = APIRouter()

_CACHE_TTL_SECONDS = 60 * 60
_cache: dict[str, tuple[float, list[dict[str, str]]]] = {}

_PROVIDER_ENDPOINTS = {
    "openai": "https://api.openai.com/v1/models",
    "grok": "https://api.x.ai/v1/models",
    "claude": "https://api.anthropic.com/v1/models",
}

_CHAT_MODEL_PREFIXES = {
    "openai": ("gpt-",),
    "grok": ("grok-",),
    "claude": ("claude-",),
}

_OPENAI_NON_CHAT_KEYWORDS = (
    "audio", "tts", "whisper", "embedding", "image", "moderation",
    "transcribe", "realtime", "search", "computer-use",
)


def _humanize(model_id: str, provider: str) -> str:
    """Best-effort marketing label from a model id."""
    base = re.sub(r"-\d{8}$", "", model_id)  # strip Anthropic date suffix
    base = re.sub(r"-(latest|preview)$", r" \1", base)

    if provider == "claude":
        cleaned = base.replace("claude-", "")
        parts = cleaned.split("-")
        family = parts[0].title() if parts else cleaned
        version = "-".join(parts[1:]).replace("-", ".")
        return f"Claude {family} {version}".strip()

    if provider == "grok":
        cleaned = base.replace("grok-", "Grok ")
        return cleaned.replace("-", " ").replace("  ", " ")

    if provider == "openai":
        cleaned = base.replace("gpt-", "GPT-")
        return cleaned.replace("-", " ")

    return model_id


def _filter_chat_models(provider: str, raw: list[dict[str, Any]]) -> list[dict[str, str]]:
    prefixes = _CHAT_MODEL_PREFIXES.get(provider, ())
    seen: set[str] = set()
    out: list[dict[str, str]] = []
    for entry in raw:
        model_id = entry.get("id") or entry.get("name") or ""
        if not isinstance(model_id, str) or not model_id:
            continue
        if prefixes and not any(model_id.startswith(p) for p in prefixes):
            continue
        if provider == "openai" and any(k in model_id for k in _OPENAI_NON_CHAT_KEYWORDS):
            continue
        if model_id in seen:
            continue
        seen.add(model_id)
        out.append({
            "id": model_id,
            "label": entry.get("display_name") or _humanize(model_id, provider),
        })
    out.sort(key=lambda m: m["id"], reverse=True)
    return out


def _cache_key(provider: str, api_key: str) -> str:
    return f"{provider}:{hashlib.sha256(api_key.encode()).hexdigest()[:16]}"


async def _fetch_provider_models(provider: str, api_key: str) -> list[dict[str, str]]:
    url = _PROVIDER_ENDPOINTS[provider]
    headers: dict[str, str] = {}
    if provider == "claude":
        headers["x-api-key"] = api_key
        headers["anthropic-version"] = "2023-06-01"
    else:
        headers["Authorization"] = f"Bearer {api_key}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=headers)
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid API key for provider.")
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="Provider rate limit reached.")
    if response.status_code >= 400:
        raise HTTPException(
            status_code=502,
            detail=f"Provider returned {response.status_code} when listing models.",
        )

    payload = response.json()
    raw = payload.get("data", payload if isinstance(payload, list) else [])
    if not isinstance(raw, list):
        raise HTTPException(status_code=502, detail="Unexpected provider response shape.")
    return _filter_chat_models(provider, raw)


@router.get("/{provider}/models")
async def list_provider_models(
    provider: str,
    refresh: bool = False,
    x_ai_api_key: str | None = Header(default=None),
    x_openai_api_key: str | None = Header(default=None),
):
    provider = provider.strip().lower()
    if provider not in SUPPORTED_CHAT_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}.")

    api_key = (x_ai_api_key or "").strip()
    if not api_key and provider == "openai":
        api_key = (x_openai_api_key or "").strip()
    if not api_key:
        api_key = _server_chat_key(provider)
    if not api_key:
        raise HTTPException(
            status_code=400,
            detail=f"{provider.title()} API key required to list models.",
        )

    key = _cache_key(provider, api_key)
    now = time.time()
    cached = _cache.get(key)
    if cached and not refresh and now - cached[0] < _CACHE_TTL_SECONDS:
        return {"provider": provider, "models": cached[1], "cached": True, "fetched_at": cached[0]}

    models = await _fetch_provider_models(provider, api_key)
    _cache[key] = (now, models)
    return {"provider": provider, "models": models, "cached": False, "fetched_at": now}
