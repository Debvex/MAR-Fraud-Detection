"""Simple FastAPI backend for the agentic MAR fraud workflow."""

from __future__ import annotations

import shutil
import uuid
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import UPLOADS_DIR, ensure_app_directories
from app.services.repository import get_submission, init_db, list_submissions
from app.services.tool_service import get_tool_catalog
from app.services.workflow_service import process_submission
from backend.schemas import DashboardSummary, SubmissionDetail, SubmissionSummary, ToolCatalogItem


@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_app_directories()
    init_db()
    yield


app = FastAPI(title="MAR Fraud Detection API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


@app.get("/api/health", summary="Health Check", description="Quick API health endpoint for connectivity checks.")
def health() -> dict:
    return {"status": "ok"}


@app.get(
    "/api/workflow/tools",
    response_model=list[ToolCatalogItem],
    summary="List Workflow Tools",
    description="Returns the fixed LangChain tool set that the verification planner is allowed to use.",
)
def workflow_tools() -> list[ToolCatalogItem]:
    return [ToolCatalogItem(**item) for item in get_tool_catalog()]


@app.post(
    "/api/submissions/upload",
    response_model=SubmissionDetail,
    summary="Upload And Process Submission",
    description="Uploads one certificate file and runs it through the full agentic verification workflow.",
)
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


@app.get(
    "/api/submissions",
    response_model=list[SubmissionSummary],
    summary="List Processed Submissions",
    description="Returns the most recent processed submissions in compact list form.",
)
def get_submissions() -> list[SubmissionSummary]:
    return [_to_summary(record) for record in list_submissions(limit=100)]


@app.get(
    "/api/submissions/{submission_id}",
    response_model=SubmissionDetail,
    summary="Get Submission Detail",
    description="Returns the full stored result for one processed submission, including state, timeline, and alerts.",
)
def get_submission_detail(submission_id: str) -> SubmissionDetail:
    record = get_submission(submission_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Submission not found")
    return _to_detail(record)


@app.get(
    "/api/dashboard/summary",
    response_model=DashboardSummary,
    summary="Get Dashboard Summary",
    description="Returns compact aggregate metrics for beginner-friendly dashboard display.",
)
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
