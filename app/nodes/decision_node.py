"""Node that routes the workflow after scoring."""


def decision_node(state):
    """Map the suspicious flag to the next route."""
    decision = "admin_review" if state.get("suspicious", False) else "likely_valid"
    return {
        "decision": decision,
        "logs": state.get("logs", []) + [f"Decision made: {decision}"],
    }
