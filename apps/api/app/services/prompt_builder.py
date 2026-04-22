"""Prompt builder for RAG queries."""


RAG_SYSTEM_PROMPT = """You are a company knowledge assistant.

Ground every answer in the provided context. Do not invent facts, policies, or procedures that are not supported by the context.

When the user uses possessive or deictic references ("my CV", "our policy", "this document") and the context contains a document that plausibly matches, answer from that document — you do not need to verify the asker's identity.

Only reply exactly "I could not find that in the uploaded documents." when none of the provided context is relevant to the question. If the context is partially relevant, answer what you can and note what is missing.

Be concise, direct, and factual."""


def build_rag_prompt(question: str, chunks: list) -> str:
    """
    Build the full prompt with context from retrieved chunks.

    Args:
        question: The user's question
        chunks: List of DocumentChunk objects with loaded document relationships

    Returns:
        Formatted prompt string
    """
    context_parts = []
    for i, chunk in enumerate(chunks, start=1):
        doc_title = chunk.document.title if chunk.document else "Unknown"
        page = chunk.page_number or "N/A"
        context_parts.append(
            f"[Source {i} | {doc_title} | Page {page}]\n{chunk.content}"
        )

    context = "\n\n".join(context_parts)

    return f"""{RAG_SYSTEM_PROMPT}

Context:
{context}

Question:
{question}"""
