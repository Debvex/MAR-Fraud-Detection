"""Node that marks low-risk submissions as likely valid."""


def mark_valid_node(state):
    """Store the low-risk review status while keeping human review in the loop."""
    return {
        "review_status": "likely_valid_pending_human_confirmation",
        "logs": state.get("logs", []) + ["Marked as likely valid"],
    }
