from fastapi import APIRouter

from app.api.routes import items, login, users, utils, chat, vector, podcast, vision

api_router = APIRouter()
api_router.include_router(login.router, tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
api_router.include_router(items.router, prefix="/items", tags=["items"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(vector.router, prefix="/vector", tags=["vector"])
api_router.include_router(podcast.router, prefix="/podcast", tags=["podcast"])
api_router.include_router(vision.router, prefix="/vision", tags=["vision"])
