"""Citation builder — builds citation objects from retrieved chunks."""


def build_citations(chunks: list) -> list[dict]:
    """
    Build citation objects from retrieved DocumentChunk instances.

    Args:
        chunks: List of DocumentChunk ORM objects with loaded document relationship

    Returns:
        List of citation dicts matching CitationResponse schema
    """
    citations = []
    for chunk in chunks:
        doc_title = chunk.document.title if chunk.document else "Unknown"
        citations.append(
            {
                "document_id": str(chunk.document_id),
                "document_title": doc_title,
                "chunk_id": str(chunk.id),
                "snippet": chunk.content[:300],
                "page_number": chunk.page_number,
            }
        )
    return citations
