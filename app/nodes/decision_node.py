"""Node that routes the workflow after scoring."""

from app.services.llm_service import review_final_decision


def decision_node(state):
    """Map the suspicious flag to the next route."""
    llm_review = review_final_decision(state)
    heuristic_decision = "admin_review" if state.get("suspicious", False) else "likely_valid"
    risk_score = max(0, min(100, int(state.get("risk_score", 0) + llm_review.get("risk_score_adjustment", 0))))
    llm_decision = llm_review.get("decision", heuristic_decision)
    decision = "admin_review" if heuristic_decision == "admin_review" or llm_decision == "admin_review" else "likely_valid"
    return {
        "decision": decision,
        "risk_score": risk_score,
        "suspicious": decision == "admin_review",
        "decision_confidence": llm_review.get("confidence", 0.85),
        "llm_decision_review": llm_review,
        "logs": state.get("logs", []) + [f"Decision made: {decision}"],
    }
