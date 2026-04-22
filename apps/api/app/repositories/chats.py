import uuid
from sqlalchemy.orm import Session

from app.models.chat import ChatSession, ChatMessage


def create_session(db: Session, title: str | None = None) -> ChatSession:
    """Create a new chat session."""
    session = ChatSession(title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def get_session_by_id(db: Session, session_id: uuid.UUID) -> ChatSession | None:
    """Get a chat session by ID."""
    return db.query(ChatSession).filter(ChatSession.id == session_id).first()


def create_message(
    db: Session,
    session_id: uuid.UUID,
    role: str,
    content: str,
    citations: dict | None = None,
) -> ChatMessage:
    """Create a new chat message."""
    message = ChatMessage(
        session_id=session_id,
        role=role,
        content=content,
        citations=citations,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


def get_session_messages(
    db: Session, session_id: uuid.UUID
) -> list[ChatMessage]:
    """Get all messages in a session ordered by creation time."""
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.session_id == session_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )


def count_sessions(db: Session) -> int:
    """Count total chat sessions."""
    return db.query(ChatSession).count()
