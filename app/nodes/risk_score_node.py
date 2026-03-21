"""Node that combines earlier checks into one risk score."""

from app.services.scoring_service import calculate_risk_score


def risk_score_node(state):
    """Calculate the fraud risk score and suspicious flag."""
    result = calculate_risk_score(state)
    return {
        "risk_score": result["risk_score"],
        "suspicious": result["suspicious"],
        "logs": state.get("logs", []) + ["Risk score calculated"],
    }
