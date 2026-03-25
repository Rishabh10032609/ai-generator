from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from services.ai_service import generate_post as ai_generate_post

app = FastAPI()

# ---------------- CORS ---------------- #

origins = ["http://localhost:8100"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- STATIC IMAGE SERVING ---------------- #

app.mount("/images", StaticFiles(directory="generated_images"), name="images")

# ---------------- REQUEST MODEL ---------------- #

class Topic(BaseModel):
    topic: str

# ---------------- API ---------------- #

@app.post("/generate")
def generate(data: Topic):

    try:
        result = ai_generate_post(
            topic=data.topic,
            platform="Instagram",
            tone="engaging"
        )

        # -------- IMAGE RESPONSE -------- #
        if result["type"] == "image":
            return {
                "type": "image",
                "image_url": f"http://127.0.0.1:8000/images/{result['image']}"
            }

        # -------- TEXT RESPONSE -------- #
        text = result["content"]

        lines = text.split("\n")

        title = ""
        caption = ""
        hashtags = ""

        for line in lines:
            if "Title:" in line:
                title = line.replace("Title:", "").strip()
            elif "Caption:" in line:
                caption = line.replace("Caption:", "").strip()
            elif "Hashtags:" in line:
                hashtags = line.replace("Hashtags:", "").strip()

        return {
            "type": "text",
            "title": title,
            "caption": caption,
            "hashtags": hashtags
        }

    except Exception as e:
        return {
            "error": str(e)
        }