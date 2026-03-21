"""OCR service with PDF, image, and text fallbacks.

Priority:
1. Read text directly from PDF files when possible.
2. Use PaddleOCR for images and other OCR-friendly inputs.
3. Fall back to direct text reading for plain text files.
"""

from __future__ import annotations

import os
import re
from pathlib import Path

from app.utils.file_utils import read_text_if_possible
from app.utils.text_utils import extract_basic_fields

_workspace_cache_dir = Path(__file__).resolve().parents[2] / ".cache" / "paddlex"
os.environ.setdefault("PADDLE_PDX_CACHE_HOME", str(_workspace_cache_dir))
os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")

try:
    from paddleocr import PaddleOCR
except Exception:  # pragma: no cover
    PaddleOCR = None

try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover
    PdfReader = None


_ocr_engine = None


def _get_ocr_engine():
    """Create the OCR engine only when PaddleOCR is available."""
    global _ocr_engine
    if PaddleOCR is None:
        return None
    if _ocr_engine is None:
        _ocr_engine = PaddleOCR(use_angle_cls=True, lang="en")
    return _ocr_engine


def _run_paddle_ocr(file_path: str):
    """Run PaddleOCR and normalize the result format."""
    engine = _get_ocr_engine()
    if engine is None:
        return None

    result = engine.ocr(file_path, cls=True)
    texts = []
    confidences = []

    for line_group in result or []:
        for line in line_group:
            text, confidence = line[1][0], line[1][1]
            texts.append(text)
            confidences.append(float(confidence))

    full_text = "\n".join(texts)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
    return full_text, avg_confidence


def _fallback_text_read(file_path: str):
    """Read plain text files directly when OCR is not practical."""
    text = read_text_if_possible(file_path)
    if text is None:
        return "", 0.0

    confidence = 0.95 if re.search(r"[A-Za-z]", text) else 0.0
    return text, confidence


def _read_pdf_text(file_path: str):
    """Extract text from PDF files when a PDF reader is installed."""
    if PdfReader is None:
        return None

    try:
        reader = PdfReader(file_path)
        text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
    except Exception:
        return None

    if not text:
        return None

    return text, 0.90


def run_ocr(file_path: str):
    """Extract text and basic fields from the input file."""
    path = Path(file_path)

    if path.suffix.lower() == ".pdf":
        pdf_output = _read_pdf_text(file_path)
        if pdf_output is not None:
            full_text, confidence = pdf_output
        else:
            ocr_output = _run_paddle_ocr(file_path)
            if ocr_output is None:
                full_text, confidence = "", 0.0
            else:
                full_text, confidence = ocr_output
    elif path.suffix.lower() in {".txt", ".md"}:
        full_text, confidence = _fallback_text_read(file_path)
    else:
        ocr_output = _run_paddle_ocr(file_path)
        if ocr_output is None:
            full_text, confidence = _fallback_text_read(file_path)
        else:
            full_text, confidence = ocr_output

    fields = extract_basic_fields(full_text)

    return {
        "text": full_text,
        "fields": fields,
        "confidence": confidence,
    }
