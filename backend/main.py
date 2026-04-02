import logging
from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from config import settings
from services.ai_service import generate_post as ai_generate_post
from routers.auth import router as auth_router
from routers.version import router as version_router
from database.db import Base, engine, get_db
from models.user import User
from auth_utils import get_current_active_user

# ================ LOGGING ================ #
logging.basicConfig(
    level=logging.DEBUG if settings.API_DEBUG else logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

settings.validate_required_keys()

# ================ APP INITIALIZATION ================ #
app = FastAPI(debug=settings.API_DEBUG)
app.include_router(auth_router)
app.include_router(version_router)
Base.metadata.create_all(bind=engine)

print("SECRET_KEY:", settings.SECRET_KEY)
print("DATABASE_URL:", settings.DATABASE_URL)


# ================ CORS MIDDLEWARE ================ #

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================ DATA MODELS ================ #

class PostRequest(BaseModel):
    topic: str
    platform: str = "Instagram"
    tone: str = "engaging"


# ================ ROUTE HANDLERS ================ #

@app.post("/api/generate")
def generate(data: PostRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    """Generate social media post with rate limiting"""
    try:
        logger.info(f"Generate request from {current_user.email}: topic={data.topic}")
        
        # Check rate limit
        if current_user.requests_count >= 3 and not current_user.is_premium:
            logger.warning(f"Rate limit exceeded for {current_user.email}")
            return {"error": "Rate limit exceeded", "code": 429}
        
        # Generate content
        result = ai_generate_post(
            topic=data.topic,
            platform=data.platform,
            tone=data.tone
        )
        
        # Update request count
        current_user.requests_count += 1
        db.commit()
        
        # Parse and return response
        if result["type"] == "image":
            return {
                "type": "image",
                "image_data": result["image_data"],
                "filename": result["filename"]
            }
        
        # Parse text response
        lines = result["content"].split("\n")
        parsed = {"type": "text"}
        for line in lines:
            if "Title:" in line:
                parsed["title"] = line.replace("Title:", "").strip()
            elif "Caption:" in line:
                parsed["caption"] = line.replace("Caption:", "").strip()
            elif "Hashtags:" in line:
                parsed["hashtags"] = line.replace("Hashtags:", "").strip()
        
        return parsed
    
    except Exception as e:
        logger.error(f"Generation failed: {e}", exc_info=True)
        return {"error": str(e), "code": 500}


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "ok"}