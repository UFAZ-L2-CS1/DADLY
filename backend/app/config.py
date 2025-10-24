"""
Application configuration settings.
Centralizes logging, timezone, and other app-wide configurations.
"""

import logging
import pytz
from typing import Optional


class Config:
    """Application configuration class."""

    # Timezone configuration
    TIMEZONE = "Asia/Baku"

    # Logging configuration
    LOG_LEVEL = logging.INFO
    LOG_FORMAT = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    LOG_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

    # API configuration
    API_V1_PREFIX = "/api/v1"

    @classmethod
    def get_timezone(cls):
        """Get the configured timezone object."""
        return pytz.timezone(cls.TIMEZONE)


def setup_logging(
    level: Optional[int] = None,
    format_str: Optional[str] = None,
    date_format: Optional[str] = None,
) -> None:
    """
    Configure application-wide logging.

    Args:
        level: Logging level (defaults to Config.LOG_LEVEL)
        format_str: Log format string (defaults to Config.LOG_FORMAT)
        date_format: Date format string (defaults to Config.LOG_DATE_FORMAT)
    """
    logging.basicConfig(
        level=level or Config.LOG_LEVEL,
        format=format_str or Config.LOG_FORMAT,
        datefmt=date_format or Config.LOG_DATE_FORMAT,
        force=True,  # Override any existing configuration
    )


def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)
