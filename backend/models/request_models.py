from pydantic import BaseModel

class PostRequest(BaseModel):
    topic: str
    platform: str
    tone: str