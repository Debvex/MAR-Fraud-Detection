"""Document type detection service."""

from app.services.llm_service import review_document_type
from app.services.ocr_service import run_ocr


def detect_document_type(file_path: str):
    """Return an OpenAI-authored certificate classification."""
    ocr_result = run_ocr(file_path)
    llm_review = review_document_type(text=ocr_result["text"])

    return {
        "is_certificate": llm_review["is_certificate"],
        "confidence": llm_review["confidence"],
        "llm_review": llm_review,
    }
