"""
Database connection and session management for DADLY
"""

import os
from typing import Annotated
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from fastapi import Depends
from app.config.config import get_logger

from dotenv import load_dotenv

load_dotenv()

logger = get_logger(__name__)

# Database URL - use SQLite for development, PostgreSQL for production
# DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dadly.db")
DATABASE_URL = (
    f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@"
    f"{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
)

# Create engine
engine = create_engine(DATABASE_URL)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class for models
Base = declarative_base()


def get_db():
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Database dependency type annotation
db_dependency = Annotated[Session, Depends(get_db)]


def create_tables():
    """
    Create all database tables
    """
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully!")
