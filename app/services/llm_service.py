"""Explanation service.

When OpenAI credentials are available, this uses the Responses API.
Otherwise it returns a deterministic plain-language explanation so the project
remains runnable without external setup.
"""

from __future__ import annotations

import json
from typing import Any, Dict

from app.config import DEFAULT_OPENAI_MODEL, get_openai_api_key

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


def _get_client():
    api_key = get_openai_api_key()
    if not api_key or OpenAI is None:
        return None
    return OpenAI(api_key=api_key)


def _parse_json_response(text: str) -> Dict[str, Any] | None:
    """Parse JSON-only model responses safely."""
    try:
        return json.loads(text)
    except Exception:
        return None


def _call_json_model(system_prompt: str, user_prompt: str) -> Dict[str, Any] | None:
    """Call the OpenAI API and expect a JSON object in the response."""
    client = _get_client()
    if client is None:
        return None

    prompt = (
        f"{system_prompt}\n\n"
        "Return only a valid JSON object with no markdown.\n\n"
        f"{user_prompt}"
    )

    try:
        response = client.responses.create(
            model=DEFAULT_OPENAI_MODEL,
            input=prompt,
        )
        return _parse_json_response(response.output_text)
    except Exception:
        return None


def _build_fallback_explanation(state) -> str:
    """Generate a short explanation without calling an external model."""
    reasons = []

    if not state.get("is_certificate"):
        reasons.append("the document did not strongly look like a certificate")
    if not state.get("qr_found"):
        reasons.append("no QR code was detected")
    if state.get("duplicate_found"):
        reasons.append("a duplicate submission was found")
    if not state.get("rule_valid", True):
        reasons.append("the MAR rule check failed")

    if reasons:
        joined = ", ".join(reasons[:-1])
        if joined:
            joined = f"{joined}, and {reasons[-1]}"
        else:
            joined = reasons[0]
        return f"This file was flagged because {joined}."

    return "This file appears likely valid because the certificate checks passed and no major issues were detected."


def review_document_type(text: str, heuristic_is_certificate: bool, heuristic_confidence: float) -> Dict[str, Any]:
    """Use the LLM as an advisory reviewer for document classification."""
    fallback = {
        "is_certificate": heuristic_is_certificate,
        "confidence": heuristic_confidence,
        "rationale": "Heuristic document classification was used.",
        "indicators": [],
        "source": "fallback",
    }
    if not text.strip():
        return fallback

    result = _call_json_model(
        system_prompt=(
            "You review OCR text from uploaded documents and decide whether the document"
            " is a certificate relevant to MAR verification."
        ),
        user_prompt=(
            f"Heuristic decision: {heuristic_is_certificate}\n"
            f"Heuristic confidence: {heuristic_confidence}\n"
            f"OCR text:\n{text[:5000]}\n\n"
            'Return keys: is_certificate (bool), confidence (float 0 to 1), rationale (string), indicators (array of short strings).'
        ),
    )
    if result is None:
        return fallback

    return {
        "is_certificate": bool(result.get("is_certificate", heuristic_is_certificate)),
        "confidence": float(result.get("confidence", heuristic_confidence)),
        "rationale": str(result.get("rationale", fallback["rationale"])),
        "indicators": list(result.get("indicators", [])),
        "source": "openai",
    }


def review_rule_validation(
    claimed_category: str,
    claimed_points: int,
    extracted_text: str,
    extracted_fields: Dict[str, Any],
    heuristic_rule_valid: bool,
    heuristic_reasons: list[str],
) -> Dict[str, Any]:
    """Use the LLM as an advisory reviewer for the MAR rule check."""
    fallback = {
        "rule_valid": heuristic_rule_valid,
        "confidence": 0.7 if heuristic_rule_valid else 0.9,
        "rationale": "Heuristic MAR rule validation was used.",
        "reasons": heuristic_reasons,
        "recommended_category": claimed_category,
        "source": "fallback",
    }

    if not extracted_text.strip():
        return fallback

    result = _call_json_model(
        system_prompt=(
            "You review MAR certificate submissions for policy alignment."
            " You are advisory only and should be conservative."
        ),
        user_prompt=(
            f"Claimed category: {claimed_category}\n"
            f"Claimed points: {claimed_points}\n"
            f"Extracted fields: {json.dumps(extracted_fields, ensure_ascii=True)}\n"
            f"Heuristic rule_valid: {heuristic_rule_valid}\n"
            f"Heuristic reasons: {json.dumps(heuristic_reasons, ensure_ascii=True)}\n"
            f"OCR text:\n{extracted_text[:5000]}\n\n"
            'Return keys: rule_valid (bool), confidence (float 0 to 1), rationale (string), reasons (array of strings), recommended_category (string).'
        ),
    )
    if result is None:
        return fallback

    return {
        "rule_valid": bool(result.get("rule_valid", heuristic_rule_valid)),
        "confidence": float(result.get("confidence", fallback["confidence"])),
        "rationale": str(result.get("rationale", fallback["rationale"])),
        "reasons": list(result.get("reasons", heuristic_reasons)),
        "recommended_category": str(result.get("recommended_category", claimed_category)),
        "source": "openai",
    }


