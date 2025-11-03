from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from datetime import datetime

from app.config.config import setup_logging, Config, get_logger
from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.recipes import router as recipes_router
from app.api.pantry import router as pantry_router

# Initialize logging
setup_logging()
logger = get_logger(__name__)

app = FastAPI(
    title="DADLY API",
    description="Recipe discovery app with swipe interface",
    version="1.0.0",
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React default
        "http://localhost:5173",  # Vite default
        "http://localhost:4200",  # Angular default
        # Add your frontend URL here when deployed
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting up DADLY API...")
    logger.info("DADLY API startup complete!")

app.include_router(health_router, prefix=Config.API_V1_PREFIX, tags=["Health"])

app.include_router(auth_router, prefix=f"{Config.API_V1_PREFIX}/auth", tags=["Authentication"])

app.include_router(users_router, prefix=f"{Config.API_V1_PREFIX}/users", tags=["Users"])

app.include_router(recipes_router, prefix=f"{Config.API_V1_PREFIX}/recipes", tags=["Recipes"])

app.include_router(pantry_router, prefix=f"{Config.API_V1_PREFIX}/pantry", tags=["Pantry"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000)
