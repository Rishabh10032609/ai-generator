import uuid
import base64
import logging
import requests
import google.generativeai as genai
from backend.config import settings

logger = logging.getLogger(__name__)


# ================ REQUEST TYPE ================ #

def detect_request_type(text: str) -> str:
    """Detect if user is requesting image or text generation"""
    image_keywords = ["image", "picture", "photo", "draw", "illustration", "logo", "poster"]
    return "image" if any(word in text.lower() for word in image_keywords) else "text"


# ================ TEXT GENERATION ================ #

def generate_text(prompt: str) -> str:
    """Generate text using Google's Gemini API"""
    if not settings.GOOGLE_API_KEY:
        raise ValueError("GOOGLE_API_KEY is not configured")
    
    try:
        # ✅ FIX: configure instead of Client
        genai.configure(api_key=settings.GOOGLE_API_KEY)

        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)

        return response.text if response.text else "No response generated"

    except Exception as e:
        logger.error(f"Text generation failed: {e}")
        raise


# ================ IMAGE GENERATION ================ #

def generate_image(prompt: str) -> bytes:
    """Generate image using Hugging Face Stable Diffusion API"""
    if not settings.HUGGING_FACE_TOKEN:
        raise ValueError("HUGGING_FACE_TOKEN is not configured")
    
    try:
        url = f"https://router.huggingface.co/hf-inference/models/{settings.STABLE_DIFFUSION_MODEL}"
        headers = {"Authorization": f"Bearer {settings.HUGGING_FACE_TOKEN}"}
        payload = {"inputs": prompt}
        
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.content
    except requests.RequestException as e:
        logger.error(f"Image generation failed: {e}")
        raise


# ================ MAIN FUNCTION ================ #

def generate_post(topic: str, platform: str, tone: str) -> dict:
    """Generate social media post (text or image based on request type)"""
    try:
        request_type = detect_request_type(topic)
        
        if request_type == "image":
            image_data = generate_image(topic)
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            return {
                "type": "image",
                "image_data": image_base64,
                "filename": f"{uuid.uuid4()}.png"
            }
        
        prompt = f"""
Create a {platform} social media post about {topic}.
Tone: {tone}

Format output like this:

Title: <title>
Caption: <caption>
Hashtags: <5 hashtags>
"""
        text = generate_text(prompt)
        return {"type": "text", "content": text}
    
    except Exception as e:
        logger.error(f"Post generation failed for topic='{topic}': {e}")
        raise