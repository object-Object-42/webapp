from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
from groq import Groq
from sqlmodel import SQLModel
import google.generativeai as genai


from app.api.helper.context import fetch_content

from app.prompts import system_prompt_chat

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel("gemini-1.5-flash-002")
# print(response.text)


class ChatRequest(SQLModel):
    prompt: str
    level: int
    organisation: str = "Rechenzentrum"


@router.post("/")
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
    Kontext: {fetch_content()}
    Frage: {chat_request.prompt}
    """

    print(enhanced_prompt)

    try:
        # Generate response using Groq API
        # chat_completion = client.chat.completions.create(
        #     messages=[{"role": "user", "content": enhanced_prompt}],
        #     model="llama3-8b-8192",
        # )
        # response_text = chat_completion.choices[0].message.content

        response = model.generate_content(enhanced_prompt)

        return {
            "message": response.text,
            "organisation": chat_request.organisation,
            "level": chat_request.level,
            "created_at": datetime.now(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating response: {str(e)}"
        )


# TODO: implement GET request for specific chat history /{chat_id}

# TODO: implement GET request for /
