"""Pydantic schemas for API requests and responses."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ReviewStatusUpdate(BaseModel):
    review_status: str = Field(..., examples=["admin_review_required"])


class SubmissionSummary(BaseModel):
    id: str
    student_id: str
    student_name: str
    claimed_category: str
    claimed_points: int
    decision: str | None
    review_status: str | None
    risk_score: float | None
    decision_confidence: float | None
    processing_status: str
    file_name: str
    created_at: str
    updated_at: str


class SubmissionDetail(SubmissionSummary):
    explanation: str | None
    state: dict[str, Any]
    timeline: list[dict[str, Any]]
    alerts: list[dict[str, Any]]


class DashboardSummary(BaseModel):
    total_submissions: int
    average_risk_score: float
    rule_validation_rate: float
    duplicate_rejections: int
    admin_review_required: int
    likely_valid_pending_human_confirmation: int


class RulesResponse(BaseModel):
    categories: dict[str, Any]
