"""Embedding service using OpenAI."""

from openai import OpenAI
from app.core.config import settings
from app.core.logging import logger

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    """Lazy-initialize the OpenAI client."""
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def embed_text(text: str) -> list[float]:
    """Generate an embedding for a single text string."""
    client = _get_client()
    response = client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts."""
    if not texts:
        return []

    client = _get_client()
    logger.info(f"Embedding {len(texts)} texts with {settings.EMBEDDING_MODEL}")

    # OpenAI supports batching natively
    response = client.embeddings.create(
        model=settings.EMBEDDING_MODEL,
        input=texts,
    )

    # Sort by index to maintain order
    sorted_data = sorted(response.data, key=lambda x: x.index)
    return [item.embedding for item in sorted_data]
