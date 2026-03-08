from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
from routers.generator import router
import os

app = FastAPI()

# configure Gemini API
genai.configure(api_key="YOUR_GEMINI_KEY")

# updated model
model = genai.GenerativeModel("gemini-2.5-flash")
origins = ["http://localhost:8100"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)

class Topic(BaseModel):
    topic: str


@app.post("/generate")
def generate_post(data: Topic):

    prompt = f"""
    Create a social media marketing post about {data.topic}.

    Format output like this:

    Title: <title>
    Caption: <caption>
    Hashtags: <5 hashtags>
    """

    response = model.generate_content(prompt)

    text = response.text

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
        "title": title,
        "caption": caption,
        "hashtags": hashtags
    }