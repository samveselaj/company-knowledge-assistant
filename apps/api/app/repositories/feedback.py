from sqlalchemy.orm import Session

from app.models.feedback import Feedback
from app.schemas.feedback import FeedbackCreate


def create_feedback(db: Session, feedback_data: FeedbackCreate) -> Feedback:
    """Create a new feedback record."""
    feedback = Feedback(
        message_id=feedback_data.message_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback
