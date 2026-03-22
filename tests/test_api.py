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


def test_upload_and_core_api_flow():
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

        tools = client.get("/api/workflow/tools")
        assert tools.status_code == 200
        assert any(item["name"] == "ocr_tool" for item in tools.json())
        assert any(item["name"] == "issuer_verification_tool" for item in tools.json())

        summary = client.get("/api/dashboard/summary")
        assert summary.status_code == 200
        assert summary.json()["total_submissions"] >= 1


if __name__ == "__main__":
    test_upload_and_core_api_flow()
    print("API smoke test passed.")
