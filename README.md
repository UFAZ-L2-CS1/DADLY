# 🍳 DADLY - Recipe Discovery Platform

![CI](https://github.com/UFAZ-L2-CS1/DADLY/actions/workflows/ci.yml/badge.svg)
![CD](https://github.com/UFAZ-L2-CS1/DADLY/actions/workflows/cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.13-blue)
![React](https://img.shields.io/badge/react-19.1-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.119+-green)

**DADLY** is a modern, full-stack recipe discovery web application featuring a Tinder-style swipe interface. Built for home cooks and food enthusiasts who want to discover recipes, save favorites, and get personalized recommendations based on ingredients they already have in their pantry.

## 🌟 Key Features

### For Users
- **Swipe Interface**: Tinder-style recipe discovery - swipe right to like, left to skip
- **Pantry Management**: Track ingredients you have at home
- **Smart Recommendations**: Recipe feed prioritizes dishes matching your pantry items
- **Recipe Collections**: Save and organize your favorite recipes
- **User Profiles**: Dietary preferences (vegetarian, vegan, keto, gluten-free) and allergy tracking
- **Recipe Details**: Full ingredients, instructions, prep/cook time, difficulty level

### For Developers
- **Modern Stack**: FastAPI backend + React 19 frontend with JavaScript-ready architecture
- **Database**: MySQL 8.0 with SQLAlchemy ORM and Alembic migrations
- **Authentication**: JWT-based auth with access + refresh tokens, secure token blacklist
- **Docker-First**: Complete docker-compose setup for local development
- **CI/CD Pipeline**: Automated testing (pytest) and deployment to GitHub Container Registry
- **API Documentation**: Auto-generated Swagger/OpenAPI docs at `/docs`
- **Test Coverage**: Comprehensive pytest suite with SQLite in-memory database

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Development Setup](#-development-setup)
- [Environment Variables](#-environment-variables)
- [Database](#-database)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │ ◄─────► │  FastAPI        │ ◄─────► │  MySQL 8.0      │
│  (Vite + Tailwind)        │  Backend        │         │  Database       │
│  Port: 5173/8080│         │  Port: 8000     │         │  Port: xxxx     │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        ▼                           ▼
   Axios HTTP                  SQLAlchemy ORM
   JWT Tokens                  Alembic Migrations
```

### Technology Stack

#### Backend
- **Framework**: FastAPI 0.119+ (async Python web framework)
- **ORM**: SQLAlchemy 2.0 with declarative models
- **Migrations**: Alembic for database version control
- **Authentication**: JWT tokens via `python-jose` + `bcrypt` password hashing
- **Database**: MySQL 8.0 (production) / SQLite (testing)
- **Validation**: Pydantic v2 schemas with email validation
- **Package Management**: `uv` (fast Python package manager)
- **Server**: Uvicorn ASGI server

#### Frontend
- **Framework**: React 19.1 with hooks
- **Build Tool**: Vite 7.1 (fast HMR, optimized builds)
- **Styling**: Tailwind CSS 4.1
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM 7.9
- **Icons**: Lucide React + React Icons
- **State Management**: React Context API

#### DevOps
- **Containerization**: Docker + Docker Compose
- **CI**: GitHub Actions (pytest on every PR)
- **CD**: Automated image builds to GitHub Container Registry
- **Deployment**: Render (Web Services) with auto-deploy
- **Monitoring**: Render logs + health check endpoints

---

## 🚀 Quick Start

### Prerequisites

- **Docker Desktop** 20.10+ and **Docker Compose** 2.0+
- **Git** for cloning the repository
- **Node.js** 18+ and **npm** (only if running frontend locally)
- **Python 3.13** and **uv** (only if running backend locally)

### 1. Clone Repository

```bash
git clone https://github.com/UFAZ-L2-CS1/DADLY.git
cd DADLY
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (copy from examples):

```bash
# Copy backend env template
cp backend/.env.example .env

# Copy frontend env template  
cp frontend/.env.example frontend/.env
```

**Edit `.env`** with your database credentials:

```bash
# Database Configuration (required)
DB_HOST=mysql.ufazien.com
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name

# JWT Configuration (required - generate a secure random key)
JWT_SECRET_KEY=your-super-secret-key-here-use-openssl-rand-hex-32
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Application Settings
LOG_LEVEL=INFO
TIMEZONE=Asia/Baku
```

**Edit `frontend/.env`** (or use defaults):

```bash
# API URLs (use localhost for local dev)
VITE_BASE_URL=http://localhost:8000/api/v1
VITE_AUTH_URL=http://localhost:8000

NODE_ENV=development
```

### 3. Start All Services

```bash
# Build and start backend + frontend in Docker
docker-compose up --build
```

**Wait 30-60 seconds** for services to initialize. You'll see:
- Backend: `Application startup complete`
- Frontend: `ready in X ms`

### 4. Access the Application

- **Frontend**: http://localhost:5173 (Vite dev server with HMR)
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative API Docs**: http://localhost:8000/redoc

### 5. Initialize Database

Run Alembic migrations (inside backend container):

```bash
docker exec -it dadly-backend /app/.venv/bin/alembic upgrade head
```

### 6. Populate Recipe Data

Fetch recipes from Spoonacular API (50 recipes):

```bash
docker exec -it dadly-backend /app/.venv/bin/python fetch_spoonacular_recipes.py 50
```

**Note**: Free Spoonacular API tier has 150 requests/day limit.

### 7. Create Your First Account

1. Navigate to http://localhost:5173
2. Click "Sign Up" or go to http://localhost:5173/auth/register
3. Fill in email, name, password (min 8 chars with 1 digit)
4. Login and start swiping! 🎉

---

## 💻 Development Setup

### Option 1: Full Docker Setup (Recommended)

Best for: Getting started quickly, consistent environment.

```bash
# Start all services with auto-reload
docker-compose up --build

# Backend logs (follow mode)
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up --build backend
```

**Backend changes** auto-reload via volume mounts + uvicorn `--reload`.
**Frontend changes** trigger Vite HMR instantly.

### Option 2: Hybrid Setup (Fastest Frontend Development)

Best for: Active frontend development with instant feedback.

**Backend in Docker:**
```bash
docker-compose up backend
```

**Frontend locally** (separate terminal):
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173 with **instant HMR** (no Docker overhead).

### Option 3: Full Local Setup

Best for: Backend development, debugging, IDE integration.

**Backend locally:**
```bash
cd backend

# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment and install dependencies
uv sync

# Set DATABASE_URL environment variable
export DATABASE_URL="mysql+pymysql://user:pass@host:3306/dbname"

# Run migrations
uv run alembic upgrade head

# Start dev server with auto-reload
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend locally:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_HOST` | ✅ Yes | - | MySQL database host (e.g., `mysql.ufazien.com`) |
| `DB_PORT` | ✅ Yes | `3306` | MySQL port |
| `DB_USER` | ✅ Yes | - | Database username |
| `DB_PASSWORD` | ✅ Yes | - | Database password |
| `DB_NAME` | ✅ Yes | - | Database name |
| `JWT_SECRET_KEY` | ✅ Yes | - | Secret key for JWT signing (generate with `openssl rand -hex 32`) |
| `JWT_ALGORITHM` | No | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | `30` | Access token lifetime in minutes |
| `REFRESH_TOKEN_EXPIRE_DAYS` | No | `7` | Refresh token lifetime in days |
| `LOG_LEVEL` | No | `INFO` | Logging level (`DEBUG`, `INFO`, `WARNING`, `ERROR`) |
| `TIMEZONE` | No | `Asia/Baku` | Application timezone for timestamps |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_BASE_URL` | No | `http://localhost:8000/api/v1` | Backend API base URL |
| `VITE_AUTH_URL` | No | `http://localhost:8000` | Backend auth URL (used for auth base path) |
| `NODE_ENV` | No | `development` | Node environment (`development` or `production`) |

### Generating Secure JWT Secret

```bash
# Generate a secure 256-bit key
openssl rand -hex 32
# Output: a1b2c3d4e5f6... (use this for JWT_SECRET_KEY)
```

---

## 🗄️ Database

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    dietary_type VARCHAR(20) DEFAULT 'none', -- none, vegetarian, vegan, gluten_free, keto
    allergies TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Recipes Table
```sql
CREATE TABLE recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    prep_time INT NOT NULL, -- minutes
    cook_time INT NOT NULL, -- minutes
    difficulty VARCHAR(10) NOT NULL, -- easy, medium, hard
    image_url VARCHAR(500),
    instructions TEXT NOT NULL,
    ingredients TEXT NOT NULL, -- JSON string array
    like_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);
```

#### User Recipe Interactions Table
```sql
CREATE TABLE user_recipe_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    liked BOOLEAN NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    UNIQUE KEY uq_user_recipe (user_id, recipe_id) -- Prevents duplicate likes
);
```

#### Pantry Items Table
```sql
CREATE TABLE pantry_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    ingredient_name VARCHAR(100) NOT NULL, -- Stored lowercase
    quantity VARCHAR(50), -- "2 cups", "500g", etc.
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY uq_user_ingredient (user_id, ingredient_name) -- One entry per ingredient
);
```

### Database Migrations

DADLY uses **Alembic** for database version control.

#### Create a New Migration

```bash
# Inside backend container
docker exec -it dadly-backend /app/.venv/bin/alembic revision --autogenerate -m "Add column to users table"

# Or locally with uv (requires DATABASE_URL env var)
cd backend
export DATABASE_URL="mysql+pymysql://user:pass@host:3306/dbname"
uv run alembic revision --autogenerate -m "Add column to users table"
```

#### Apply Migrations

```bash
# Apply all pending migrations
docker exec -it dadly-backend /app/.venv/bin/alembic upgrade head

# Rollback one migration
docker exec -it dadly-backend /app/.venv/bin/alembic downgrade -1

# View migration history
docker exec -it dadly-backend /app/.venv/bin/alembic history
```

#### Migration Files Location
- **Versions**: `backend/alembic/versions/`
- **Config**: `backend/alembic.ini`

### Seed Database with Recipes

```bash
# Fetch 50 recipes from Spoonacular API
docker exec -it dadly-backend /app/.venv/bin/python fetch_spoonacular_recipes.py 50

# Fetch 100 recipes (default)
docker exec -it dadly-backend /app/.venv/bin/python fetch_spoonacular_recipes.py 100

# Fetch by category (automatic variety)
docker exec -it dadly-backend /app/.venv/bin/python fetch_spoonacular_recipes.py 50
```

**Spoonacular API Notes:**
- Free tier: 150 requests/day
- Recipes are fetched by category (main course, dessert, breakfast, etc.)
- Duplicate recipes are automatically skipped
- Script in: `backend/fetch_spoonacular_recipes.py`

---

## 📚 API Documentation

### Interactive API Docs

Once the backend is running, access the **Swagger UI** for interactive API exploration:

```
http://localhost:8000/docs
```

Alternative documentation (ReDoc):

```
http://localhost:8000/redoc
```

### API Endpoint Overview

All endpoints are prefixed with `/api/v1`.

#### Authentication (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Create new user account | No |
| POST | `/auth/token` | Login (returns JWT tokens) | No |
| GET | `/auth/me` | Get current user profile | Yes |
| POST | `/auth/refresh` | Refresh access token | No (needs refresh token) |
| POST | `/auth/logout` | Invalidate current token | Yes |

**Example: Register**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "SecureP@ss123",
    "dietary_type": "vegetarian",
    "allergies": "peanuts, shellfish"
  }'
```

**Example: Login**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@example.com&password=SecureP@ss123"

# Response:
# {
#   "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
#   "token_type": "bearer"
# }
```

#### Recipes (`/api/v1/recipes`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/recipes/feed` | Get personalized recipe feed (excludes liked) | Optional |
| GET | `/recipes/{recipe_id}` | Get recipe details | Optional |
| POST | `/recipes/{recipe_id}/like` | Like a recipe | Yes |
| DELETE | `/recipes/{recipe_id}/unlike` | Unlike a recipe | Yes |
| GET | `/recipes/liked` | Get user's liked recipes (paginated) | Yes |

**Example: Get Recipe Feed**
```bash
# Guest user (no auth)
curl "http://localhost:8000/api/v1/recipes/feed?limit=10"

# Authenticated user (pantry-prioritized)
curl "http://localhost:8000/api/v1/recipes/feed?limit=10&exclude_ids=1,2,3" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example: Like Recipe**
```bash
curl -X POST "http://localhost:8000/api/v1/recipes/42/like" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Pantry (`/api/v1/pantry`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/pantry/` | Get user's pantry items | Yes |
| POST | `/pantry/` | Add single ingredient | Yes |
| POST | `/pantry/bulk` | Add multiple ingredients | Yes |
| DELETE | `/pantry/{item_id}` | Remove ingredient | Yes |
| DELETE | `/pantry/` | Clear all ingredients | Yes |

**Example: Add Pantry Item**
```bash
curl -X POST "http://localhost:8000/api/v1/pantry/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredient_name": "tomatoes",
    "quantity": "3 pieces"
  }'
```

**Example: Bulk Add**
```bash
curl -X POST "http://localhost:8000/api/v1/pantry/bulk" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ingredients": [
      {"ingredient_name": "garlic", "quantity": "1 bulb"},
      {"ingredient_name": "olive oil", "quantity": "500ml"}
    ]
  }'
```

#### Users (`/api/v1/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/stats` | Get user statistics (likes, pantry count) | Yes |
| PUT | `/users/profile` | Update user profile | Yes |
| DELETE | `/users/account` | Delete user account | Yes |

**Example: Get User Stats**
```bash
curl "http://localhost:8000/api/v1/users/stats" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Response:
# {
#   "total_liked_recipes": 24,
#   "total_pantry_items": 12
# }
```

### Authentication Flow

1. **Register**: `POST /auth/register` → Get user credentials
2. **Login**: `POST /auth/token` → Receive `access_token` (30min) + `refresh_token` (7 days)
3. **Authorized Requests**: Include header `Authorization: Bearer <access_token>`
4. **Token Refresh**: When access token expires, `POST /auth/refresh` with refresh token
5. **Logout**: `POST /auth/logout` to invalidate token (blacklist)

### Error Responses

| Status Code | Meaning | Example |
|-------------|---------|---------|
| 400 | Bad Request | Duplicate email, invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Recipe/user not found |
| 422 | Validation Error | Pydantic schema validation failure |
| 500 | Internal Server Error | Database connection failure |

---

## 🧪 Testing

### Run Backend Tests

```bash
# Run all tests with verbose output
cd backend
uv run pytest tests/ -v

# Run specific test file
uv run pytest tests/test_api/test_auth.py -v

# Run tests with coverage report
uv run pytest tests/ --cov=app --cov-report=term-missing

# Run tests in watch mode (re-run on file changes)
uv run pytest-watch tests/
```

### Test Structure

```
backend/tests/
├── conftest.py              # Test fixtures (SQLite in-memory DB, TestClient)
├── test_main.py             # Main app tests
└── test_api/
    ├── test_auth.py         # Authentication endpoint tests
    ├── test_recipes.py      # Recipe feed/like/unlike tests
    ├── test_pantry.py       # Pantry CRUD tests
    └── test_users.py        # User profile/stats/delete tests
```

### Key Test Fixtures (`conftest.py`)

- **`client`**: FastAPI TestClient for HTTP requests
- **`test_db`**: SQLite in-memory database (isolated per test)
- **`test_user`**: Pre-created test user with JWT token
- **Token blacklist reset**: Cleared before each test to prevent interference

### CI/CD Pipeline

GitHub Actions automatically runs tests on every push/PR:

```yaml
# .github/workflows/ci.yml
- Run pytest in isolated environment
- Upload coverage reports
- Fail PR if tests don't pass
```

**View CI Status**: Check the **Build Status** badge at the top of this README.

---

## 🚀 Deployment

### Render Deployment

DADLY includes a **one-click deployment** configuration for Render.

**Quick Deploy:**
1. Push code to GitHub
2. Connect repository to `Render`
4. Configure environment variables
5. Run database migrations
6. Seed recipe data


### Docker Image Publishing

GitHub Actions automatically builds and publishes Docker images on merge to `main`/`develop`:

```yaml
# .github/workflows/cd.yml
- Build backend image → ghcr.io/yourusername/dadly-backend:latest
- Build frontend image → ghcr.io/yourusername/dadly-frontend:latest
```

### Production Checklist

- [ ] Configure environment variables (DB credentials, JWT secret)
- [ ] Set strong `JWT_SECRET_KEY` (use `openssl rand -hex 32`)
- [ ] Apply database migrations (`alembic upgrade head`)
- [ ] Populate recipe database (`fetch_spoonacular_recipes.py`)
- [ ] Enable CORS for frontend domain (update `main.py`)
- [ ] Set up health check monitoring (`/api/v1/health`)
- [ ] Configure frontend `VITE_BASE_URL` to production backend URL

---

## 📁 Project Structure

```
Dadly/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── main.py            # FastAPI app initialization, CORS, routers
│   │   ├── api/               # API route handlers
│   │   │   ├── auth.py        # JWT authentication (register, login, refresh, logout)
│   │   │   ├── recipes.py     # Recipe feed, like/unlike, details
│   │   │   ├── pantry.py      # Pantry CRUD operations
│   │   │   ├── users.py       # User profile, stats, account deletion
│   │   │   └── health.py      # Health check endpoint
│   │   ├── models/
│   │   │   └── models.py      # SQLAlchemy ORM models (User, Recipe, etc.)
│   │   ├── schemas/
│   │   │   └── schemas.py     # Pydantic request/response schemas
│   │   ├── config/
│   │   │   └── config.py      # Configuration (JWT, logging, timezone)
│   │   └── db/
│   │       └── database.py    # SQLAlchemy session management
│   ├── alembic/               # Database migrations
│   │   └── versions/          # Migration scripts
│   ├── tests/                 # Pytest test suite
│   │   ├── conftest.py        # Test fixtures (SQLite in-memory)
│   │   └── test_api/          # API endpoint tests
│   ├── fetch_spoonacular_recipes.py  # Recipe data seeder
│   ├── pyproject.toml         # uv dependencies
│   ├── alembic.ini            # Alembic configuration
│   └── Dockerfile             # Backend container image
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── main.jsx           # React app entry point
│   │   ├── App.jsx            # Router configuration
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx       # Landing page
│   │   │   ├── SignIn.jsx     # Login page
│   │   │   ├── Register.jsx   # Registration page
│   │   │   ├── Recipes.jsx    # Swipe interface (SwiperGame)
│   │   │   ├── Pantry.jsx     # Pantry management UI
│   │   │   ├── UserPage.jsx   # User profile and liked recipes
│   │   │   └── RecipeDetails.jsx  # Recipe detail view
│   │   └── components/        # Reusable components
│   │       ├── SwiperGame.jsx  # Tinder-style swipe logic
│   │       ├── RecipeFeed.jsx  # Recipe card display
│   │       ├── Header.jsx      # Navigation header
│   │       └── ...
│   ├── service/               # API integration layer
│   │   ├── AxiosInstance.jsx  # Axios instances (base + auth)
│   │   ├── AuthService.js     # Authentication API calls
│   │   └── Data.js            # Recipe/pantry API calls
│   ├── context/
│   │   └── DataContext.js     # Global state management (user, auth)
│   ├── vite.config.js         # Vite configuration
│   ├── package.json           # npm dependencies
│   └── Dockerfile             # Frontend container image
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml             # Pytest CI pipeline
│   │   └── cd.yml             # Docker image publishing
│   └── copilot-instructions.md  # AI assistant guidelines
│
├── docker-compose.yml         # Local development orchestration
├── render.yaml                # Render deployment blueprint
├── DEPLOYMENT.md              # Production deployment guide
└── README.md                  # This file
```

---

## 🛠️ Development Tips

### Backend Development

- **Hot Reload**: Python files auto-reload via uvicorn `--reload` + volume mounts
- **Database Console**: `docker exec -it dadly-backend mysql -h DB_HOST -u DB_USER -p`
- **Alembic Console**: `docker exec -it dadly-backend /app/.venv/bin/alembic --help`
- **View Logs**: `docker-compose logs -f backend`

### Frontend Development

- **Fastest HMR**: Run frontend locally (`npm run dev`) while backend in Docker
- **Tailwind IntelliSense**: Install VS Code extension `bradlc.vscode-tailwindcss`
- **React DevTools**: Install browser extension for component inspection
- **View Logs**: `docker-compose logs -f frontend` (Docker mode)

### Common Docker Commands

```bash
# Rebuild specific service after dependency changes
docker-compose up --build backend

# Recreate containers (after environment variable changes)
docker-compose up -d --force-recreate backend

# View all container logs
docker-compose logs -f

# Execute commands inside container
docker exec -it dadly-backend bash

# Stop and remove all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

---

## 🐛 Troubleshooting

### Environment Variables Not Loading

**Symptom**: Backend fails to start, "DB_HOST not set" error

**Solution**:
```bash
# Verify docker-compose config
docker-compose config | grep DB_HOST

# If variables show in config but fail in container, recreate (not restart)
docker-compose down backend
docker-compose up -d backend
```

**Note**: Environment changes require container recreation, not just restart.

### Frontend Changes Not Appearing

**Docker Production Mode (port 8080)**:
```bash
# Requires rebuild
docker-compose up --build frontend
```

**Local Development (port 5173)**:
```bash
# Changes appear instantly (HMR)
cd frontend && npm run dev
```

**Docker Dev Mode (port 5173)**:
```bash
# Hot-reload enabled
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up frontend-dev
```

See `frontend/FRONTEND_DEV_GUIDE.md` for detailed setup options.

### Backend Connection Fails

**Symptom**: `sqlalchemy.exc.OperationalError: (pymysql.err.OperationalError) (2003, "Can't connect to MySQL server")`

**Solutions**:
1. Verify MySQL is running: `mysql -h DB_HOST -u DB_USER -p`
2. Check firewall rules (allow port 3306)
3. Confirm DATABASE_URL format: `mysql+pymysql://user:pass@host:3306/dbname`
4. Test connection: `docker exec -it dadly-backend /app/.venv/bin/python -c "from app.db.database import engine; engine.connect()"`

### Recipe Feed Returns No Results

**Symptom**: Feed returns 0 recipes despite populated database

**Causes**:
1. All recipes already liked by user → Use `exclude_ids` query param
2. Pantry filter too restrictive → Backend prioritizes matches but shows all recipes
3. Database empty → Run `fetch_spoonacular_recipes.py 100`

**Debug**:
```bash
# Check recipe count
docker exec -it dadly-backend mysql -h DB_HOST -u DB_USER -p -e "SELECT COUNT(*) FROM recipes;"

# Check user likes
docker exec -it dadly-backend mysql -h DB_HOST -u DB_USER -p -e "SELECT COUNT(*) FROM user_recipe_interactions WHERE user_id=12;"
```

### Render Free Tier Cold Starts

**Symptom**: First request takes 30+ seconds after inactivity

**Explanation**: Free tier instances spin down after 15 minutes of inactivity. First request triggers wake-up.

**Solutions**:
1. **Paid Plan**: Upgrade to always-on instance ($7/month)
2. **Keep-Alive Service**: Use external service to ping health check every 10 minutes
3. **Accept Delay**: Cold starts are expected behavior on free tier

### JWT Token Expired

**Symptom**: 401 Unauthorized after 30 minutes

**Solution**: Implement automatic token refresh in frontend:
```javascript
// frontend/service/AxiosInstance.jsx already has interceptor
// Uncomment refresh logic in response interceptor
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**: Fork repository, clone locally
2. **Create Branch**: `git checkout -b feature/amazing-feature`
3. **Make Changes**: Edit code, add tests
4. **Run Tests**: `cd backend && uv run pytest tests/ -v`
5. **Commit**: `git commit -m 'feat: add amazing feature'`
6. **Push**: `git push origin feature/amazing-feature`
7. **Pull Request**: Open PR against `main` branch

### Coding Standards

**Backend**:
- Follow PEP 8 style guide
- Add docstrings to all functions
- Write pytest tests for new endpoints
- Use type hints (Pydantic schemas)
- Keep routes in appropriate `/api/*.py` files

**Frontend**:
- Use functional components + hooks
- Follow existing Tailwind utility patterns
- Keep components in `/components` or `/pages`
- Use axios instances (not raw fetch)
- Handle loading/error states

### Commit Message Convention

```
feat: add pantry bulk import feature
fix: resolve recipe feed pagination bug
docs: update deployment guide
test: add pantry endpoint tests
chore: update dependencies
```

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Spoonacular API**: Recipe data provider
- **FastAPI**: Modern, high-performance web framework
- **React**: UI library for building interactive interfaces
- **Tailwind CSS**: Utility-first CSS framework
- **Render**: Cloud hosting platform
- **uv**: Fast Python package installer

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/dadly/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/dadly/discussions)
- **Developers**:  
    - *Bayram Aliyev*: aliyevbayram08@gmail.com  
    - *Nazrin Azizli*: nazizli1112@gmail.com


---

**Built with ❤️ by the DADLY Team**

Happy cooking! 🍳
