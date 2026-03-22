"""Simple workflow orchestration with agent-selected LangChain tools."""

from __future__ import annotations

import copy
import uuid
from datetime import datetime, timezone
from pathlib import Path

from app.nodes.final_node import final_node
from app.nodes.review_node import review_node
from app.nodes.start_node import start_node
from app.nodes.tool_runner_node import tool_runner_node
from app.nodes.verification_agent_node import verification_agent_node
from app.services.alert_service import build_alerts
from app.services.repository import get_submission, save_submission
from app.services.tool_service import TOOL_REGISTRY


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sanitize_state(state: dict) -> dict:
    """Keep API-safe state payloads."""
    return copy.deepcopy(state)


def _append_timeline(timeline: list[dict], node_name: str, updates: dict, state: dict) -> None:
    timeline.append(
        {
            "node": node_name,
            "timestamp": _utc_now(),
            "updates": copy.deepcopy(updates),
            "state": _sanitize_state(state),
        }
    )


def run_workflow(initial_state: dict) -> dict:
    """Run the simple planner-plus-tool-runner workflow and capture every step."""
    state = copy.deepcopy(initial_state)
    timeline = []

    updates = start_node(state)
    state.update(updates)
    _append_timeline(timeline, "start_node", updates, state)

    while not state.get("decision"):
        updates = verification_agent_node(state)
        state.update(updates)
        _append_timeline(timeline, "verification_agent_node", updates, state)

        if state.get("decision"):
            break

        updates = tool_runner_node(state)
        state.update(updates)
        _append_timeline(timeline, "tool_runner_node", updates, state)

    updates = review_node(state)
    state.update(updates)
    _append_timeline(timeline, "review_node", updates, state)

    updates = final_node(state)
    state.update(updates)
    _append_timeline(timeline, "final_node", updates, state)

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
        "available_tools": list(TOOL_REGISTRY.keys()),
        "tool_runs": [],
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
