"""Shared configuration helpers for the project."""
from __future__ import annotations
from dotenv import load_dotenv

import os
from pathlib import Path




BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
UPLOADS_DIR = DATA_DIR / "uploads"
PROCESSED_DIR = DATA_DIR / "processed"
RULES_PATH = DATA_DIR / "mar_rules.json"
HASH_STORE_PATH = DATA_DIR / "hashes" / "hash_store.json"
SUBMISSIONS_STORE_PATH = DATA_DIR / "submissions_store.json"
DEFAULT_OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

load_dotenv(BASE_DIR / ".env")


def get_openai_api_key() -> str | None:
    """Return the OpenAI API key when configured."""
    return os.getenv('OPENAI_API_KEY')


def ensure_app_directories() -> None:
    """Create required writable application directories."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    HASH_STORE_PATH.parent.mkdir(parents=True, exist_ok=True)
