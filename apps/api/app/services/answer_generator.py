"""Answer generation service using a user-selected chat provider."""

from openai import OpenAI
from app.core.config import settings
from app.core.logging import logger
from app.core.openai_key import ChatProviderConfig
from app.services.prompt_builder import build_rag_prompt
from app.services.citation_builder import build_citations

_openai_clients: dict[tuple[str, str | None], OpenAI] = {}
_anthropic_clients: dict[str, object] = {}


def _get_openai_client(api_key: str | None = None, base_url: str | None = None) -> OpenAI:
    """Lazy-initialize an OpenAI-compatible client."""
    resolved_api_key = api_key or settings.OPENAI_API_KEY
    cache_key = (resolved_api_key, base_url)
    if cache_key not in _openai_clients:
        _openai_clients[cache_key] = OpenAI(api_key=resolved_api_key, base_url=base_url)
    return _openai_clients[cache_key]


def _get_anthropic_client(api_key: str):
    """Lazy-load Anthropic only when Claude is selected."""
    if api_key not in _anthropic_clients:
        try:
            from anthropic import Anthropic
        except ImportError as exc:
            raise RuntimeError("Anthropic support requires the 'anthropic' package.") from exc

        _anthropic_clients[api_key] = Anthropic(api_key=api_key)
    return _anthropic_clients[api_key]


def _generate_openai_compatible_answer(
    prompt: str,
    config: ChatProviderConfig,
    base_url: str | None = None,
) -> str:
    client = _get_openai_client(api_key=config.api_key, base_url=base_url)
    request = {
        "model": config.model,
        "messages": [
            {"role": "user", "content": prompt},
        ],
    }
    if config.provider == "openai":
        request["max_completion_tokens"] = 1024
    else:
        request["temperature"] = 0.2
        request["max_tokens"] = 1024

    response = client.chat.completions.create(**request)

    return response.choices[0].message.content or ""


def _generate_claude_answer(prompt: str, config: ChatProviderConfig) -> str:
    client = _get_anthropic_client(config.api_key)
    response = client.messages.create(
        model=config.model,
        messages=[
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=1024,
    )

    answer_parts = [
        block.text
        for block in response.content
        if getattr(block, "type", None) == "text" and getattr(block, "text", None)
    ]
    return "\n".join(answer_parts)


def generate_answer(
    question: str,
    chunks: list,
    chat_config: ChatProviderConfig | None = None,
    api_key: str | None = None,
) -> dict:
    """
    Generate a grounded answer from retrieved chunks.

    Args:
        question: The user's question
        chunks: List of DocumentChunk objects
        chat_config: Selected chat provider, API key, and model

    Returns:
        {"answer": str, "citations": list[dict]}
    """
    if not chunks:
        return {
            "answer": "I could not find that in the uploaded documents.",
            "citations": [],
        }

    prompt = build_rag_prompt(question, chunks)
    resolved_config = chat_config or ChatProviderConfig(
        provider="openai",
        api_key=api_key or settings.OPENAI_API_KEY,
        model=settings.CHAT_MODEL,
    )
    logger.info(f"Generating answer with {resolved_config.provider}:{resolved_config.model}")

    if resolved_config.provider == "claude":
        answer = _generate_claude_answer(prompt, resolved_config)
    elif resolved_config.provider == "grok":
        answer = _generate_openai_compatible_answer(
            prompt,
            resolved_config,
            base_url=settings.XAI_BASE_URL,
        )
    else:
        answer = _generate_openai_compatible_answer(prompt, resolved_config)

    # Build citations from retrieved chunks, never from model output. Unsupported
    # answers should not show unrelated retrieved chunks as sources.
    if answer.strip().startswith("I could not find that in the uploaded documents."):
        citations = []
    else:
        citations = build_citations(chunks)

    return {
        "answer": answer,
        "citations": citations,
    }
