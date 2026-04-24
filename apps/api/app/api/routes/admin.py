"""Admin stats endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import require_admin
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import AdminStats
from app.repositories.documents import count_documents, count_documents_by_status
from app.repositories.chats import count_sessions

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Return admin dashboard statistics."""
    return AdminStats(
        total_documents=count_documents(db),
        indexed_documents=count_documents_by_status(db, "indexed"),
        pending_documents=count_documents_by_status(db, "pending"),
        failed_documents=count_documents_by_status(db, "failed"),
        total_sessions=count_sessions(db),
    )
