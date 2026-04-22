from pydantic import BaseModel


class StatusResponse(BaseModel):
    status: str
    message: str = ""


class AdminStats(BaseModel):
    total_documents: int
    indexed_documents: int
    pending_documents: int
    failed_documents: int
    total_sessions: int
