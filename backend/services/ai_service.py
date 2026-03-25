# import os
import google.generativeai as genai

# genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# model = genai.GenerativeModel("gemini-2.5-flash")

# def generate_post(topic, platform, tone):

#     prompt = f"""
#     Create a {platform} social media post about {topic}.
#     Tone: {tone}

#     Include:
#     Title
#     Caption
#     5 Hashtags
#     """

#     response = model.generate_content(prompt)

#     return response.text

import os
import requests

DEEPINFRA_KEY = ""
HF_TOKEN = ""


def detect_request_type(text: str):

    image_keywords = [
        "image",
        "picture",
        "photo",
        "draw",
        "illustration",
        "logo",
        "poster"
    ]

    for word in image_keywords:
        if word in text.lower():
            return "image"

    return "text"


# ---------------- TEXT GENERATION ---------------- #

def generate_text(prompt):

    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

    model = genai.GenerativeModel("gemini-2.5-flash")

    text_prompt = f"""
    Create a {platform} social media post about {prompt}.
    Tone: {tone}

    Include:
    Title
    Caption
    5 Hashtags
    """

    response = model.generate_content(text_prompt)

    return response.text

    # url = "https://api.deepinfra.com/v1/openai/chat/completions"

    # headers = {
    #     "Authorization": f"Bearer {DEEPINFRA_KEY}",
    #     "Content-Type": "application/json"
    # }

    # payload = {
    #     "model": "meta-llama/Meta-Llama-3-70B-Instruct",
    #     "messages": [
    #         {"role": "user", "content": prompt}
    #     ]
    # }

    # r = requests.post(url, headers=headers, json=payload)

    # data = r.json()

    # print("DeepInfra response:", data)

    # if "choices" not in data:
    #     raise Exception(f"DeepInfra API error: {data}")

    # return data["choices"][0]["message"]["content"]


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

    filename = "generated.png"

    with open(filename, "wb") as f:
        f.write(response.content)

    return filename


# ---------------- MAIN ROUTER ---------------- #

def generate_post(topic, platform, tone):

    request_type = detect_request_type(topic)

    if request_type == "image":

        image_path = generate_image(topic)

        return {
            "type": "image",
            "image": image_path
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