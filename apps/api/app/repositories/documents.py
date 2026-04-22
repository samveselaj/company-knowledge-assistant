import uuid
from sqlalchemy.orm import Session

from app.models.document import Document


def create_document(
    db: Session,
    title: str,
    file_name: str,
    file_path: str,
    mime_type: str | None = None,
    file_size: int | None = None,
    department: str | None = None,
) -> Document:
    """Create a new document record."""
    doc = Document(
        title=title,
        file_name=file_name,
        file_path=file_path,
        mime_type=mime_type,
        file_size=file_size,
        department=department,
        status="pending",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def get_document_by_id(db: Session, document_id: uuid.UUID) -> Document | None:
    """Get a single document by its ID."""
    return db.query(Document).filter(Document.id == document_id).first()


def list_documents(db: Session, skip: int = 0, limit: int = 100) -> list[Document]:
    """List all documents ordered by creation date descending."""
    return (
        db.query(Document)
        .order_by(Document.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def count_documents(db: Session) -> int:
    """Count total documents."""
    return db.query(Document).count()


def count_documents_by_status(db: Session, status: str) -> int:
    """Count documents by status."""
    return db.query(Document).filter(Document.status == status).count()


def update_document_status(
    db: Session,
    document_id: uuid.UUID,
    status: str,
    error_message: str | None = None,
) -> Document | None:
    """Update a document's status."""
    doc = get_document_by_id(db, document_id)
    if doc:
        doc.status = status
        if error_message is not None:
            doc.error_message = error_message
        db.commit()
        db.refresh(doc)
    return doc


def delete_document(db: Session, document_id: uuid.UUID) -> bool:
    """Delete a document and its chunks (via cascade)."""
    doc = get_document_by_id(db, document_id)
    if doc:
        db.delete(doc)
        db.commit()
        return True
    return False
