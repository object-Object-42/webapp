from fastapi import APIRouter, HTTPException
from datetime import datetime
import os
from groq import Groq
from sqlmodel import SQLModel
from app.models import ContentBase
from app.crud import create_content
from app.api.deps import SessionDep

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class ImageAnalysisRequest(SQLModel):
    image_url: str
    prompt: str = "Beschreibe das Bild."


@router.post("/")
def analyze_image(*, request: ImageAnalysisRequest, session: SessionDep):
    """
    Analyze image using Groq Vision API.
    """
    try:
        # Generate response using Groq Vision API
        completion = client.chat.completions.create(
            model="llama-3.2-90b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": request.prompt},
                        {"type": "image_url", "image_url": {"url": request.image_url}},
                    ],
                },
                {"role": "assistant", "content": ""},
            ],
            temperature=0.5,
            max_tokens=1024,
            top_p=1,
            stream=False,
            stop=None,
        )
        
        content_data = ContentBase(
            doc_name=request.image_url,
            content_text=completion.choices[0].message.content,
            url=request.image_url
        )
        
        db_content = create_content(
            session=session,
            content_data=content_data,
            org_id=21
        )

        response_text = completion.choices[0].message.content

        return {
            "message": response_text,
            "image_url": request.image_url,
            "created_at": datetime.now(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")
