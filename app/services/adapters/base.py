"""Base dataclasses for issuer-specific certificate adapters."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class ParsedCertificate:
    """Normalized certificate fields passed into issuer adapters."""

    issuer_text: str
    participant_name: Optional[str]
    event_title: Optional[str]
    issue_date: Optional[str]
    certificate_id: Optional[str]
    qr_value: Optional[str]
    ocr_text: str
    image_path: str
