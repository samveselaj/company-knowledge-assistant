"""Answer generation service using OpenAI chat completion."""

from openai import OpenAI
from app.core.config import settings
from app.core.logging import logger
from app.services.prompt_builder import build_rag_prompt
from app.services.citation_builder import build_citations

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


def generate_answer(question: str, chunks: list, api_key: str | None = None) -> dict:
    """
    Generate a grounded answer from retrieved chunks.

    Args:
        question: The user's question
        chunks: List of DocumentChunk objects

    Returns:
        {"answer": str, "citations": list[dict]}
    """
    if not chunks:
        return {
            "answer": "I could not find that in the uploaded documents.",
            "citations": [],
        }

    prompt = build_rag_prompt(question, chunks)
    logger.info(f"Generating answer with {settings.CHAT_MODEL}")

    client = _get_client(api_key)
    response = client.chat.completions.create(
        model=settings.CHAT_MODEL,
        messages=[
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=1024,
    )

    answer = response.choices[0].message.content

    # Build citations from the actual retrieved chunks — never from model output
    citations = build_citations(chunks)

    return {
        "answer": answer,
        "citations": citations,
    }
