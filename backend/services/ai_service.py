import os
from openai import OpenAI

# Load API key from environment variable
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_post(topic, platform, tone):

    prompt = f"""
    Create a {platform} social media post about {topic}.
    Tone: {tone}

    Include:
    1. Title
    2. Caption
    3. 5 Hashtags
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response.choices[0].message.content