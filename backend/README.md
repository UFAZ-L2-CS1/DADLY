# DADLY Backend API

A modern FastAPI-based REST API for the DADLY recipe discovery application with swipe interface functionality.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Database](#database)
- [Testing](#testing)
- [Deployment](#deployment)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

## Overview

DADLY Backend is a robust REST API built with FastAPI that powers the DADLY recipe discovery platform. It handles:

- **User Authentication**: JWT-based authentication with secure password hashing
- **Recipe Management**: Browse, search, and interact with recipes
- **User Preferences**: Track liked recipes and pantry items
- **Data Persistence**: MySQL database with Alembic migrations
- **API Documentation**: Auto-generated Swagger UI and ReDoc

**Live Demo**: https://dadly-backend.onrender.com/api/v1/docs

## Technology Stack

### Core Framework
- **FastAPI** (0.119.1+) - Modern, fast web framework for building APIs
- **Uvicorn** (0.38.0+) - ASGI server for running the application
- **Pydantic** (2.12.3+) - Data validation and serialization

### Database & ORM
- **SQLAlchemy** (2.0.44+) - SQL toolkit and ORM
- **Alembic** (1.17.1+) - Database schema versioning and migrations
- **PyMySQL** (1.1.2+) - MySQL driver for Python

### Authentication & Security
- **python-jose** (3.5.0+) - JWT token generation and verification
- **passlib[bcrypt]** (1.7.4+) - Password hashing with bcrypt
- **cryptography** (43.0.0+) - Cryptographic recipes and primitives

### Additional Libraries
- **pytz** (2025.2+) - Timezone support (Asia/Baku timezone)
- **python-dotenv** (1.2.1+) - Environment variable management
- **requests** (2.32.5+) - HTTP client for external APIs (Spoonacular)
- **httpx** (0.27.0+) - Async HTTP client

### Development & Testing
- **pytest** (9.0.1+) - Testing framework
- **python-multipart** (0.0.20+) - Multipart form parsing

## Project Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI application entry point
│   ├── config/
│   │   └── config.py          # Centralized configuration
│   ├── api/
│   │   ├── health.py          # Health check endpoint
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── users.py           # User management endpoints
│   │   ├── recipes.py         # Recipe endpoints
│   │   └── pantry.py          # Pantry/ingredients endpoints
│   ├── models/
│   │   └── models.py          # SQLAlchemy ORM models
│   ├── schemas/
│   │   └── schemas.py         # Pydantic request/response schemas
│   └── db/
│       └── database.py        # Database connection and session
├── tests/
│   ├── test_main.py           # Main app tests
│   ├── conftest.py            # Pytest configuration and fixtures
│   └── test_api/              # API endpoint tests
│       ├── test_auth.py
│       ├── test_users.py
│       ├── test_recipes.py
│       └── test_pantry.py
├── alembic/                    # Database migrations
├── pyproject.toml             # Project dependencies (uv)
├── pyproject.toml
├── .env.example               # Environment variables template
├── Dockerfile                 # Docker container definition
└── README.md                  # This file
```

## Prerequisites

- **Python**: 3.13 or higher (see `.python-version`)
- **Package Manager**: `uv`
- **Database**: MySQL 5.7+ or MariaDB (local or remote)
- **Git**: For version control

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Set Up Python Environment with uv

```bash
# Install Python dependencies using uv
uv sync
```

### 3. Configure Environment Variables

Copy the example environment file and update it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database configuration
DB_HOST=database_host   
DB_PORT=database_port
DB_USER=database_user
DB_PASSWORD=database_password
DB_NAME=database_name

# JWT configuration
JWT_SECRET_KEY=jwt_secret_key
JWT_ALGORITHM=jwt_algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=jwt_access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_DAYS=jwt_refresh_token_expire_days

# Application
LOG_LEVEL=INFO
TIMEZONE=timezone
```

**⚠️ Important Security Notes:**
- Never commit `.env` file to version control
- Use strong, unique `JWT_SECRET_KEY` in production
- Rotate secrets regularly
- Use environment variables for all sensitive data

### 4. Set Up Database

#### Option A: Local MySQL Setup

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE dadly_db_dev_mysql;"

# Run migrations
alembic upgrade head
```

#### Option B: Remote MySQL (Default)

The default configuration uses a remote MySQL server:
- **Host**: mysql.ufazien.com
- **Database**: dadly_db_dev_mysql
- Ensure your `DATABASE_URL` in `.env` is correctly configured

```bash
# Run migrations to initialize schema
alembic upgrade head
```

## Configuration

All application settings are centralized in `app/config/config.py`:

### Timezone Configuration
```python
TIMEZONE = "Asia/Baku"  # All timestamps use this timezone
```

### API Versioning
```python
API_V1_PREFIX = "/api/v1"  # All endpoints prefixed with this
```

### JWT Authentication
```python
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
```

### CORS Settings (app/main.py)
```python
CORS_ORIGINS = [
    "http://localhost:5173",           # Frontend dev (Vite)
    "https://dadly.onrender.com",      # Production frontend
]
```

## Running the Application

### Development Mode with Auto-Reload

```bash
# Using uvicorn directly (recommended)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using the app's main block
python -m app.main
```

Server will be available at: `http://localhost:8000`

### Production Mode

```bash
# Run without reload flag
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Docker Deployment

```bash
# Build Docker image
docker build -t dadly-backend .

# Run container
docker run -p 8000:8000 \
  -e DATABASE_URL=mysql+pymysql://user:pass@host:3306/dadly_db_dev_mysql \
  -e JWT_SECRET_KEY=your-secret-key \
  dadly-backend
```

## API Documentation

### Swagger UI
Once running, visit: **http://localhost:8000/docs**

Interactive API documentation with:
- Request/response examples
- Schema definitions
- Try-it-out functionality

### ReDoc
Alternative documentation: **http://localhost:8000/redoc**

## API Endpoints

### Health Check
```
GET /api/v1/health
HEAD /api/v1/health

Response: { "status": "OK", "time_baku": "2025-12-10 15:30:45" }
```

### Authentication (`/api/v1/auth`)
```
POST   /api/v1/auth/register          # Create new user account
POST   /api/v1/auth/login             # Login and get JWT token
POST   /api/v1/auth/refresh-token     # Refresh JWT token
POST   /api/v1/auth/logout            # Logout and blacklist token
```

**Request Examples:**

Register:
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword123"
}
```

Login:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

### Users (`/api/v1/users`)
```
GET    /api/v1/users/me               # Get current user profile
PUT    /api/v1/users/me               # Update user profile
GET    /api/v1/users/{user_id}        # Get user by ID
```

### Recipes (`/api/v1/recipes`)
```
GET    /api/v1/recipes                # Get all recipes with pagination
GET    /api/v1/recipes/{recipe_id}    # Get recipe details
POST   /api/v1/recipes/{recipe_id}/like   # Like a recipe
DELETE /api/v1/recipes/{recipe_id}/like   # Unlike a recipe
GET    /api/v1/recipes/liked          # Get user's liked recipes
```

**Query Parameters:**
```
GET /api/v1/recipes?skip=0&limit=20&search=pasta
```

### Pantry (`/api/v1/pantry`)
```
GET    /api/v1/pantry                 # Get user's pantry items
POST   /api/v1/pantry                 # Add item to pantry
DELETE /api/v1/pantry/{item_id}       # Remove item from pantry
```

## Database

### Schema

**Users Table**
```sql
- id (PK)
- email (UNIQUE)
- username (UNIQUE)
- password_hash
- created_at
- updated_at
```

**Recipes Table**
```sql
- id (PK)
- title
- description
- image_url
- ingredients
- instructions
- created_at
- updated_at
```

**User Recipes (Likes)**
```sql
- user_id (FK)
- recipe_id (FK)
- liked_at
```

**Pantry Items**
```sql
- id (PK)
- user_id (FK)
- ingredient_name
- quantity
- unit
- created_at
```

### Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

Rollback last migration:
```bash
alembic downgrade -1
```

View migration history:
```bash
alembic current
alembic history
```

## Testing

### Run All Tests

```bash
# Run all tests with verbose output
pytest

# Run with coverage report
pytest --cov=app --cov-report=html
```

### Run Specific Tests

```bash
# Run a specific test file
pytest tests/test_api/test_auth.py

# Run a specific test function
pytest tests/test_api/test_auth.py::test_user_registration

# Run tests by marker
pytest -m unit
pytest -m integration
```

### Test Structure

```
tests/
├── conftest.py              # Pytest fixtures and configuration
├── test_main.py             # Main app tests
└── test_api/
    ├── test_auth.py         # Authentication tests
    ├── test_users.py        # User endpoint tests
    ├── test_recipes.py      # Recipe endpoint tests
    └── test_pantry.py       # Pantry endpoint tests
```

### Test Database

Tests use an in-memory SQLite database by default (set in `conftest.py`):

```python
TEST_DATABASE_URL = "sqlite:///:memory:"
```

This ensures:
- Tests don't modify production data
- Fast test execution
- Isolated test runs

## Deployment

### Render Cloud (Recommended)

1. **Connect GitHub Repository**
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo

2. **Configure Build**
   - **Build Command**: `uv sync && alembic upgrade head`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

3. **Set Environment Variables**
   ```
   DATABASE_URL=mysql+pymysql://...
   JWT_SECRET_KEY=your-production-secret
   ENV=production
   ```

4. **Enable Auto-Deploy**
   - Settings → Auto-Deploy: "Yes"
   - Deploys automatically on push to `main` branch

### Docker Registry (GitHub Container Registry)

1. **Automated via GitHub Actions**
   - Push to `main` branch triggers `cd.yml` workflow
   - Builds Docker image and pushes to GHCR
   - Render auto-deploys from GHCR

2. **Manual Build & Push**
   ```bash
   # Build image
   docker build -t ghcr.io/username/dadly-backend:latest .
   
   # Push to GHCR
   docker push ghcr.io/username/dadly-backend:latest
   ```

### Health Check Configuration

Configure uptime monitoring to check:

```
https://dadly-backend.onrender.com/api/v1/health
```

This endpoint:
- Returns 200 OK with status
- Accepts GET and HEAD requests
- Works with free tier cold starts

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/new-feature
```

### 2. Make Changes

- Write code following project conventions
- Add tests for new functionality
- Update `.env.example` if adding new env variables

### 3. Run Tests Locally

```bash
pytest
```

### 4. Commit and Push

```bash
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

### 5. Create Pull Request

- Go to GitHub and create PR from `feature/*` to `develop`
- CI/CD pipeline runs automatically (GitHub Actions)
- All tests must pass before merging

### 6. Merge to Main

```bash
git checkout main
git merge develop
git push origin main
```

This triggers:
- ✅ CI: Runs all tests
- ✅ CD: Builds Docker image and pushes to GHCR
- ✅ Render: Auto-deploys new version

## Troubleshooting

### Database Connection Issues

**Error**: `Can't connect to MySQL server at 'host'`

```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Verify MySQL is running
mysql -u user -p -h host -e "SELECT 1;"

# Test connection with pymysql
python -c "import pymysql; pymysql.connect(**{'host': 'host', 'user': 'user', 'password': 'pass', 'db': 'db'})"
```

### JWT Authentication Issues

**Error**: `Invalid token` or `Token expired`

```bash
# Verify JWT_SECRET_KEY is set
echo $JWT_SECRET_KEY

# Check token expiration
# Add this to see token details
import jwt
jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
```

### Port Already in Use

**Error**: `Address already in use`

```bash
# Find process using port 8000
lsof -i :8000

# Kill process (on Linux/Mac)
kill -9 <PID>

# Or use different port
uvicorn app.main:app --port 8001
```

### Alembic Migration Issues

**Error**: `Can't find table versions or similar`

```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Run migrations
alembic upgrade head

# Check current migration status
alembic current
```

### CORS Errors in Frontend

**Error**: `Cross-Origin Request Blocked`

1. Check if frontend URL is in `CORS_ORIGINS` in `app/main.py`
2. Add your frontend URL:
   ```python
   allow_origins=[
       "http://localhost:5173",
       "https://your-frontend-url.com",
   ]
   ```
3. Redeploy backend

### Tests Failing

```bash
# Run with verbose output
pytest -v

# Show print statements
pytest -s

# Run with traceback
pytest --tb=short

# Run specific failing test
pytest tests/test_api/test_auth.py::test_failing_test -vv
```

## Contributing

### Code Style

- Follow PEP 8
- Use type hints for all functions
- Add docstrings to functions and classes
- Run linting: `pylint app/`

### Commit Messages

```
[TYPE] Brief description

[TYPE] can be:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- test: Tests
- refactor: Code refactoring
- chore: Maintenance
```

Example:
```
feat: Add pantry item filtering by category

- Adds category parameter to GET /api/v1/pantry
- Updates schema to include category field
- Adds tests for category filtering
```

## API Response Format

All responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human-readable error message",
  "timestamp": "2025-12-10T15:30:45+04:00"
}
```

## Performance Optimization

### Database Indexing

Common queries are optimized with indexes on:
- `users.email` (authentication)
- `recipes.title` (search)
- `user_recipes.user_id` (user preferences)

### Caching Strategy

For high-traffic scenarios:
- Cache popular recipes (Redis recommended)
- Cache user pantry data (session-based)
- Use ETags for recipe endpoints

### Query Optimization

```python
# Good: Use eager loading to avoid N+1 queries
recipes = db.query(Recipe).options(
    joinedload(Recipe.user)
).all()

# Avoid: Lazy loading in loops
for recipe in recipes:
    user = recipe.user  # Extra DB query per recipe
```


## Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create detailed bug reports with reproduction steps
3. Include error logs and environment details

## Changelog

### Version 1.0.0 (2025-12-10)
- ✅ Initial API release
- ✅ Authentication and JWT tokens
- ✅ Recipe discovery endpoints
- ✅ User preferences (likes, pantry)
- ✅ Comprehensive test coverage (57 tests)
- ✅ Docker deployment ready
- ✅ Render cloud integration
- ✅ Auto-deploy CI/CD pipeline
