from fastapi import APIRouter
from datetime import datetime

from app.config.config import Config, get_logger

logger = get_logger(__name__)


router = APIRouter()

@router.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
async def health_check():
    baku_tz = Config.get_timezone() 
    baku_time = datetime.now(tz=baku_tz).strftime("%Y-%m-%d %H:%M:%S")
    logger.info(f"Health check called at {baku_time}")
    return {
        "status": "OK",
        "time_baku": baku_time
    }