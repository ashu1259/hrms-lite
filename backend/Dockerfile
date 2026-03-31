# ── Stage 1: builder ──────────────────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /install

COPY requirements.txt .
# Install dependencies into a prefix folder so we can copy cleanly
RUN pip install --prefix=/runtime --no-cache-dir -r requirements.txt


# ── Stage 2: runtime ──────────────────────────────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /runtime /usr/local

# Copy application source
COPY app/ ./app/

# Create a directory for the SQLite database file (mapped to a Docker volume)
RUN mkdir -p /data

ENV DATABASE_URL=sqlite:////data/hrms.db
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

# Use uvicorn with 1 worker for SQLite compatibility (SQLite doesn't support concurrent writes)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
