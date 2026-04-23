"""Vector retrieval service."""

from sqlalchemy.orm import Session

from app.models.chunk import DocumentChunk
from app.repositories.chunks import search_similar_chunks
from app.services.embeddings import embed_text
from app.core.logging import logger


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

    query_embedding = embed_text(question, api_key=api_key)
    chunks = search_similar_chunks(
        db,
        query_embedding=query_embedding,
        limit=limit,
        department=department,
    )

    logger.info(f"Retrieved {len(chunks)} relevant chunks")
    return chunks
