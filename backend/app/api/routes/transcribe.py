from fastapi import APIRouter, HTTPException, UploadFile, File
from sqlmodel import SQLModel
from pydantic import BaseModel
from groq import Groq
import os
from typing import Optional

router = APIRouter()

# Initialize Groq client with environment variable
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class TranscriptionResponse(BaseModel):
    transcription: Optional[str] = None
    error: Optional[str] = None

@router.post("/")
async def transcribe(*, file: UploadFile = File(...)) -> TranscriptionResponse:
    try:
        file_content = await file.read()

        transcription = groq_client.audio.transcriptions.create(
            file=(file.filename, file_content),
            model="whisper-large-v3-turbo",
            response_format="json",
            language="de",
            temperature=0.0,
        )

        return TranscriptionResponse(transcription=transcription.text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")
