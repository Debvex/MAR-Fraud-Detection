"""API tests for the backend workflow service."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient

from backend.main import app


HASH_STORE = ROOT_DIR / "app" / "data" / "hashes" / "hash_store.json"
SAMPLE_FILE = ROOT_DIR / "sample_certificate.pdf"


def _reset_hash_store() -> None:
    HASH_STORE.write_text("[]", encoding="utf-8")


def test_upload_and_dashboard_flow():
    _reset_hash_store()
    with TestClient(app) as client:
        with SAMPLE_FILE.open("rb") as upload:
            response = client.post(
                "/api/submissions/upload",
                files={"file": ("sample_certificate.pdf", upload, "application/pdf")},
                data={
                    "student_id": "IT2026001",
                    "student_name": "Debmalya Sett",
                    "claimed_category": "workshop",
                    "claimed_points": "10",
                },
            )

        assert response.status_code == 200, response.text
        payload = response.json()
        assert payload["decision"] in {"admin_review", "likely_valid"}
        assert payload["state"]["file_name"] == "sample_certificate.pdf"
        assert payload["timeline"]

        submission_id = payload["id"]

        detail = client.get(f"/api/submissions/{submission_id}")
        assert detail.status_code == 200
        assert detail.json()["id"] == submission_id

        timeline = client.get(f"/api/submissions/{submission_id}/timeline")
        assert timeline.status_code == 200
        assert len(timeline.json()["timeline"]) >= 3

        node_state = client.get(f"/api/submissions/{submission_id}/states/decision_node")
        assert node_state.status_code == 200
        assert node_state.json()["node"] == "decision_node"

        queue = client.get("/api/dashboard/queue")
        assert queue.status_code == 200
        assert any(item["id"] == submission_id for item in queue.json())

        summary = client.get("/api/dashboard/summary")
        assert summary.status_code == 200
        assert summary.json()["total_submissions"] >= 1

        alerts = client.get("/api/dashboard/alerts")
        assert alerts.status_code == 200
        assert "items" in alerts.json()

        rules = client.get("/api/rules")
        assert rules.status_code == 200
        assert "categories" in rules.json()

        review_update = client.patch(
            f"/api/submissions/{submission_id}/review-status",
            json={"review_status": "admin_review_required"},
        )
        assert review_update.status_code == 200
        assert review_update.json()["review_status"] == "admin_review_required"


if __name__ == "__main__":
    test_upload_and_dashboard_flow()
    print("API smoke test passed.")
