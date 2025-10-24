from fastapi import FastAPI
import uvicorn
from datetime import datetime
import logging

from config import setup_logging, Config
from api.health import router as health_router

# Initialize logging
setup_logging()

app = FastAPI()

app.include_router(
    health_router,
    prefix=Config.API_V1_PREFIX,
    tags=["health"]
)