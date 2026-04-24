"""Vector retrieval service."""

import re

from sqlalchemy.orm import Session

from app.models.chunk import DocumentChunk
from app.repositories.chunks import search_similar_chunks
from app.services.embeddings import embed_text
from app.core.logging import logger


QUERY_EXPANSIONS = {
    "mfa": "multi-factor authentication",
    "pto": "paid time off",
    "sla": "service level agreement",
}


def _expand_query_terms(question: str) -> str:
    expansions = [
        expansion
        for term, expansion in QUERY_EXPANSIONS.items()
        if re.search(rf"\b{re.escape(term)}\b", question, flags=re.IGNORECASE)
    ]
    if not expansions:
        return question
    return f"{question} ({'; '.join(expansions)})"


def retrieve_relevant_chunks(
    db: Session,
    question: str,
    limit: int = 5,
    department: str | None = None,
    api_key: str | None = None,
) -> list[DocumentChunk]:
    """
    Embed the question and retrieve the most similar chunks from the vector store.
    """
    logger.info(f"Retrieving chunks for question: {question[:80]}...")

    query_embedding = embed_text(_expand_query_terms(question), api_key=api_key)
    chunks = search_similar_chunks(
        db,
        query_embedding=query_embedding,
        limit=limit,
        department=department,
    )

    logger.info(f"Retrieved {len(chunks)} relevant chunks")
    return chunks
