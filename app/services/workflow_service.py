"""Workflow orchestration with per-node state tracing."""

from __future__ import annotations

import copy
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.nodes.admin_review_node import admin_review_node
from app.nodes.decision_node import decision_node
from app.nodes.document_type_node import document_type_node
from app.nodes.duplicate_check_node import duplicate_check_node
from app.nodes.end_node import end_node
from app.nodes.explanation_node import explanation_node
from app.nodes.mark_valid_node import mark_valid_node
from app.nodes.ocr_node import ocr_node
from app.nodes.qr_node import qr_node
from app.nodes.risk_score_node import risk_score_node
from app.nodes.rule_check_node import rule_check_node
from app.nodes.start_node import start_node
from app.services.alert_service import build_alerts
from app.services.repository import get_submission, save_submission


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


NODE_ORDER = [
    ("start_node", start_node),
    ("document_type_node", document_type_node),
    ("ocr_node", ocr_node),
    ("qr_node", qr_node),
    ("duplicate_check_node", duplicate_check_node),
    ("rule_check_node", rule_check_node),
    ("risk_score_node", risk_score_node),
    ("decision_node", decision_node),
]


def _sanitize_state(state: dict) -> dict:
    """Keep API-safe state payloads."""
    return copy.deepcopy(state)


def run_workflow(initial_state: dict) -> dict:
    """Run the workflow while capturing every node update."""
    state = copy.deepcopy(initial_state)
    timeline = []

    for node_name, node_func in NODE_ORDER:
        updates = node_func(state)
        state.update(updates)
        timeline.append(
            {
                "node": node_name,
                "timestamp": _utc_now(),
                "updates": copy.deepcopy(updates),
                "state": _sanitize_state(state),
            }
        )

    if state.get("decision") == "admin_review":
        updates = admin_review_node(state)
        state.update(updates)
        timeline.append(
            {
                "node": "admin_review_node",
                "timestamp": _utc_now(),
                "updates": copy.deepcopy(updates),
                "state": _sanitize_state(state),
            }
        )
    else:
        updates = mark_valid_node(state)
        state.update(updates)
        timeline.append(
            {
                "node": "mark_valid_node",
                "timestamp": _utc_now(),
                "updates": copy.deepcopy(updates),
                "state": _sanitize_state(state),
            }
        )

    for node_name, node_func in [
        ("explanation_node", explanation_node),
        ("end_node", end_node),
    ]:
        updates = node_func(state)
        state.update(updates)
        timeline.append(
            {
                "node": node_name,
                "timestamp": _utc_now(),
                "updates": copy.deepcopy(updates),
                "state": _sanitize_state(state),
            }
        )

    state["alerts"] = build_alerts(state)
    state["timeline"] = timeline
    state["processing_status"] = "completed"
    return state


def process_submission(
    file_path: str,
    student_id: str,
    student_name: str,
    claimed_category: str,
    claimed_points: int,
    file_name: str | None = None,
) -> dict:
    """Run the workflow for one file and persist the result."""
    submission_id = str(uuid.uuid4())
    initial_state = {
        "submission_id": submission_id,
        "file_path": file_path,
        "file_name": file_name or Path(file_path).name,
        "student_id": student_id,
        "student_name": student_name,
        "claimed_category": claimed_category,
        "claimed_points": claimed_points,
        "processing_status": "running",
        "logs": [],
    }

    final_state = run_workflow(initial_state)
    record = {
        "id": submission_id,
        "created_at": _utc_now(),
        "file_name": final_state["file_name"],
        "file_path": final_state["file_path"],
        "student_id": final_state["student_id"],
        "student_name": final_state["student_name"],
        "claimed_category": final_state["claimed_category"],
        "claimed_points": final_state["claimed_points"],
        "processing_status": final_state["processing_status"],
        "decision": final_state.get("decision"),
        "review_status": final_state.get("review_status"),
        "risk_score": final_state.get("risk_score"),
        "decision_confidence": final_state.get("decision_confidence"),
        "is_certificate": final_state.get("is_certificate"),
        "qr_found": final_state.get("qr_found"),
        "duplicate_found": final_state.get("duplicate_found"),
        "rule_valid": final_state.get("rule_valid"),
        "suspicious": final_state.get("suspicious"),
        "explanation": final_state.get("explanation"),
        "state": final_state,
        "timeline": final_state.get("timeline", []),
        "alerts": final_state.get("alerts", []),
    }
    save_submission(record)
    return get_submission(submission_id) or record
