from pydantic import BaseModel, EmailStr
from typing import Optional


class PostRequest(BaseModel):
    topic: str
    platform: str
    tone: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
