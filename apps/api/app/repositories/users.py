from sqlalchemy.orm import Session

from app.core.auth import hash_password
from app.models.user import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def create_user(db: Session, email: str, password: str, role: str) -> User:
    user = User(
        email=email.lower(),
        password_hash=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def seed_demo_users(db: Session) -> None:
    demo_users = [
        ("admin@example.com", "admin123", "admin"),
        ("user@example.com", "user123", "user"),
    ]

    for email, password, role in demo_users:
        if not get_user_by_email(db, email):
            create_user(db, email=email, password=password, role=role)
