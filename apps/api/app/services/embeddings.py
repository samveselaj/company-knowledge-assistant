"""Embedding service using OpenAI."""

from openai import OpenAI
from app.core.config import settings
from app.core.logging import logger

_client: OpenAI | None = None
_client_api_key: str | None = None


def _get_client(api_key: str | None = None) -> OpenAI:
    """Lazy-initialize the OpenAI client."""
    global _client, _client_api_key
    resolved_api_key = api_key or settings.OPENAI_API_KEY
    if _client is None or _client_api_key != resolved_api_key:
        _client = OpenAI(api_key=resolved_api_key)
        _client_api_key = resolved_api_key
    return _client


def embed_text(text: str, api_key: str | None = None) -> list[float]:
    """Generate an embedding for a single text string."""
    client = _get_client(api_key)
    response = client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


def embed_texts(texts: list[str], api_key: str | None = None) -> list[list[float]]:
    """Generate embeddings for a batch of texts."""
    if not texts:
        return []

    client = _get_client(api_key)
    logger.info(f"Embedding {len(texts)} texts with {settings.EMBEDDING_MODEL}")

    # OpenAI supports batching natively
    response = client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=texts,
    )

    # Sort by index to maintain order
    sorted_data = sorted(response.data, key=lambda x: x.index)
    return [item.embedding for item in sorted_data]
