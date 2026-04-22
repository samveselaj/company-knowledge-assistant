"""Feedback endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.repositories.feedback import create_feedback

router = APIRouter()


@router.post("", response_model=FeedbackResponse)
def submit_feedback(
    payload: FeedbackCreate,
    db: Session = Depends(get_db),
):
    """Submit feedback (thumbs up/down) on a chat message."""
    feedback = create_feedback(db, payload)
    return feedback
