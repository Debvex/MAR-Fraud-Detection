"""Node that validates a submission against MAR rules."""

from app.services.rules_service import validate_rules


def rule_check_node(state):
    """Apply the simple MAR rules described in the README."""
    result = validate_rules(
        claimed_category=state.get("claimed_category", ""),
        claimed_points=state.get("claimed_points", 0),
        extracted_text=state.get("extracted_text", ""),
        extracted_fields=state.get("extracted_fields", {}),
    )
    return {
        "rule_valid": result["rule_valid"],
        "rule_result": result,
        "logs": state.get("logs", []) + ["Rule check completed"],
    }
