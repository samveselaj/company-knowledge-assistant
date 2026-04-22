"""Document indexing orchestration service."""

import uuid
from sqlalchemy.orm import Session

from app.core.logging import logger
from app.repositories.documents import get_document_by_id, update_document_status
from app.repositories.chunks import create_chunks, delete_chunks_by_document_id
from app.services.document_parser import parse_document
from app.services.chunking import chunk_pages
from app.services.embeddings import embed_texts


def index_document(db: Session, document_id: uuid.UUID) -> None:
    """
    Full indexing pipeline for a document.

    1. Load document record
    2. Set status to processing
    3. Parse document file
    4. Chunk text
    5. Embed chunks
    6. Store chunks with embeddings
    7. Set status to indexed
    """
    document = get_document_by_id(db, document_id)
    if not document:
        raise ValueError(f"Document {document_id} not found")

    logger.info(f"Indexing document: {document.title} ({document.id})")
    update_document_status(db, document_id, "processing")

    try:
        # Clear any existing chunks (re-indexing)
        delete_chunks_by_document_id(db, document_id)

        # Parse
        pages = parse_document(document.file_path, document.mime_type)
        logger.info(f"Parsed {len(pages)} pages from {document.file_name}")

        # Chunk
        chunk_records = chunk_pages(pages)
        logger.info(f"Created {len(chunk_records)} chunks")

        if not chunk_records:
            update_document_status(db, document_id, "failed", "No text content found")
            return

        # Embed
        texts = [c["content"] for c in chunk_records]
        vectors = embed_texts(texts)

        for chunk, vector in zip(chunk_records, vectors):
            chunk["embedding"] = vector

        # Store
        create_chunks(db, document_id, chunk_records)

        update_document_status(db, document_id, "indexed")
        logger.info(f"Successfully indexed document: {document.title}")

    except Exception as e:
        logger.error(f"Failed to index document {document_id}: {e}")
        update_document_status(db, document_id, "failed", str(e))
        raise
