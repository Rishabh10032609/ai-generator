from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from services.ai_service import generate_post
from backend.models.request_models import PostRequest
from backend.models.user import User
from routers.auth import get_current_active_user
from backend.database.db import get_db

router = APIRouter()

MAX_FREE_REQUESTS = 3

@router.post("/generate")
def generate(data: PostRequest, current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):

    # Check if user has exceeded free request limit
    if current_user.requests_count >= MAX_FREE_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "Free request limit exceeded",
                "message": f"You have used all {MAX_FREE_REQUESTS} free content generation requests. Upgrade to premium for unlimited access.",
                "current_usage": current_user.requests_count,
                "limit": MAX_FREE_REQUESTS
            }
        )

    # Generate the content
    result = generate_post(
        data.topic,
        data.platform,
        data.tone
    )

    # Increment the user's request count
    current_user.requests_count += 1
    db.commit()

    # Calculate remaining requests
    remaining_requests = max(0, MAX_FREE_REQUESTS - current_user.requests_count)

    return {
        "content": result,
        "usage": {
            "current": current_user.requests_count,
            "limit": MAX_FREE_REQUESTS,
            "remaining": remaining_requests
        }
    }