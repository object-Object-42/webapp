import uuid

from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
from groq import Groq
from sqlmodel import SQLModel, select
from typing import Any

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.models import ChatMessage, Chat, ChatsPublic, ChatMessagesPublic, ChatPublic
from app.prompts import system_prompt_chat

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class ChatRequest(SQLModel):
    prompt: str
    level: int
    organisation: str

@router.post("/", response_model=ChatPublic)
def create_chat(
    *, session: SessionDep, current_user: CurrentUser
) -> Any:
    """
    Create new chat.
    """
    chat = Chat(user_id=current_user.id)

    session.add(chat)
    session.commit()
    session.refresh(chat)

    return chat


@router.post("/{chat_id}")
def create_chat_message(chat_id: uuid.UUID, chat_request: ChatRequest, session: SessionDep):
    """
    Create new chat message and generate response using Groq API.
    """
    # Prepare prompt with level
    enhanced_prompt = f"""
    {system_prompt_chat}
    Zielgruppe: {chat_request.level}
    Organisation: {chat_request.organisation}
    Frage: {chat_request.prompt}
    """

    chat_message = ChatMessage(
        chat_chat_id=chat_id,
        referenced_doc_id=chat_request.organisation,
        message_text=chat_request.prompt,
        is_from_bot=False
    )

    session.add(chat_message)
    session.commit()

    try:
        # Generate response using Groq API
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama3-8b-8192",
        )
        response_text = chat_completion.choices[0].message.content

        bot_chat_message = ChatMessage(
            chat_chat_id=chat_id,
            referenced_doc_id=chat_request.organisation,
            message_text=response_text,
            is_from_bot=True
        )

        session.add(bot_chat_message)
        session.commit()

        return {
            "message": response_text,
            "organisation": chat_request.organisation,
            "level": chat_request.level,
            "created_at": datetime.now(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating response: {str(e)}"
        )

@router.get("/", response_model=ChatsPublic)
def get_chats(session: SessionDep):
    """
    Get all available chats
    """
    chats = session.exec(select(Chat)).all()
    return ChatsPublic(data=chats, count=len(chats))


@router.get("/{chat_id}", response_model=ChatMessagesPublic)
def get_chat_messages(chat_id: uuid.UUID, session: SessionDep) -> ChatMessagesPublic:
    """
    Get messages of chat
    """
    chat = crud.get_chat_by_id(session=session, chat_id=chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = chat.chat_messages
    return ChatMessagesPublic(data=messages, count=len(messages))
