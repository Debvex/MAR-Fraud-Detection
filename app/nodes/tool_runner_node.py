"""Node that executes one selected LangChain verification tool."""

from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone

from app.services.tool_service import invoke_tool


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def tool_runner_node(state):
    """Run the tool chosen by the planner and merge its output into state."""
    tool_name = state["next_tool_name"]
    updates = invoke_tool(tool_name, state)
    tool_runs = state.get("tool_runs", [])
    tool_runs.append(
        {
            "tool_name": tool_name,
            "reason": state.get("next_tool_reason"),
            "timestamp": _utc_now(),
            "updates": deepcopy(updates),
        }
    )
    merged_logs = state.get("logs", []) + [f"Executed tool: {tool_name}"]
    response = dict(updates)
    response["tool_runs"] = tool_runs
    response["logs"] = merged_logs
    response["current_step"] = tool_name
    return response
