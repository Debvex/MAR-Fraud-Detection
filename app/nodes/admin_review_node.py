"""Node that marks suspicious submissions for admin review."""


def admin_review_node(state):
    """Store the manual review status for suspicious cases."""
    return {
        "review_status": "admin_review_required",
        "logs": state.get("logs", []) + ["Marked for admin review"],
    }
