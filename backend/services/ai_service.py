import os
import uuid
import requests
import google.generativeai as genai

DEEPINFRA_KEY = ""
HF_TOKEN = ""

# ---------------- REQUEST TYPE ---------------- #

def detect_request_type(text: str):
    image_keywords = ["image", "picture", "photo", "draw", "illustration", "logo", "poster"]

    for word in image_keywords:
        if word in text.lower():
            return "image"

    return "text"


# ---------------- TEXT GENERATION ---------------- #

def generate_text(prompt):

    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

    model = genai.GenerativeModel("gemini-2.5-flash")

    response = model.generate_content(prompt)

    return response.text


# ---------------- IMAGE GENERATION ---------------- #

def generate_image(prompt):

    url = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"

    headers = {
        "Authorization": f"Bearer {HF_TOKEN}"
    }

    payload = {
        "inputs": prompt
    }

    response = requests.post(url, headers=headers, json=payload)

    # create folder if not exists
    os.makedirs("generated_images", exist_ok=True)

    filename = f"{uuid.uuid4()}.png"
    filepath = f"generated_images/{filename}"

    with open(filepath, "wb") as f:
        f.write(response.content)

    return filename


# ---------------- MAIN FUNCTION ---------------- #

def generate_post(topic, platform, tone):

    request_type = detect_request_type(topic)

    if request_type == "image":

        filename = generate_image(topic)

        return {
            "type": "image",
            "image": filename
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

    return {
        "type": "text",
        "content": text
    }