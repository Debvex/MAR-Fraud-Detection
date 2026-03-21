"""Node that determines whether the input looks like a certificate."""

from app.services.layoutlm_service import detect_document_type


def document_type_node(state):
    """Run document classification and store the result in state."""
    result = detect_document_type(state["file_path"])
    return {
        "is_certificate": result["is_certificate"],
        "document_type_confidence": result["confidence"],
        "llm_document_review": result.get("llm_review", {}),
        "logs": state.get("logs", []) + ["Document type checked"],
    }
