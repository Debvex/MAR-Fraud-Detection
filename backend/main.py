"""FastAPI backend for the MAR fraud analysis workflow."""

from __future__ import annotations

import json
import shutil
import uuid
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import RULES_PATH, UPLOADS_DIR, ensure_app_directories
from app.services.repository import get_submission, init_db, list_submissions, update_review_status
from app.services.workflow_service import process_submission
from backend.schemas import DashboardSummary, ReviewStatusUpdate, RulesResponse, SubmissionDetail, SubmissionSummary


app = FastAPI(title="MAR Fraud Detection API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    ensure_app_directories()
    init_db()


def _save_upload(upload: UploadFile) -> Path:
    ensure_app_directories()
    suffix = Path(upload.filename or "").suffix
    target = UPLOADS_DIR / f"{uuid.uuid4()}{suffix}"
    with target.open("wb") as file:
        shutil.copyfileobj(upload.file, file)
    return target


def _to_summary(record: dict) -> SubmissionSummary:
    return SubmissionSummary(
        id=record["id"],
        student_id=record["student_id"],
        student_name=record["student_name"],
        claimed_category=record["claimed_category"],
        claimed_points=record["claimed_points"],
        decision=record.get("decision"),
        review_status=record.get("review_status"),
        risk_score=record.get("risk_score"),
        decision_confidence=record.get("decision_confidence"),
        processing_status=record["processing_status"],
        file_name=record["file_name"],
        created_at=record["created_at"],
        updated_at=record["updated_at"],
    )


def _to_detail(record: dict) -> SubmissionDetail:
    base = _to_summary(record).model_dump()
    base.update(
        explanation=record.get("explanation"),
        state=record.get("state", {}),
        timeline=record.get("timeline", []),
        alerts=record.get("alerts", []),
    )
    return SubmissionDetail(**base)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/api/submissions/upload", response_model=SubmissionDetail)
def upload_submission(
    file: UploadFile = File(...),
    student_id: str = Form(...),
    student_name: str = Form(...),
    claimed_category: str = Form(...),
    claimed_points: int = Form(...),
):
    saved_path = _save_upload(file)
    record = process_submission(
        file_path=str(saved_path),
        student_id=student_id,
        student_name=student_name,
        claimed_category=claimed_category,
        claimed_points=claimed_points,
        file_name=file.filename or saved_path.name,
    )
    return _to_detail(record)


@app.get("/api/submissions", response_model=list[SubmissionSummary])
def get_submissions() -> list[SubmissionSummary]:
    return [_to_summary(record) for record in list_submissions()]


@app.get("/api/submissions/{submission_id}", response_model=SubmissionDetail)
def get_submission_detail(submission_id: str) -> SubmissionDetail:
    record = get_submission(submission_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _to_detail(record)


@app.get("/api/submissions/{submission_id}/timeline")
def get_submission_timeline(submission_id: str) -> dict:
    record = get_submission(submission_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"id": submission_id, "timeline": record.get("timeline", [])}


@app.get("/api/submissions/{submission_id}/states/{node_name}")
def get_submission_state_for_node(submission_id: str, node_name: str) -> dict:
    record = get_submission(submission_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    for entry in record.get("timeline", []):
        if entry.get("node") == node_name:
            return entry
    raise HTTPException(status_code=404, detail="Node state not found")


@app.patch("/api/submissions/{submission_id}/review-status", response_model=SubmissionDetail)
def patch_review_status(submission_id: str, payload: ReviewStatusUpdate) -> SubmissionDetail:
    record = update_review_status(submission_id, payload.review_status)
    if record is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _to_detail(record)


@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def dashboard_summary() -> DashboardSummary:
    submissions = list_submissions(limit=1000)
    total = len(submissions)
    average_risk_score = sum(item.get("risk_score") or 0 for item in submissions) / total if total else 0.0
    rule_valid_count = sum(1 for item in submissions if item.get("rule_valid"))
    duplicate_rejections = sum(1 for item in submissions if item.get("duplicate_found"))
    admin_review_required = sum(1 for item in submissions if item.get("review_status") == "admin_review_required")
    likely_valid = sum(
        1 for item in submissions if item.get("review_status") == "likely_valid_pending_human_confirmation"
    )
    rule_validation_rate = (rule_valid_count / total) * 100 if total else 0.0
    return DashboardSummary(
        total_submissions=total,
        average_risk_score=round(average_risk_score, 2),
        rule_validation_rate=round(rule_validation_rate, 2),
        duplicate_rejections=duplicate_rejections,
        admin_review_required=admin_review_required,
        likely_valid_pending_human_confirmation=likely_valid,
    )


@app.get("/api/dashboard/alerts")
def dashboard_alerts() -> dict:
    submissions = list_submissions(limit=100)
    alerts = []
    for item in submissions:
        for alert in item.get("alerts", []):
            alerts.append(
                {
                    "submission_id": item["id"],
                    "student_id": item["student_id"],
                    "student_name": item["student_name"],
                    "decision": item.get("decision"),
                    **alert,
                }
            )
    return {"items": alerts[:50]}


@app.get("/api/dashboard/queue", response_model=list[SubmissionSummary])
def dashboard_queue() -> list[SubmissionSummary]:
    return [_to_summary(record) for record in list_submissions(limit=200)]


@app.get("/api/rules", response_model=RulesResponse)
def get_rules() -> RulesResponse:
    return RulesResponse(**json.loads(RULES_PATH.read_text(encoding="utf-8")))
