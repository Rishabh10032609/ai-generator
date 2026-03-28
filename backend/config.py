"""
Centralized configuration management using environment variables
"""
from pydantic_settings import BaseSettings
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # API Configuration
    API_HOST: str = "127.0.0.1"
    API_PORT: int = 8000
    API_DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite:///./ai_generator.db"
    
    # JWT Configuration
    SECRET_KEY: str  # Required - must be set in .env
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS Configuration
    CORS_ORIGINS: str = "http://localhost:8100"
    
    # External APIs
    GOOGLE_API_KEY: str = ""
    HUGGING_FACE_TOKEN: str = ""
    
    # Models
    GEMINI_MODEL: str = "gemini-2.5-flash"
    STABLE_DIFFUSION_MODEL: str = "stabilityai/stable-diffusion-xl-base-1.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env variables not defined in settings
    
    def get_cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    def validate_required_keys(self) -> None:
        """Ensure all required API keys are configured"""
        if not self.SECRET_KEY:
            raise ValueError("SECRET_KEY is required in .env file")
        if not self.GOOGLE_API_KEY:
            logger.warning("GOOGLE_API_KEY not configured - text generation will fail")
        if not self.HUGGING_FACE_TOKEN:
            logger.warning("HUGGING_FACE_TOKEN not configured - image generation will fail")


# Create global settings instance
settings = Settings()
