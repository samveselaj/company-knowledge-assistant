"""Document parsing service for TXT, PDF, and DOCX files."""

import os
from app.core.logging import logger


def parse_document(file_path: str, mime_type: str | None = None) -> list[dict]:
    """
    Parse a document and return a list of page records.

    Returns:
        [{"page_number": 1, "text": "..."}, ...]
    """
    ext = os.path.splitext(file_path)[1].lower()

    if ext == ".txt" or mime_type == "text/plain":
        return _parse_txt(file_path)
    elif ext == ".pdf" or mime_type == "application/pdf":
        return _parse_pdf(file_path)
    elif ext in (".docx",) or mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return _parse_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def _parse_txt(file_path: str) -> list[dict]:
    """Parse a plain text file as a single page."""
    logger.info(f"Parsing TXT: {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()
    return [{"page_number": 1, "text": text}]


def _parse_pdf(file_path: str) -> list[dict]:
    """Parse a PDF file, one record per page."""
    logger.info(f"Parsing PDF: {file_path}")
    from pypdf import PdfReader

    reader = PdfReader(file_path)
    pages = []
    for i, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        if text.strip():
            pages.append({"page_number": i, "text": text})
    return pages


def _parse_docx(file_path: str) -> list[dict]:
    """Parse a DOCX file as a single page of concatenated paragraphs."""
    logger.info(f"Parsing DOCX: {file_path}")
    from docx import Document

    doc = Document(file_path)
    text = "\n".join(para.text for para in doc.paragraphs if para.text.strip())
    return [{"page_number": 1, "text": text}]
