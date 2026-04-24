from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: UUID
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    role: str = "user"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
