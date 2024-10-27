import uuid
from typing import Any, List, Optional
from datetime import datetime

from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import (
    OrganisationCreate,
    Organisation,
    Content,
    ContentBase,
    Chat,
    User,
    UserCreate,
    UserUpdate,
)

#### User functions ####


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create,
        update={"hashed_password": get_password_hash(user_create.password)},
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> Any:
    user_data = user_in.model_dump(exclude_unset=True)
    extra_data = {}
    if "password" in user_data:
        password = user_data["password"]
        hashed_password = get_password_hash(password)
        extra_data["hashed_password"] = hashed_password
    db_user.sqlmodel_update(user_data, update=extra_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


#### Organisation functions ####


def create_organisation(*, session: Session, org_name: str) -> Organisation:
    organisation = Organisation(org_name=org_name)
    session.add(organisation)
    session.commit()
    session.refresh(organisation)
    return organisation


def get_organisation_by_id(
    *, session: Session, org_id: int
) -> Optional[Organisation]:
    return session.get(Organisation, org_id)


def get_organisations(*, session: Session) -> List[Organisation]:
    statement = select(Organisation)
    return session.exec(statement).all()


#### Content functions ####


def create_content(
    *, session: Session, content_data: ContentBase, org_id: int
) -> Content:
    content = Content(
        doc_name=content_data.doc_name,
        content_text=content_data.content_text,
        url=content_data.url,
        org_id=org_id,
        created_at=datetime.utcnow(),
    )
    session.add(content)
    session.commit()
    session.refresh(content)
    return content


def get_content_by_id(*, session: Session, doc_id: int) -> Optional[Content]:
    return session.get(Content, doc_id)


def get_contents_by_org(*, session: Session, org_id: int) -> List[Content]:
    statement = select(Content).where(Content.org_id == org_id)
    return session.exec(statement).all()


#### Chat functions ####


def create_chat(
    *,
    session: Session,
    message_text: str,
    user_id: uuid.UUID,
    doc_id: Optional[int] = None
) -> Chat:
    chat = Chat(
        message_text=message_text,
        user_id=user_id,
        doc_id=doc_id,
        created_at=datetime.now(),
    )
    session.add(chat)
    session.commit()
    session.refresh(chat)
    return chat


def get_chat_by_id(*, session: Session, chat_id: uuid.UUID) -> Optional[Chat]:
    return session.get(Chat, chat_id)


def get_chats_by_user(*, session: Session, user_id: uuid.UUID) -> List[Chat]:
    statement = select(Chat).where(Chat.user_id == user_id)
    return session.exec(statement).all()


#### ORganisation functions ####


def create_organisation(
    *, session: Session, org_in: OrganisationCreate, owner_id: uuid.UUID
) -> Organisation:
    db_org = Organisation(
        org_name=org_in.org_name,
    )
    session.add(db_org)
    session.commit()
    session.refresh(db_org)
    return db_org
