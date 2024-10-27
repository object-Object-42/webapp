from fastapi import APIRouter

from app.api.routes import login, users, utils, chats, crawl, vector, podcast, transcribe,organisations, vision

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(organisations.router, prefix="/organisations", tags=["organisations"])
api_router.include_router(crawl.router, prefix="/crawl", tags=["crawl"])
api_router.include_router(chats.router, prefix="/chats", tags=["chats"])
api_router.include_router(vector.router, prefix="/vector", tags=["vector"])
api_router.include_router(podcast.router, prefix="/podcast", tags=["podcast"])
api_router.include_router(transcribe.router, prefix="/transcribe", tags=["transcribe"])
api_router.include_router(vision.router, prefix="/vision", tags=["vision"])
