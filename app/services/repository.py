"""JSON persistence for submissions and dashboard queries."""

from __future__ import annotations

import json
from datetime import datetime, timezone

from app.config import SUBMISSIONS_STORE_PATH, ensure_app_directories


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _read_all() -> list[dict]:
    ensure_app_directories()
    if not SUBMISSIONS_STORE_PATH.exists():
        return []
    with SUBMISSIONS_STORE_PATH.open("r", encoding="utf-8") as file:
        if not file:
            return []
        return json.load(file)


def _write_all(items: list[dict]) -> None:
    ensure_app_directories()
    with SUBMISSIONS_STORE_PATH.open("w", encoding="utf-8") as file:
        json.dump(items, file, indent=2)


def init_db() -> None:
    """Create the JSON store when missing."""
    ensure_app_directories()
    if not SUBMISSIONS_STORE_PATH.exists():
        _write_all([])


def save_submission(record: dict) -> None:
    """Insert or replace a submission record in the JSON store."""
    payload = {
        "id": record["id"],
        "created_at": record.get("created_at", _utc_now()),
        "updated_at": _utc_now(),
        "file_name": record["file_name"],
        "file_path": record["file_path"],
        "student_id": record["student_id"],
        "student_name": record["student_name"],
        "claimed_category": record["claimed_category"],
        "claimed_points": int(record["claimed_points"]),
        "processing_status": record.get("processing_status", "completed"),
        "decision": record.get("decision"),
        "review_status": record.get("review_status"),
        "risk_score": record.get("risk_score"),
        "decision_confidence": record.get("decision_confidence"),
        "is_certificate": bool(record.get("is_certificate")),
        "qr_found": bool(record.get("qr_found")),
        "duplicate_found": bool(record.get("duplicate_found")),
        "rule_valid": bool(record.get("rule_valid")),
        "suspicious": bool(record.get("suspicious")),
        "explanation": record.get("explanation"),
        "state": record.get("state", {}),
        "timeline": record.get("timeline", []),
        "alerts": record.get("alerts", []),
    }
    items = _read_all()
    items = [item for item in items if item["id"] != payload["id"]]
    items.append(payload)
    _write_all(items)


def get_submission(submission_id: str) -> dict | None:
    """Fetch one submission by id."""
    for item in _read_all():
        if item["id"] == submission_id:
            return item
    return None


def list_submissions(limit: int = 100) -> list[dict]:
    """Fetch recent submissions ordered by update time."""
    items = sorted(_read_all(), key=lambda item: item["updated_at"], reverse=True)
    return items[:limit]


def update_review_status(submission_id: str, review_status: str) -> dict | None:
    """Update the review status of a submission."""
    existing = get_submission(submission_id)
    if existing is None:
        return None

    state = existing["state"]
    state["review_status"] = review_status
    existing["review_status"] = review_status
    existing["state"] = state
    save_submission(existing)
    return get_submission(submission_id)
