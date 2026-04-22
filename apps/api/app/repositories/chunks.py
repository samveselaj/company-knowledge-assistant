import uuid
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.models.chunk import DocumentChunk


def create_chunks(
    db: Session,
    document_id: uuid.UUID,
    chunk_records: list[dict],
) -> list[DocumentChunk]:
    """Create chunk records for a document."""
    chunks = []
    for record in chunk_records:
        chunk = DocumentChunk(
            document_id=document_id,
            chunk_index=record["chunk_index"],
            content=record["content"],
            page_number=record.get("page_number"),
            section_title=record.get("section_title"),
            token_count=record.get("token_count"),
            embedding=record.get("embedding"),
        )
        db.add(chunk)
        chunks.append(chunk)
    db.commit()
    for chunk in chunks:
        db.refresh(chunk)
    return chunks


def delete_chunks_by_document_id(db: Session, document_id: uuid.UUID) -> int:
    """Delete all chunks for a given document."""
    count = (
        db.query(DocumentChunk)
        .filter(DocumentChunk.document_id == document_id)
        .delete()
    )
    db.commit()
    return count


def search_similar_chunks(
    db: Session,
    query_embedding: list[float],
    limit: int = 5,
    department: str | None = None,
) -> list[DocumentChunk]:
    """Search for chunks similar to the query embedding using pgvector cosine distance."""
    from app.models.document import Document

    query = (
        db.query(DocumentChunk)
        .join(Document, DocumentChunk.document_id == Document.id)
        .filter(Document.status == "indexed")
        .filter(DocumentChunk.embedding.isnot(None))
    )

    if department:
        query = query.filter(Document.department == department)

    # Order by cosine distance (pgvector <=> operator)
    query = query.order_by(
        DocumentChunk.embedding.cosine_distance(query_embedding)
    ).limit(limit)

    return query.all()
