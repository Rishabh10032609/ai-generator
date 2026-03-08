import os
import google.generativeai as genai

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.5-flash")

def generate_post(topic, platform, tone):

    prompt = f"""
    Create a {platform} social media post about {topic}.
    Tone: {tone}

    Include:
    Title
    Caption
    5 Hashtags
    """

    response = model.generate_content(prompt)

    return response.text