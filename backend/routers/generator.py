from fastapi import APIRouter
from services.ai_service import generate_post
from models.request_models import PostRequest

router = APIRouter()

@router.post("/generate")
def generate(data: PostRequest):

    result = generate_post(
        data.topic,
        data.platform,
        data.tone
    )

    return {"content": result}