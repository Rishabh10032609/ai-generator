from fastapi import APIRouter, Depends
from services.ai_service import generate_post
from models.request_models import PostRequest
from models.user import User
from routers.auth import get_current_active_user

router = APIRouter()

@router.post("/generate")
def generate(data: PostRequest, current_user: User = Depends(get_current_active_user)):

    result = generate_post(
        data.topic,
        data.platform,
        data.tone
    )

    return {"content": result}