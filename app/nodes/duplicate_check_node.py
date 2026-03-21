"""Node that checks for duplicate certificate submissions."""

from app.services.duplicate_service import check_duplicate


def duplicate_check_node(state):
    """Compare the file against the simple local duplicate store."""
    result = check_duplicate(
        file_path=state["file_path"],
        extracted_text=state.get("extracted_text", ""),
        extracted_fields=state.get("extracted_fields", {}),
    )
    return {
        "duplicate_found": result["duplicate_found"],
        "duplicate_score": result["duplicate_score"],
        "duplicate_matches": result["matches"],
        "logs": state.get("logs", []) + ["Duplicate check completed"],
    }
