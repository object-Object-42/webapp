from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
from groq import Groq
from sqlmodel import SQLModel, select
from typing import Any

from app.api.deps import SessionDep
from app.models import ChatMessage, Chat, ChatsPublic, ChatMessagesPublic
from app.prompts import system_prompt_chat

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class ChatRequest(SQLModel):
    prompt: str
    level: int
    organisation: str


@router.post("/{id}")
def create_chat(*, chat_request: ChatRequest):
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

    try:
        # Generate response using Groq API
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama3-8b-8192",
        )
        response_text = chat_completion.choices[0].message.content

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
def get_messages(chat_id: int, session: SessionDep) -> ChatMessagesPublic:
    """
    Get messages of chat
    """
    chat = session.get(Chat, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    messages = chat.chat_messages
    return ChatMessagesPublic(data=messages, count=len(messages))
