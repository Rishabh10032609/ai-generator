# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# import google.generativeai as genai
# from routers.generator import router
# import os

# app = FastAPI()

# # configure Gemini API
# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# # updated model
# model = genai.GenerativeModel("gemini-2.5-flash")
# origins = ["http://localhost:8100"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# app.include_router(router)

# class Topic(BaseModel):
#     topic: str


# @app.post("/generate")
# def generate_post(data: Topic):

#     prompt = f"""
#     Create a social media marketing post about {data.topic}.

#     Format output like this:

#     Title: <title>
#     Caption: <caption>
#     Hashtags: <5 hashtags>
#     """

#     response = model.generate_content(prompt)

#     text = response.text

#     lines = text.split("\n")

#     title = ""
#     caption = ""
#     hashtags = ""

#     for line in lines:
#         if "Title:" in line:
#             title = line.replace("Title:", "").strip()
#         elif "Caption:" in line:
#             caption = line.replace("Caption:", "").strip()
#         elif "Hashtags:" in line:
#             hashtags = line.replace("Hashtags:", "").strip()

#     return {
#         "title": title,
#         "caption": caption,
#         "hashtags": hashtags
#     }

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from routers.generator import router
import g4f

app = FastAPI()

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


def detect_request_type(prompt: str):
    """
    Very simple detection of image vs text request
    """
    image_keywords = ["image", "picture", "draw", "generate image", "photo", "illustration"]

    for word in image_keywords:
        if word in prompt.lower():
            return "image"

    return "text"


@app.post("/generate")
def generate_post(data: Topic):

    request_type = detect_request_type(data.topic)

    # IMAGE GENERATION
    if request_type == "image":

        image = g4f.Image.create(
            prompt=data.topic
        )

        return {
            "type": "image",
            "image_url": image
        }

    # TEXT GENERATION
    prompt = f"""
    Create a social media marketing post about {data.topic}.

    Format output like this:

    Title: <title>
    Caption: <caption>
    Hashtags: <5 hashtags>
    """

    response = g4f.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    text = response

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
