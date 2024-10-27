import uuid
from datetime import datetime
from typing import List

from pydantic import EmailStr, HttpUrl
from pydantic import Field, HttpUrl
from sqlmodel import Field, Relationship, SQLModel


class OrganisationBase(SQLModel):
    org_name: str = Field(max_length=255)


class UserOrganisation(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    org_id: uuid.UUID = Field(foreign_key="organisation.org_id", primary_key=True)
    
    
class Organisation(OrganisationBase, table=True):
    org_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    users: List["User"] = Relationship(
        back_populates="organisations", link_model=UserOrganisation
    )
    content: List["Content"] = Relationship(back_populates="organisation")
    chats: List["Chat"] = Relationship(back_populates="organisation")


class ContentBase(SQLModel):
    doc_name: str = Field(max_length=255)
    content_text: str | None = None
    url: str | None = Field(default=None, max_length=2048)

    def validate_url(cls, v):
        if v is not None:
            parsed_url = HttpUrl.validate(v)
            return parsed_url
        return v

class Content(ContentBase, table=True):
    doc_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    org_id: uuid.UUID = Field(foreign_key="organisation.org_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    organisation: Organisation = Relationship(back_populates="content")
    chat_messages: list["ChatMessage"] = Relationship(back_populates="referenced_content")

class Chat(SQLModel, table=True):
    chat_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    name: str | None = Field(default=None)
    org_id: uuid.UUID = Field(default=None, foreign_key="organisation.org_id")
    created_at: datetime = Field(default_factory=datetime.now)
    user: "User" = Relationship(back_populates="chats")
    organisation: Organisation = Relationship(back_populates="chats")
    # referenced_content: Content | None = Relationship(back_populates="chats")
    chat_messages: list["ChatMessage"] = Relationship(back_populates="chat")
    
class ChatMessage(SQLModel, table=True):
    message_id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    chat_id: uuid.UUID = Field(foreign_key="chat.chat_id")
    doc_id: uuid.UUID | None = Field(default=None, foreign_key="content.doc_id")
    message_text: str = Field(max_length=64000)
    is_from_bot: bool = Field()
    created_at: datetime = Field(default_factory=datetime.now)
    referenced_content: Content | None = Relationship(back_populates="chat_messages")
    chat: Chat = Relationship(back_populates="chat_messages")

# API reponse models
class OrganisationPublic(OrganisationBase):
    org_id: uuid.UUID


class ContentPublic(ContentBase):
    doc_id: uuid.UUID
    org_id: uuid.UUID
    created_at: datetime


class ChatPublic(SQLModel):
    chat_id: uuid.UUID
    user_id: uuid.UUID
    org_id: uuid.UUID
    name: str | None
    created_at: datetime

class ChatMessagePublic(SQLModel):
    message_id: uuid.UUID
    chat_id: uuid.UUID
    doc_id: uuid.UUID | None
    message_text: str
    is_from_bot: bool
    created_at: datetime

# List response models
class OrganisationsPublic(SQLModel):
    data: List[OrganisationPublic]
    count: int


class ContentsPublic(SQLModel):
    data: List[ContentPublic]
    count: int


class ChatsPublic(SQLModel):
    data: List[ChatPublic]
    count: int


class ChatMessagesPublic(SQLModel):
    data: List[ChatMessagePublic]
    count: int


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    organisations: List[Organisation] = Relationship(
        back_populates="users", link_model=UserOrganisation
    )
    chats: List[Chat] = Relationship(back_populates="user")


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: List[UserPublic]
    count: int


# Shared properties
# class ItemBase(SQLModel):
#     title: str = Field(min_length=1, max_length=255)
#     description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class OrganisationCreate(OrganisationBase):
    pass


# Properties to receive on item update
class OrganisationUpdate(OrganisationBase):
    org_name: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# # Database model, database table inferred from class name
# class Item(ItemBase, table=True):
#     id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
#     title: str = Field(max_length=255)
#     owner_id: uuid.UUID = Field(
#         foreign_key="user.id", nullable=False, ondelete="CASCADE"
#     )
#     owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class OrganisationPublic(OrganisationBase):
    org_id: uuid.UUID


class OrganisationsPublic(SQLModel):
    data: List[OrganisationPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)

class CrawlRequest(SQLModel):
    url: str
    url_path : str|None
    organisation_id: uuid.UUID
