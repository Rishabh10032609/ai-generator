from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os

app = FastAPI()

origins = ["http://localhost:8100"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


client = OpenAI(api_key="OPEN_API_KEY")


class Topic(BaseModel):
    topic: str


@app.post("/generate")
def generate_post(data: Topic):

    topic = data.topic

    prompt = f"""
    Create a social media marketing post about {topic}.

    Generate:
    1. Title
    2. Caption
    3. 5 hashtags
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )

    text = response.choices[0].message.content

    return {
        "title": text.split("\n")[0],
        "caption": text,
        "hashtags": "#ai #marketing"
    }
