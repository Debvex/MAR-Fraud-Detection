"""Planner node that selects the next LangChain tool to run."""

from __future__ import annotations

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import DEFAULT_OPENAI_MODEL, get_openai_api_key
from app.services.llm_service import choose_next_verification_tool
from app.services.tool_service import TOOL_REGISTRY


MAX_TOOL_ITERATIONS = 8


def _choose_tool_with_bound_llm(state: dict) -> dict | None:
    """Let the LLM choose the next tool via real tool binding."""
    api_key = get_openai_api_key()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for the verification workflow.")

    available_tool_names = state.get("available_tools", list(TOOL_REGISTRY.keys()))
    tools = [TOOL_REGISTRY[name] for name in available_tool_names if name in TOOL_REGISTRY]
    if not tools:
        return None

    executed_tools = [item.get("tool_name") for item in state.get("tool_runs", [])]
    llm = ChatOpenAI(model=DEFAULT_OPENAI_MODEL, api_key=api_key, temperature=0).bind_tools(tools)
    messages = [
        SystemMessage(
            content=(
                "You are a certificate verification planner. Choose exactly one tool call that gathers"
                " the most important missing proof for fraud analysis. Prefer OCR early, then supporting"
                " checks, then issuer verification, then scoring, then final decision. Do not explain outside the tool call."
            )
        ),
        HumanMessage(
            content=(
                f"Already executed tools: {executed_tools}\n"
                f"Current state: {state}\n"
                "Choose the single best next verification tool."
            )
        ),
    ]

    try:
        response = llm.invoke(messages)
    except Exception:
        return choose_next_verification_tool(state=state, available_tools=available_tool_names)

    tool_calls = getattr(response, "tool_calls", None) or []
    if not tool_calls:
        return choose_next_verification_tool(state=state, available_tools=available_tool_names)

    tool_name = tool_calls[0].get("name")
    if tool_name not in available_tool_names:
        raise RuntimeError(f"Planner selected an unknown tool: {tool_name}")

    return {
        "action": "run_tool",
        "tool_name": tool_name,
        "reason": "Selected by the tool-bound LLM planner.",
        "source": "bound_tools",
    }


def verification_agent_node(state):
    """Ask the LLM which verification tool should run next."""
    tool_runs = state.get("tool_runs", [])
    if state.get("verification_complete"):
        return {
            "agent_plan": {"action": "route_review", "reason": "Verification already complete."},
            "current_step": "route_review",
        }

    if len(tool_runs) >= MAX_TOOL_ITERATIONS:
        return {
            "agent_plan": {
                "action": "run_tool",
                "tool_name": "decision_tool",
                "reason": "Reached iteration limit, forcing final decision.",
            },
            "next_tool_name": "decision_tool",
            "next_tool_reason": "Reached iteration limit, forcing final decision.",
            "current_step": "decision_tool",
            "logs": state.get("logs", []) + ["Agent forced the final decision due to iteration limit."],
        }

    plan = _choose_tool_with_bound_llm(state)
    action = plan.get("action", "run_tool")
    if action == "route_review" and state.get("decision"):
        return {
            "agent_plan": plan,
            "current_step": "route_review",
            "logs": state.get("logs", []) + [f"Agent completed verification: {plan.get('reason', '')}"],
        }

    tool_name = plan.get("tool_name", "decision_tool")
    if tool_name not in TOOL_REGISTRY:
        tool_name = "decision_tool"

    reason = plan.get("reason", "The agent selected the next best verification tool.")
    return {
        "agent_plan": plan,
        "next_tool_name": tool_name,
        "next_tool_reason": reason,
        "current_step": tool_name,
        "logs": state.get("logs", []) + [f"Agent selected {tool_name}: {reason}"],
    }
