"""Start node for file validation and initial logging."""

from app.utils.file_utils import ensure_file_exists


def start_node(state):
    """Validate the input file and start the workflow log."""
    file_path = state["file_path"]
    logs = state.get("logs", [])

    ensure_file_exists(file_path)
    logs.append(f"Start node: file exists at {file_path}")

    return {"logs": logs}
