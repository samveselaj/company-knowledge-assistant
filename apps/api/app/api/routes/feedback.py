"""Feedback endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.repositories.feedback import create_feedback

router = APIRouter()


@router.post("", response_model=FeedbackResponse)
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Submit feedback (thumbs up/down) on a chat message."""
    feedback = create_feedback(db, payload)
    return feedback
