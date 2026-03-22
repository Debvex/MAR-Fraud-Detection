"""OpenAI-backed reasoning helpers for the verification workflow."""

from __future__ import annotations

import json
from typing import Any, Dict

from app.config import DEFAULT_OPENAI_MODEL, get_openai_api_key

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


def _get_client() -> Any:
    api_key = get_openai_api_key()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is required for the verification workflow.")
    if OpenAI is None:
        raise RuntimeError("The openai package is required for the verification workflow.")
    return OpenAI(api_key=api_key)


def _parse_json_response(text: str) -> Dict[str, Any]:
    try:
        payload = json.loads(text)
    except Exception as exc:  # pragma: no cover
        raise RuntimeError("OpenAI returned a non-JSON response.") from exc
    if not isinstance(payload, dict):
        raise RuntimeError("OpenAI returned a JSON value that was not an object.")
    return payload


def _call_json_model(system_prompt: str, user_prompt: str) -> Dict[str, Any]:
    client = _get_client()
    prompt = (
        f"{system_prompt}\n\n"
        "Return only one valid JSON object. Do not include markdown, prose outside JSON, or code fences.\n\n"
        f"{user_prompt}"
    )
    response = client.responses.create(
        model=DEFAULT_OPENAI_MODEL,
        input=prompt,
    )
    return _parse_json_response(response.output_text)


def review_document_type(text: str) -> Dict[str, Any]:
    """Use OpenAI as the authoritative document classifier."""
    result = _call_json_model(
        system_prompt=(
            "You are a certificate-verification reasoning model."
            " Decide whether OCR text belongs to a certificate that should enter MAR fraud analysis."
            " Be conservative when OCR evidence is weak."
        ),
        user_prompt=(
            f"OCR text:\n{text[:6000]}\n\n"
            'Return keys: is_certificate (bool), confidence (float 0 to 1), rationale (string), indicators (array of short strings).'
        ),
    )
    return {
        "is_certificate": bool(result["is_certificate"]),
        "confidence": float(result["confidence"]),
        "rationale": str(result["rationale"]),
        "indicators": [str(item) for item in result.get("indicators", [])],
        "source": "openai",
    }


def review_rule_validation(
    claimed_category: str,
    claimed_points: int,
    extracted_text: str,
    extracted_fields: Dict[str, Any],
    rules_context: Dict[str, Any],
) -> Dict[str, Any]:
    """Use OpenAI as the authoritative MAR policy reviewer."""
    result = _call_json_model(
        system_prompt=(
            "You validate MAR certificate submissions against supplied MAR policy data."
            " Use the provided rules as ground truth, but make the final judgment yourself."
            " If OCR evidence is incomplete, explain the uncertainty explicitly."
        ),
        user_prompt=(
            f"Claimed category: {claimed_category}\n"
            f"Claimed points: {claimed_points}\n"
            f"Extracted fields: {json.dumps(extracted_fields, ensure_ascii=True)}\n"
            f"Rules context: {json.dumps(rules_context, ensure_ascii=True)}\n"
            f"OCR text:\n{extracted_text[:6000]}\n\n"
            'Return keys: rule_valid (bool), confidence (float 0 to 1), rationale (string), reasons (array of strings), recommended_category (string).'
        ),
    )
    return {
        "rule_valid": bool(result["rule_valid"]),
        "confidence": float(result["confidence"]),
        "rationale": str(result["rationale"]),
        "reasons": [str(item) for item in result.get("reasons", [])],
        "recommended_category": str(result.get("recommended_category") or claimed_category),
        "source": "openai",
    }


def review_risk_score(state: Dict[str, Any]) -> Dict[str, Any]:
    """Use OpenAI as the authoritative risk scorer."""
    result = _call_json_model(
        system_prompt=(
            "You are the fraud-risk scoring brain for a MAR certificate verification workflow."
            " Score only from the evidence in the provided state."
            " Use the full 0-100 range and explain the main factors."
        ),
        user_prompt=(
            f"Workflow state: {json.dumps(state, default=str, ensure_ascii=True)[:7000]}\n\n"
            'Return keys: risk_score (integer 0 to 100), suspicious (bool), rationale (string), signals (array of short strings).'
        ),
    )
    risk_score = max(0, min(100, int(result["risk_score"])))
    return {
        "risk_score": risk_score,
        "suspicious": bool(result["suspicious"]),
        "rationale": str(result["rationale"]),
        "signals": [str(item) for item in result.get("signals", [])],
        "source": "openai",
    }


def review_final_decision(state: Dict[str, Any]) -> Dict[str, Any]:
    """Use OpenAI as the authoritative final routing model."""
    result = _call_json_model(
        system_prompt=(
            "You are the final review-routing model for a MAR certificate fraud workflow."
            " Route cases to admin_review when evidence is suspicious, incomplete, or contradictory."
            " Route to likely_valid only when the evidence is strong enough."
        ),
        user_prompt=(
            f"State summary: {json.dumps(state, default=str, ensure_ascii=True)[:7000]}\n\n"
            'Return keys: decision ("admin_review" or "likely_valid"), confidence (float 0 to 1), rationale (string), priority ("low"|"normal"|"high").'
        ),
    )
    decision = str(result["decision"])
    if decision not in {"admin_review", "likely_valid"}:
        raise RuntimeError(f"OpenAI returned an invalid decision: {decision}")
    return {
        "decision": decision,
        "confidence": float(result["confidence"]),
        "rationale": str(result["rationale"]),
        "priority": str(result.get("priority", "normal")),
        "source": "openai",
    }


def choose_next_verification_tool(state: Dict[str, Any], available_tools: list[str]) -> Dict[str, Any]:
    """Use OpenAI to choose the next tool when tool binding does not yield a call."""
    executed_tools = [item.get("tool_name") for item in state.get("tool_runs", [])]
    result = _call_json_model(
        system_prompt=(
            "You are an autonomous certificate-verification planner."
            " Decide the next best tool based on missing evidence."
            " Route to review only when enough evidence exists for a final decision."
        ),
        user_prompt=(
            f"Available tools: {json.dumps(available_tools, ensure_ascii=True)}\n"
            f"Already executed tools: {json.dumps(executed_tools, ensure_ascii=True)}\n"
            f"Current state: {json.dumps(state, default=str, ensure_ascii=True)[:7000]}\n\n"
            'Return keys: action ("run_tool" or "route_review"), tool_name (string or null), reason (string).'
        ),
    )
    action = str(result["action"])
    tool_name = result.get("tool_name")
    if action == "run_tool":
        if tool_name not in available_tools:
            raise RuntimeError(f"OpenAI selected an unknown tool: {tool_name}")
        return {
            "action": "run_tool",
            "tool_name": str(tool_name),
            "reason": str(result["reason"]),
            "source": "openai",
        }
    return {
        "action": "route_review",
        "tool_name": None,
        "reason": str(result["reason"]),
        "source": "openai",
    }


def generate_explanation(state: Dict[str, Any]) -> str:
    """Generate the final admin-facing explanation with OpenAI."""
    client = _get_client()
    prompt = (
        "You explain the outcome of a certificate verification workflow to an admin.\n"
        "Write a concise explanation that references the strongest evidence and the final routing decision.\n\n"
        f"Workflow state:\n{json.dumps(state, default=str, ensure_ascii=True)[:7000]}"
    )
    response = client.responses.create(
        model=DEFAULT_OPENAI_MODEL,
        input=prompt,
    )
    return response.output_text.strip()
