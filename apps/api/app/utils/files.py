"""File utility functions."""

import os
import uuid
from pathlib import Path

from app.core.config import settings


def get_upload_dir() -> Path:
    """Get the upload directory, creating it if necessary."""
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


def generate_safe_filename(original_filename: str) -> str:
    """Generate a unique, safe filename preserving the original extension."""
    ext = os.path.splitext(original_filename)[1].lower()
    return f"{uuid.uuid4().hex}{ext}"


def get_mime_type(filename: str) -> str | None:
    """Infer MIME type from file extension."""
    ext = os.path.splitext(filename)[1].lower()
    mime_map = {
        ".txt": "text/plain",
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }
    return mime_map.get(ext)


def delete_file(file_path: str) -> bool:
    """Delete a file from disk if it exists."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except OSError:
        pass
    return False
