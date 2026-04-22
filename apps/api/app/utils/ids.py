"""ID utility functions."""

import uuid


def generate_uuid() -> uuid.UUID:
    """Generate a new UUID4."""
    return uuid.uuid4()
