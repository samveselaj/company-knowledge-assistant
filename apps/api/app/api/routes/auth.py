"""Authentication endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import create_access_token, get_current_user, verify_password
from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.repositories.users import create_user, get_user_by_email
from app.schemas.auth import AuthResponse, LoginRequest, RegisterRequest, UserResponse

router = APIRouter()


def _normalize_role(requested_role: str) -> str:
    role = requested_role.lower().strip()
    if role not in {"admin", "user"}:
        raise HTTPException(status_code=400, detail="Role must be admin or user")
    if settings.APP_ENV.lower() not in {"development", "dev", "local"}:
        return "user"
    return role


@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a user. Role selection is only honored in local development."""
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=409, detail="Email is already registered")

    user = create_user(
        db,
        email=payload.email,
        password=payload.password,
        role=_normalize_role(payload.role),
    )
    return AuthResponse(access_token=create_access_token(user), user=user)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    user = get_user_by_email(db, payload.email)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return AuthResponse(access_token=create_access_token(user), user=user)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the authenticated user."""
    return current_user
