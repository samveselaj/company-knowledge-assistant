"""Document management endpoints."""

import os
import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.auth import get_current_user, require_admin
from app.core.database import get_db
from app.core.logging import logger
from app.core.openai_key import resolve_openai_api_key
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentListResponse
from app.schemas.common import StatusResponse
from app.repositories.documents import (
    create_document,
    get_document_by_id,
    list_documents,
    count_documents,
    delete_document,
)
from app.services.indexing_service import index_document
from app.utils.files import get_upload_dir, generate_safe_filename, get_mime_type, delete_file

router = APIRouter()

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx"}


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    department: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Upload a document file and create a database record."""
    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {ext}. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Save file to disk
    upload_dir = get_upload_dir()
    safe_name = generate_safe_filename(file.filename or "upload.txt")
    file_path = str(upload_dir / safe_name)

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # Determine title from filename if not provided
    doc_title = title or os.path.splitext(file.filename or "upload")[0]

    # Create DB record
    doc = create_document(
        db=db,
        title=doc_title,
        file_name=file.filename or "upload.txt",
        file_path=file_path,
        mime_type=get_mime_type(file.filename or ""),
        file_size=len(contents),
        department=department,
    )

    logger.info(f"Uploaded document: {doc.title} ({doc.id})")
    return doc


@router.get("", response_model=DocumentListResponse)
def get_documents(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all uploaded documents."""
    docs = list_documents(db, skip=skip, limit=limit)
    total = count_documents(db)
    return DocumentListResponse(documents=docs, total=total)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get a single document."""
    doc = get_document_by_id(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.post("/{document_id}/index", response_model=StatusResponse)
def trigger_indexing(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    api_key: str = Depends(resolve_openai_api_key),
    current_user: User = Depends(require_admin),
):
    """Trigger the indexing pipeline for a document."""
    doc = get_document_by_id(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    try:
        index_document(db, document_id, api_key=api_key)
        return StatusResponse(status="ok", message="Document indexed successfully")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{document_id}/reindex", response_model=StatusResponse)
def trigger_reindexing(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    api_key: str = Depends(resolve_openai_api_key),
    current_user: User = Depends(require_admin),
):
    """Re-run the indexing pipeline for a document."""
    return trigger_indexing(document_id=document_id, db=db, api_key=api_key, current_user=current_user)


@router.delete("/{document_id}", response_model=StatusResponse)
def remove_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Delete a document, its chunks, and the file from disk."""
    doc = get_document_by_id(db, document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from disk
    delete_file(doc.file_path)

    # Delete DB record (chunks cascade)
    delete_document(db, document_id)

    logger.info(f"Deleted document: {doc.title} ({doc.id})")
    return StatusResponse(status="ok", message="Document deleted")
