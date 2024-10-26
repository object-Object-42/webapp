from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from sqlmodel import Session
from pydantic import BaseModel
from groq import Groq
import os
from typing import Optional

from app.models import ContentBase
from app.api.deps import SessionDep
from app.crud import create_content

router = APIRouter()

# Initialize Groq client with environment variable
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class TranscriptionResponse(BaseModel):
    transcription: Optional[str] = None
    error: Optional[str] = None

@router.post("/")
async def transcribe(*,
    org_id: int,
    file: UploadFile = File(...),
    session: SessionDep
) -> TranscriptionResponse:
    try:
        file_content = await file.read()

        transcription = groq_client.audio.transcriptions.create(
            file=(file.filename, file_content),
            model="whisper-large-v3-turbo",
            response_format="json",
            language="de",
            temperature=0.0,
        )

        content_data = ContentBase(
            doc_name=file.filename,
            content_text=transcription.text,
            url=None
        )
        
        db_content = create_content(
            session=session,
            content_data=content_data,
            org_id=org_id
        )

        return TranscriptionResponse(transcription=db_content.content_text)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error transcribing audio: {str(e)}")
