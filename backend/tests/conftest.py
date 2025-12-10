"""
Pytest configuration and shared fixtures for DADLY backend tests
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.database import get_db
from app.models.models import Base
from app.api import auth  # Import auth module to access token_blacklist


# Test database setup (SQLite in-memory for fast tests)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for tests"""
    database = TestingSessionLocal()
    try:
        yield database
    finally:
        database.close()


# Create all tables before tests
Base.metadata.create_all(bind=engine)

# Override the database dependency
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def clear_token_blacklist():
    """Clear token blacklist before each test to ensure test isolation"""
    auth.token_blacklist.clear()
    yield
    # Optionally clear after test as well
    auth.token_blacklist.clear()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client for each test with fresh database"""
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up after test
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123",
        "dietary_type": "none",
        "allergies": None
    }


@pytest.fixture
def sample_recipe_data():
    """Sample recipe data for testing"""
    return {
        "name": "Test Recipe",
        "description": "A test recipe",
        "prep_time": 10,
        "cook_time": 20,
        "difficulty": "easy",
        "image_url": "https://example.com/image.jpg",
        "instructions": "1. Test step",
        "ingredients": ["ingredient1", "ingredient2"]
    }


@pytest.fixture
def authenticated_user(client, sample_user_data):
    """Create a user and return authentication token"""
    # Register user
    response = client.post("/api/v1/auth/register", json=sample_user_data)
    assert response.status_code == 200
    
    # Login to get token
    login_data = {
        "username": sample_user_data["email"],
        "password": sample_user_data["password"]
    }
    response = client.post("/api/v1/auth/token", data=login_data)
    assert response.status_code == 200
    
    token_data = response.json()
    return {
        "token": token_data["access_token"],
        "headers": {"Authorization": f"Bearer {token_data['access_token']}"}
    }