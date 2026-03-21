"""Final node for workflow completion."""


def end_node(state):
    """Add a final log entry and finish the workflow."""
    return {"logs": state.get("logs", []) + ["Workflow finished"]}
