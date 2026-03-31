import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# DATABASE_URL can be overridden via environment variable.
# Default: SQLite file stored in /data/ (Docker volume) or local ./hrms.db
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hrms.db")

# For SQLite we need connect_args; for PostgreSQL this is not needed
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# SessionLocal is a factory — each request gets its own session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class all models inherit from
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a DB session per request
    and closes it automatically when the request finishes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
