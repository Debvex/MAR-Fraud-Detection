"""Risk scoring service."""

from app.services.llm_service import review_risk_score


def calculate_risk_score(state):
    """Delegate fraud-risk scoring to OpenAI."""
    result = review_risk_score(state)
    return {
        "risk_score": result["risk_score"],
        "suspicious": result["suspicious"],
        "llm_risk_review": result,
    }
