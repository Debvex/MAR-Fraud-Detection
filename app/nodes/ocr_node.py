"""Node that extracts text and key fields from the input file."""

from app.services.ocr_service import run_ocr


def ocr_node(state):
    """Run OCR and save extracted text, fields, and confidence."""
    result = run_ocr(state["file_path"])
    return {
        "extracted_text": result["text"],
        "extracted_fields": result["fields"],
        "ocr_confidence": result["confidence"],
        "logs": state.get("logs", []) + ["OCR completed"],
    }
