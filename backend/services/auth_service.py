from datetime import datetime, timedelta
from typing import Optional
import os
import hashlib

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models.user import User

# ---------------- CONFIG ---------------- #

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

# ---------------- PASSWORD UTILS ---------------- #

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify user password
    """
    hashed_input = hashlib.sha256(plain_password.encode()).hexdigest()
    return pwd_context.verify(hashed_input, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash user password (SHA256 -> bcrypt)
    """
    hashed_input = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(hashed_input)


# ---------------- TOKEN UTILS ---------------- #

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT access token
    """
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ---------------- DB OPERATIONS ---------------- #

def authenticate_user(db: Session, email: str, password: str):
    """
    Authenticate user by email and password
    """
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return False

    if not verify_password(password, user.hashed_password):
        return False

    return user


def get_user_by_email(db: Session, email: str):
    """
    Get user by email
    """
    return db.query(User).filter(User.email == email).first()