"""Chat / RAG endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.core.logging import logger
from app.core.openai_key import ChatProviderConfig, resolve_chat_provider_config, resolve_openai_api_key
from app.models.user import User
from app.schemas.chat import AskRequest, AskResponse
from app.repositories.chats import create_session, get_session_by_id, create_message
from app.services.retrieval import retrieve_relevant_chunks
from app.services.answer_generator import generate_answer

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
def ask_question(
    payload: AskRequest,
    db: Session = Depends(get_db),
    api_key: str = Depends(resolve_openai_api_key),
    chat_config: ChatProviderConfig = Depends(resolve_chat_provider_config),
    current_user: User = Depends(get_current_user),
):
    """
    Core RAG endpoint.

    Flow:
    1. Create/resume session
    2. Save user message
    3. Retrieve relevant chunks
    4. Generate grounded answer
    5. Save assistant message
    6. Return answer with citations
    """
    # 1. Create or resume session
    if payload.session_id:
        session = get_session_by_id(db, payload.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = create_session(db, title=payload.question[:100])

    # 2. Save user message
    create_message(db, session.id, role="user", content=payload.question)

    # 3. Retrieve relevant chunks
    chunks = retrieve_relevant_chunks(
        db,
        question=payload.question,
        department=payload.department,
        api_key=api_key,
    )

    # 4. Generate answer
    result = generate_answer(payload.question, chunks, chat_config=chat_config)

    # 5. Save assistant message with citations
    create_message(
        db,
        session.id,
        role="assistant",
        content=result["answer"],
        citations=result["citations"],
    )

    logger.info(f"Answered question in session {session.id}")

    # 6. Return response
    return AskResponse(
        session_id=session.id,
        answer=result["answer"],
        citations=result["citations"],
    )
