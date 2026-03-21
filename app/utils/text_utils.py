"""Text processing helpers used by OCR and validation logic."""

from __future__ import annotations

import re


DATE_PATTERN = re.compile(
    r"\b("
    r"\d{4}-\d{2}-\d{2}"
    r"|"
    r"\d{2}[/-]\d{2}[/-]\d{4}"
    r"|"
    r"\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s*,\s*\d{4}"
    r")\b",
    re.IGNORECASE,
)
CERTIFICATE_ID_PATTERN = re.compile(r"certificate\s*id[:\s-]*([A-Za-z0-9-]+)", re.IGNORECASE)
ISSUER_PATTERN = re.compile(r"issued by[:\s-]*(.+)", re.IGNORECASE)


def extract_basic_fields(text: str) -> dict:
    """Extract a few useful fields from OCR text using simple regex rules."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    lowered = text.lower()

    name = None
    for line in lines:
        if "certify that" in line.lower():
            parts = re.split(r"certify that", line, flags=re.IGNORECASE)
            if len(parts) > 1:
                candidate = parts[1].strip()
                name = re.split(r"\bhas\b|\bfor\b", candidate, maxsplit=1, flags=re.IGNORECASE)[0].strip()
                break
    if name is None:
        for index, line in enumerate(lines):
            if "presented to" in line.lower() and index + 1 < len(lines):
                candidate = lines[index + 1].strip()
                if candidate and len(candidate.split()) <= 5:
                    name = candidate
                    break

    date_match = DATE_PATTERN.search(text)
    certificate_id_match = CERTIFICATE_ID_PATTERN.search(text)
    issuer_match = ISSUER_PATTERN.search(text)

    return {
        "name": name,
        "issuer": issuer_match.group(1).strip() if issuer_match else None,
        "date": date_match.group(1) if date_match else None,
        "certificate_id": certificate_id_match.group(1).strip() if certificate_id_match else None,
        "raw_text_available": bool(lowered.strip()),
    }