def review_final_decision(state) -> Dict[str, Any]:
    """Use the LLM as an advisory reviewer for final case routing."""
    heuristic_decision = "admin_review" if state.get("suspicious", False) else "likely_valid"
    fallback = {
        "decision": heuristic_decision,
        "confidence": 0.85,
        "rationale": "Rule-based final decision was used.",
        "risk_score_adjustment": 0,
        "priority": "normal" if heuristic_decision == "likely_valid" else "high",
        "source": "fallback",
    }

    result = _call_json_model(
        system_prompt=(
            "You are a fraud-analysis decision support assistant."
            " Review the full certificate verification state and recommend final routing."
        ),
        user_prompt=(
            f"State summary: {json.dumps(state, default=str, ensure_ascii=True)[:7000]}\n\n"
            'Return keys: decision ("admin_review" or "likely_valid"), confidence (float 0 to 1), rationale (string), risk_score_adjustment (integer between -10 and 10), priority ("low"|"normal"|"high").'
        ),
    )
    if result is None:
        return fallback

    return {
        "decision": str(result.get("decision", heuristic_decision)),
        "confidence": float(result.get("confidence", fallback["confidence"])),
        "rationale": str(result.get("rationale", fallback["rationale"])),
        "risk_score_adjustment": int(result.get("risk_score_adjustment", 0)),
        "priority": str(result.get("priority", fallback["priority"])),
        "source": "openai",
    }


def choose_next_verification_tool(state: Dict[str, Any], available_tools: list[str]) -> Dict[str, Any]:
    """Choose the next LangChain tool based on missing proof in the state."""
    executed_tools = [item.get("tool_name") for item in state.get("tool_runs", [])]
    fallback = _fallback_next_tool(state, available_tools, executed_tools)

    result = _call_json_model(
        system_prompt=(
            "You are a verification planner for certificate authenticity analysis."
            " Choose exactly one next tool to gather missing proof, or route to review"
            " only when the case already has enough evidence."
        ),
        user_prompt=(
            f"Available tools: {json.dumps(available_tools)}\n"
            f"Already executed tools: {json.dumps(executed_tools)}\n"
            f"Current state: {json.dumps(state, default=str, ensure_ascii=True)[:7000]}\n\n"
            'Return keys: action ("run_tool" or "route_review"), tool_name (string or null), reason (string).'
        ),
    )
    if result is None:
        return fallback

    tool_name = result.get("tool_name")
    if result.get("action") == "run_tool" and tool_name not in available_tools:
        return fallback
    return {
        "action": str(result.get("action", fallback["action"])),
        "tool_name": tool_name,
        "reason": str(result.get("reason", fallback["reason"])),
    }


def _fallback_next_tool(state: Dict[str, Any], available_tools: list[str], executed_tools: list[str]) -> Dict[str, Any]:
    """Deterministic planner fallback for tool selection."""
    if "ocr_tool" not in executed_tools and not state.get("extracted_text"):
        return {"action": "run_tool", "tool_name": "ocr_tool", "reason": "OCR evidence is missing."}
    if "document_type_tool" not in executed_tools and "document_type_tool" in available_tools:
        return {"action": "run_tool", "tool_name": "document_type_tool", "reason": "Document type proof is missing."}
    if "qr_tool" not in executed_tools and "qr_tool" in available_tools:
        return {"action": "run_tool", "tool_name": "qr_tool", "reason": "QR verification has not been checked yet."}
    if "issuer_verification_tool" not in executed_tools and state.get("extracted_text"):
        return {"action": "run_tool", "tool_name": "issuer_verification_tool", "reason": "Issuer-specific verification is missing."}
    if "duplicate_check_tool" not in executed_tools and state.get("extracted_text"):
        return {"action": "run_tool", "tool_name": "duplicate_check_tool", "reason": "Duplicate evidence is missing."}
    if "rule_check_tool" not in executed_tools and state.get("extracted_text"):
        return {"action": "run_tool", "tool_name": "rule_check_tool", "reason": "MAR rule validation is missing."}
    if "risk_score_tool" not in executed_tools:
        return {"action": "run_tool", "tool_name": "risk_score_tool", "reason": "Risk score has not been computed."}
    if "decision_tool" not in executed_tools:
        return {"action": "run_tool", "tool_name": "decision_tool", "reason": "Final routing decision is missing."}
    return {"action": "route_review", "tool_name": None, "reason": "All verification tools already ran."}


def generate_explanation(state):
    """Return a short, readable admin explanation."""
    client = _get_client()
    if client is None:
        return _build_fallback_explanation(state)

    prompt = f"""
You are explaining the result of a certificate verification workflow.
Return a short, clear explanation for an admin.

State:
- is_certificate: {state.get("is_certificate")}
- qr_found: {state.get("qr_found")}
- duplicate_found: {state.get("duplicate_found")}
- rule_valid: {state.get("rule_valid")}
- risk_score: {state.get("risk_score")}
- decision: {state.get("decision")}
- review_status: {state.get("review_status")}
- rule_result: {state.get("rule_result")}
""".strip()

    try:
        response = client.responses.create(
            model=DEFAULT_OPENAI_MODEL,
            input=prompt,
        )
        return response.output_text
    except Exception:
        return _build_fallback_explanation(state)
