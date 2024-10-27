import uuid

from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
from groq import Groq
from sqlmodel import SQLModel, select
from typing import Any

from app import crud
from app.api.deps import SessionDep, CurrentUser
from app.models import (
    ChatMessage,
    Chat,
    ChatsPublic,
    ChatMessagesPublic,
    ChatPublic,
)
from app.prompts import system_prompt_chat

from app.api.helper.context import fetch_content


router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class ChatMessageRequest(SQLModel):
    prompt: str
    level: int


class ChatCreateRequest(SQLModel):
    organisation_id: uuid.UUID


@router.post("/", response_model=ChatPublic)
def create_chat(
    chat_create_request: ChatCreateRequest,
    session: SessionDep,
    current_user: CurrentUser,
) -> Any:
    """
    Create new chat.
    """
    chat = Chat(
        user_id=current_user.id, org_id=chat_create_request.organisation_id
    )

    session.add(chat)
    session.commit()
    session.refresh(chat)

    return chat


@router.post("/{chat_id}", response_model=ChatMessage)
def create_chat_message(
    chat_id: uuid.UUID,
    chat_request: ChatMessageRequest,
    session: SessionDep,
    current_user: CurrentUser,
):
    """
    Create new chat message and generate response using Groq API.
    """
    chat = crud.get_chat_by_id(session=session, chat_id=chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Prepare prompt with level
    enhanced_prompt = f"""
    {system_prompt_chat}
    Zielgruppe: {chat_request.level}
    Organisation: {chat.org_id}
    Frage: {chat_request.prompt}
    Kontext: {fetch_content(fetch_size=10)}
    Frage: {chat_request.prompt}
    """

    chat_message = ChatMessage(
        chat_id=chat_id,
        # doc_id=   # coming soon
        message_text=chat_request.prompt,
        is_from_bot=False,
    )

    session.add(chat_message)
    session.commit()

    try:
        # Generate response using Groq API
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama-3.1-70b-versatile",
        )
        response_text = chat_completion.choices[0].message.content

        bot_chat_message = ChatMessage(
            chat_id=chat_id,
            # doc_id=   # coming soon
            message_text=response_text,
            is_from_bot=True,
        )

        session.add(bot_chat_message)
        session.commit()
        session.refresh(bot_chat_message)

        return bot_chat_message

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating response: {str(e)}"
        )


@router.get("/", response_model=ChatsPublic)
def get_chats(session: SessionDep, current_user: CurrentUser):
    """
    Get all available chats
    """
    chats = session.exec(select(Chat)).all()
    return ChatsPublic(data=chats, count=len(chats))


@router.get("/{chat_id}", response_model=ChatMessagesPublic)
def get_chat_messages(
    chat_id: uuid.UUID, session: SessionDep, current_user: CurrentUser
) -> ChatMessagesPublic:
    """
    Get messages of chat
    """
    chat = crud.get_chat_by_id(session=session, chat_id=chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = chat.chat_messages
    return ChatMessagesPublic(data=messages, count=len(messages))
