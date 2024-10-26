from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
from groq import Groq
from elevenlabs import Voice, VoiceSettings, save
from elevenlabs.client import ElevenLabs
from fastapi.responses import StreamingResponse
from io import BytesIO
from sqlmodel import SQLModel

from app.prompts import system_prompt_podcast

router = APIRouter()

# Initialize clients
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
eleven_client = ElevenLabs(api_key=os.getenv("ELEVEN_API_KEY"))


class PodcastRequest(SQLModel):
    prompt: str
    level: int
    organisation: str


@router.post("/")
async def create_podcast(*, podcast_request: PodcastRequest) -> StreamingResponse:
    """
    Create a podcast from text using Groq for content generation and ElevenLabs for text-to-speech.
    """
    # Generate podcast script using Groq
    try:
        enhanced_prompt = f"""
        {system_prompt_podcast}
        Zielgruppe: {podcast_request.level}
        Organisation: {podcast_request.organisation}
        Prompt: {podcast_request.prompt}
        """

        chat_completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": enhanced_prompt}],
            model="llama3-8b-8192",
        )
        script_text = chat_completion.choices[0].message.content

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating podcast script: {str(e)}"
        )

    # Convert text to speech using ElevenLabs
    try:
        audio = eleven_client.generate(
            text=script_text,
            voice=Voice(
                voice_id="nPczCjzI2devNBz1zQrb",  # You can change the voice ID as needed
                settings=VoiceSettings(
                    stability=0.71,
                    similarity_boost=0.5,
                    style=0.0,
                    use_speaker_boost=True,
                ),
            ),
            model="eleven_turbo_v2_5",
        )

        # Create a BytesIO object to store the audio
        audio_bytes = b"".join(chunk for chunk in audio)
        audio_bytes = BytesIO(audio_bytes)
        audio_bytes.seek(0)  # Reset pointer to beginning of stream

        # Return audio as a streaming response
        return StreamingResponse(
            audio_bytes,
            media_type="audio/mpeg",
            headers={"Content-Disposition": 'attachment; filename="podcast.mp3"'},
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")
