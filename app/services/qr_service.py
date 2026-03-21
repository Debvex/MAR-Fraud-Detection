"""QR detection service with safe fallbacks."""

from __future__ import annotations

from pathlib import Path

from app.utils.file_utils import read_text_if_possible

try:
    import cv2
except ImportError:  # pragma: no cover
    cv2 = None

try:
    from pyzbar.pyzbar import decode
except Exception:  # pragma: no cover
    decode = None


def read_qr(file_path: str):
    """Read QR data from an image or fall back to text markers."""
    if cv2 is not None and decode is not None:
        try:
            image = cv2.imread(file_path)
            if image is not None:
                decoded = decode(image)
                if decoded:
                    data = decoded[0].data.decode("utf-8")
                    return {"found": True, "data": data}
        except Exception:
            pass

    if Path(file_path).suffix.lower() in {".txt", ".md"}:
        text = read_text_if_possible(file_path) or ""
        for line in text.splitlines():
            if "qr:" in line.lower():
                _, _, value = line.partition(":")
                return {"found": True, "data": value.strip() or None}

    return {"found": False, "data": None}
