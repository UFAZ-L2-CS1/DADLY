from fastapi import FastAPI
import uvicorn
from datetime import datetime
import pytz
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger(__name__)

app = FastAPI()

@app.get("/health_check")
async def health_check():
    baku_tz = pytz.timezone("Asia/Baku")
    baku_time = datetime.now(tz=baku_tz).strftime("%Y-%m-%d %H:%M:%S")
    logger.info(f"Health check called at {baku_time}")
    return {
        "status": "OK",
        "time_baku": baku_time
    }


if __name__ == "__main__":
    logger.info("Starting FastAPI app...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
