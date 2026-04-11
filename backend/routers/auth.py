from datetime import timedelta
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.config import settings
from database.db import get_db
from models.user import User
from models.request_models import UserCreate, Token, RefreshTokenRequest
from services.auth_service import (
    authenticate_user,
    create_access_token,
    create_refresh_token,
    get_password_hash,
    get_user_by_email,
)
from auth_utils import get_current_active_user
from jose import JWTError, jwt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    try:
        logger.info(f"Register attempt: email={user.email}")
        db_user = get_user_by_email(db, user.email)
        if db_user:
            logger.warning(f"Registration failed: email already exists - {user.email}")
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_password = get_password_hash(user.password)
        db_user = User(email=user.email, hashed_password=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"User registered successfully: {user.email}")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": db_user.email}, expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": db_user.email})
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Registration error: {e}")


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login user with email and password"""
    try:
        logger.info(f"Login attempt: email={form_data.username}")
        user = authenticate_user(db, form_data.username, form_data.password)
        if not user:
            logger.warning(f"Login failed: incorrect credentials - {form_data.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        refresh_token = create_refresh_token(data={"sub": user.email})
        logger.info(f"Login successful: {form_data.username}")
        return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Login error: {e}")


@router.get("/me")
def read_users_me(current_user: User = Depends(get_current_active_user)):
    """Get current user profile"""
    logger.debug(f"Profile accessed: {current_user.email}")
    return {"email": current_user.email, "role": current_user.role}


@router.post("/refresh", response_model=Token)
def refresh_token(token_request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token using refresh token"""
    try:
        payload = jwt.decode(token_request.refresh_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        user = get_user_by_email(db, email=email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
        logger.info(f"Token refreshed: {email}")

        return {"access_token": access_token, "token_type": "bearer"}
    except JWTError:
        logger.warning(f"Invalid refresh token")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")


@router.post("/logout")
def logout(current_user: User = Depends(get_current_active_user)):
    """Logout user (stateless JWT - just client-side token removal needed)"""
    logger.info(f"Logout: {current_user.email}")
    return {"message": "Logged out successfully"}