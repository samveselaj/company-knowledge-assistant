from uuid import UUID
from pydantic import BaseModel


class FeedbackCreate(BaseModel):
    message_id: UUID
    rating: str
    comment: str | None = None


class FeedbackResponse(BaseModel):
    id: UUID
    message_id: UUID
    rating: str
    comment: str | None = None

    class Config:
        from_attributes = True
