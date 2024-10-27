import os
import random
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from openai import OpenAI
from sqlmodel import SQLModel
from app.api.helper.context import fetch_content
from app.api.helper.embeddings import fetch_embeddings_2d


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


class EmbeddingsResponse(SQLModel):
    points: list[Point]
    name: str
    title: str
    org_id: int


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


@router.get("/")
def get_all_embeddings():
    """
    Get all embeddings grouped by organizations.
    """
    try:
        # Fetch embeddings data
        data = fetch_embeddings_2d()

        # First element contains titles
        titles = data.get("titles")
        # Rest of the data contains embeddings
        embeddings_data = data.get("embeddings")
        org_names = data.get("org_name")
        org_ids = data.get("org_id")

        # Initialize response dictionary
        organizations = {}

        # Iterate through all lists together
        for i in range(len(embeddings_data)):
            coords = embeddings_data[i]
            org_name = org_names[i]
            org_id = org_ids[i]
            doc_name = titles[i]

            # Create organization entry if not exists
            if org_name not in organizations:
                organizations[org_name] = {
                    "points": [],
                    "color": "#142c96",
                }

            # Add point to organization
            point = {
                "x": float(coords[0]),
                "y": float(coords[1]),
                "doc_name": doc_name,
                "org_id": org_id,
            }
            organizations[org_name]["points"].append(point)

        return {"titles": titles, "organizations": organizations}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching embeddings: {str(e)}"
        )
