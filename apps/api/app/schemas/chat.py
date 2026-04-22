from uuid import UUID
from pydantic import BaseModel


class AskRequest(BaseModel):
    session_id: UUID | None = None
    question: str
    department: str | None = None


class CitationResponse(BaseModel):
    document_id: UUID
    document_title: str
    chunk_id: UUID
    snippet: str
    page_number: int | None = None


class AskResponse(BaseModel):
    session_id: UUID
    answer: str
    citations: list[CitationResponse]
