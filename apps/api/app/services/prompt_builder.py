"""Prompt builder for RAG queries."""


RAG_SYSTEM_PROMPT = """You are a company knowledge assistant.
Answer the user's question using ONLY the provided context.
If the answer is not clearly present in the context, say:
"I could not find that in the uploaded documents."
Do not invent policies, numbers, procedures, or citations.
Be concise, factual, and cite the provided sources."""


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
