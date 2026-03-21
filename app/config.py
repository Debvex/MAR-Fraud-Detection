"""Shared configuration helpers for the project."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "app" / "data"
RULES_PATH = DATA_DIR / "mar_rules.json"
HASH_STORE_PATH = DATA_DIR / "hashes" / "hash_store.json"

load_dotenv(BASE_DIR / ".env")


def get_openai_api_key() -> str | None:
    """Return the OpenAI API key when configured."""
    return os.getenv("OPENAI_API_KEY")
