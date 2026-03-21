"""Document type detection service.

This is the beginner MVP version from the README.
It uses OCR plus simple keywords and keeps a LayoutLM-ready interface.
"""

from app.services.ocr_service import run_ocr


CERTIFICATE_KEYWORDS = [
    "certificate",
    "completion",
    "participation",
    "awarded",
    "successfully completed",
]


def detect_document_type(file_path: str):
    """Return a certificate/not-certificate guess with simple confidence."""
    ocr_result = run_ocr(file_path)
    text = ocr_result["text"].lower()

    hits = sum(1 for keyword in CERTIFICATE_KEYWORDS if keyword in text)
    confidence = min(1.0, 0.2 * hits + 0.2)

    return {
        "is_certificate": hits >= 2,
        "confidence": confidence,
    }
