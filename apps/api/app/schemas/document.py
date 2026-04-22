from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: UUID
    title: str
    file_name: str
    status: str
    department: str | None = None
    error_message: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    documents: list[DocumentResponse]
    total: int
