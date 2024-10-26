import os
import random
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from openai import OpenAI
from sqlmodel import SQLModel

router = APIRouter()

# Initialize OpenAI client
load_dotenv()
client = OpenAI()
client.api_key = os.getenv("OPENAI_API_KEY")


class EmbeddingRequest(SQLModel):
    text: str
    organisation: str


class Point(SQLModel):
    x: float
    y: float
    doc_id: int | None = None
    doc_name: str
    org_id: int | None = None


class OrganizationData(SQLModel):
    points: list[Point]
    color: str


class AllEmbeddingsResponse(SQLModel):
    organizations: dict[str, OrganizationData]


@router.post("/")
def create_embedding(*, embedding_request: EmbeddingRequest):
    """
    Create embeddings for given text using OpenAI's API.
    """
    try:
        response = client.embeddings.create(
            input=embedding_request.text, model="text-embedding-3-small"
        )

        # TODO insert into database
        return {response}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating embedding: {str(e)}"
        )


@router.get("/", response_model=AllEmbeddingsResponse)
def get_all_embeddings():
    """
    Get all embeddings grouped by organizations.
    """
    try:
        # This is where you would normally query your database
        # For now, returning dummy data in the required format

        # Dummy data for multiple organizations
        organizations_data = {
            "Rechenzentrum": {
                "points": [
                    Point(x=0.123, y=0.456, doc_name="ML_Basics.pdf", org_id=1),
                    Point(x=0.234, y=0.567, doc_name="Cloud_Computing.pdf", org_id=1),
                ],
                "color": "#FF0000",  # Red
            },
            "Feuerwehr": {
                "points": [
                    Point(x=0.789, y=0.321, doc_name="AI_Introduction.pdf", org_id=2),
                    Point(
                        x=0.890, y=0.432, doc_name="Emergency_Protocols.pdf", org_id=2
                    ),
                ],
                "color": "#0000FF",  # Blue
            },
        }

        return {"organizations": organizations_data}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching embeddings: {str(e)}"
        )
