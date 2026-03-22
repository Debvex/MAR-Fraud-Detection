"""Review routing node."""


def review_node(state):
    """Translate the decision into a human review status."""
    decision = state.get("decision", "admin_review")
    if decision == "admin_review":
        review_status = "admin_review_required"
        message = "Marked for admin review"
    else:
        review_status = "likely_valid_pending_human_confirmation"
        message = "Marked as likely valid"

    return {
        "review_status": review_status,
        "logs": state.get("logs", []) + [message],
    }
