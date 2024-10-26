import uuid
from datetime import datetime
from typing import list

from pydantic import EmailStr, HttpUrl
from sqlmodel import Field, Relationship, SQLModel


class OrganisationBase(SQLModel):
    org_name: str = Field(max_length=255)


class Organisation(OrganisationBase, table=True):
    org_id: int = Field(default=None, primary_key=True)
    users: list["User"] = Relationship(
        back_populates="organisations", link_model="UserOrganisation"
    )
    content: list["Content"] = Relationship(back_populates="organisation")


class UserOrganisation(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    org_id: int = Field(foreign_key="organisation.org_id", primary_key=True)


class ContentBase(SQLModel):
    doc_name: str = Field(max_length=255)
    content_text: str | None = None
    url: HttpUrl | None = Field(default=None, max_length=2048)


class Content(ContentBase, table=True):
    doc_id: int = Field(default=None, primary_key=True)
    org_id: int = Field(foreign_key="organisation.org_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    organisation: Organisation = Relationship(back_populates="content")
    chats: list["Chat"] = Relationship(back_populates="referenced_content")


class ChatBase(SQLModel):
    message_text: str


class Chat(ChatBase, table=True):
    chat_id: int = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    referenced_doc_id: int | None = Field(default=None, foreign_key="content.doc_id")
    created_at: datetime = Field(default_factory=datetime.now())
    user: "User" = Relationship(back_populates="chats")
    referenced_content: Content | None = Relationship(back_populates="chats")


# API reponse models
class OrganisationPublic(OrganisationBase):
    org_id: int


class ContentPublic(ContentBase):
    doc_id: int
    org_id: int
    created_at: datetime


class ChatPublic(ChatBase):
    chat_id: int
    user_id: uuid.UUID
    referenced_doc_id: int | None
    created_at: datetime


# list response models
class OrganisationsPublic(SQLModel):
    data: list[OrganisationPublic]
    count: int


class ContentsPublic(SQLModel):
    data: list[ContentPublic]
    count: int


class ChatsPublic(SQLModel):
    data: list[ChatPublic]
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
    items: list["Item"] = Relationship(back_populates="owner", cascade_delete=True)
    organisations: list[Organisation] = Relationship(
        back_populates="users", link_model="UserOrganisation"
    )
    chats: list[Chat] = Relationship(back_populates="user")


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str = Field(max_length=255)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
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
