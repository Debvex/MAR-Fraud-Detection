"""Explanation service.

When OpenAI credentials are available, this uses the Responses API.
Otherwise it returns a deterministic plain-language explanation so the project
remains runnable without external setup.
"""

from __future__ import annotations

from app.config import get_openai_api_key

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None


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


def generate_explanation(state):
    """Return a short, readable admin explanation."""
    api_key = get_openai_api_key()
    if not api_key or OpenAI is None:
        return _build_fallback_explanation(state)

    client = OpenAI(api_key=api_key)
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
            model="gpt-4.1-mini",
            input=prompt,
        )
        return response.output_text
    except Exception:
        return _build_fallback_explanation(state)
