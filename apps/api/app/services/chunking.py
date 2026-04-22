"""Text chunking service with overlap."""


def chunk_pages(
    pages: list[dict],
    chunk_size: int = 1200,
    overlap: int = 200,
) -> list[dict]:
    """
    Split page records into overlapping chunks.

    Args:
        pages: List of {"page_number": int, "text": str}
        chunk_size: Maximum characters per chunk
        overlap: Character overlap between chunks

    Returns:
        List of chunk records with metadata.
    """
    chunks = []
    chunk_index = 0

    for page in pages:
        text = page["text"]
        page_number = page.get("page_number")

        if not text.strip():
            continue

        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end]

            # Try to break at sentence boundary if not at end
            if end < len(text):
                last_period = chunk_text.rfind(". ")
                last_newline = chunk_text.rfind("\n")
                break_point = max(last_period, last_newline)
                if break_point > chunk_size // 2:
                    chunk_text = chunk_text[: break_point + 1]
                    end = start + break_point + 1

            if chunk_text.strip():
                chunks.append(
                    {
                        "chunk_index": chunk_index,
                        "content": chunk_text.strip(),
                        "page_number": page_number,
                        "section_title": None,
                        "token_count": len(chunk_text.split()),
                    }
                )
                chunk_index += 1

            start = end - overlap if end < len(text) else len(text)

    return chunks
