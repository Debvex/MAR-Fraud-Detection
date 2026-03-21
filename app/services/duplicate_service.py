"""Duplicate detection service using a simple local JSON store."""

from __future__ import annotations

import json
from hashlib import sha256

from app.config import HASH_STORE_PATH
from app.utils.file_utils import ensure_parent_dir, read_bytes


def _load_hash_db():
    """Load the existing duplicate database."""
    if not HASH_STORE_PATH.exists():
        return []
    with HASH_STORE_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def _save_hash_db(data):
    """Persist the duplicate database."""
    ensure_parent_dir(HASH_STORE_PATH)
    with HASH_STORE_PATH.open("w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)


def _calculate_file_hash(file_path: str) -> str:
    """Create a deterministic file fingerprint."""
    return sha256(read_bytes(file_path)).hexdigest()


def check_duplicate(file_path: str, extracted_text: str, extracted_fields: dict):
    """Check whether the file hash already exists in the local store."""
    current_hash = _calculate_file_hash(file_path)
    database = _load_hash_db()
    matches = [item for item in database if item["hash"] == current_hash]

    database.append(
        {
            "file_path": file_path,
            "hash": current_hash,
            "certificate_id": extracted_fields.get("certificate_id"),
            "text_length": len(extracted_text or ""),
        }
    )
    _save_hash_db(database)

    return {
        "duplicate_found": len(matches) > 0,
        "duplicate_score": 1.0 if matches else 0.0,
        "matches": matches,
    }
