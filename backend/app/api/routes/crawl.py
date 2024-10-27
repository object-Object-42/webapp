from datetime import timedelta
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordRequestForm

from app import crud
from app.api.deps import CurrentUser, SessionDep, get_current_active_superuser
from app.core import security
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import CrawlRequest, NewPassword, Token, UserPublic
from app.logic.crawler import Crawler
from fastapi import FastAPI, BackgroundTasks

router = APIRouter()

import logging
@router.post("/")
def crawl(
    *,background_tasks: BackgroundTasks, session: SessionDep, current_user: CurrentUser, crawl_data:CrawlRequest 
) -> Any:
    """
    Crawl a website.
    """
    crawler = Crawler(crawl_data.url,crawl_data.organisation_id,base_url_path=crawl_data.url_path,session=session)
    background_tasks.add_task(crawler.crawl_data_and_store)
    return ""
