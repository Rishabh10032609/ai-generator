from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.config import settings

# Get database URL from settings (supports SQLite and PostgreSQL)
DATABASE_URL = settings.DATABASE_URL

# SQLAlchemy engine configuration with connection pooling for production
if "postgresql" in DATABASE_URL:
    # PostgreSQL: Use connection pooling for production
    engine = create_engine(
        DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,  # Verify connection before using
        echo=settings.API_DEBUG  # Log SQL queries in debug mode
    )
else:
    # SQLite: For development/testing
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        echo=settings.API_DEBUG
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()