# Stage 1: Builder
FROM python:3.13-slim-bookworm AS builder

# Install system dependencies required for Python packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libmariadb3 \
    libmariadb-dev \
    pkg-config \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy pyproject.toml and uv.lock (if using) for dependency resolution
COPY pyproject.toml uv.lock* .python-version ./

# Install dependencies into a virtual environment
RUN uv venv && uv sync --frozen --no-cache --no-dev

# Stage 2: Production
FROM python:3.13-slim-bookworm

# Install runtime dependencies for MySQL client
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libmariadb3 \
    libmariadb-dev \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy the virtual environment from the builder stage
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY ./app ./app
COPY ./alembic ./alembic
COPY ./alembic.ini ./alembic.ini

# Set Python environment variables
ENV PATH="/app/.venv/bin:$PATH"

# Change ownership to non-root user
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose the port FastAPI will run on
EXPOSE 8000

# Health check - verifies the API is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD ["/app/.venv/bin/python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/v1/health').read()"]

# Run database migrations and start the application
CMD ["sh", "-c", "/app/.venv/bin/alembic upgrade head && exec /app/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000"]