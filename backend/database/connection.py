"""
Database connection and session management for Scoutly AI.
Uses SQLite for zero-configuration, robust local persistence.
"""

import os
import hashlib
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from database.models import Base

DB_PATH = os.environ.get("DATABASE_URL", "sqlite:///scoutly.db")

engine = create_engine(
    DB_PATH,
    connect_args={"check_same_thread": False} if "sqlite" in DB_PATH else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    """Initializes and creates all database tables if they do not exist."""
    Base.metadata.create_all(bind=engine)

def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and safely closes it upon completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def generate_lead_dedup_key(firm_name: str, city: str, website_url: str = "") -> str:
    """
    Computes a deterministic SHA256 deduplication key based on normalized business attributes:
    Normalized Name + Normalized City + Normalized Hostname.
    """
    norm_name = "".join(e for e in (firm_name or "").lower() if e.isalnum())
    norm_city = "".join(e for e in (city or "").lower() if e.isalnum())
    norm_web = "".join(e for e in (website_url or "").lower() if e.isalnum())
    raw = f"{norm_name}::{norm_city}::{norm_web}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()

