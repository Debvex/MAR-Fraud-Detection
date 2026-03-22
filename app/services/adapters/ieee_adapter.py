"""Simple IEEE-specific verification adapter."""

from __future__ import annotations

from typing import Any, Dict, Optional
from urllib.parse import urlparse

from app.services.adapters.base import ParsedCertificate


class IEEEAdapter:
    """Issuer adapter for IEEE-style seminar and workshop certificates."""

    ALLOWED_DOMAINS = {
        "ieee.org",
        "www.ieee.org",
        "credentials.ieee.org",
    }

    IEEE_KEYWORDS = [
        "ieee",
        "institute of electrical and electronics engineers",
        "certificate of participation",
        "certificate of completion",
        "seminar",
        "workshop",
        "student branch",
        "section",
        "chapter",
    ]

    def can_handle(self, cert: ParsedCertificate) -> bool:
        text = f"{cert.issuer_text} {cert.ocr_text}".lower()
        keyword_hits = sum(1 for keyword in self.IEEE_KEYWORDS if keyword in text)
        return keyword_hits >= 2

    def validate_qr(self, qr_value: Optional[str]) -> Dict[str, Any]:
        if not qr_value:
            return {"ok": False, "reason": "No QR present"}

        try:
            parsed = urlparse(qr_value)
            hostname = (parsed.hostname or "").lower()
            is_https = parsed.scheme == "https"
            domain_ok = hostname in self.ALLOWED_DOMAINS or hostname.endswith(".ieee.org")

            if not is_https:
                return {"ok": False, "reason": "QR is not HTTPS", "url": qr_value}
            if not domain_ok:
                return {"ok": False, "reason": "QR domain not trusted", "url": qr_value}
            return {"ok": True, "reason": "Trusted IEEE domain", "url": qr_value}
        except Exception as exc:  # pragma: no cover
            return {"ok": False, "reason": f"QR parse failed: {exc}"}

    def fetch_live_record(self, qr_value: Optional[str]) -> Optional[Dict[str, Any]]:
        """MVP placeholder for future issuer-side verification lookup."""
        return None

    def template_check(self, cert: ParsedCertificate) -> Dict[str, Any]:
        text = cert.ocr_text.lower()
        checks = {
            "has_ieee": "ieee" in text,
            "has_certificate_word": "certificate" in text,
            "has_participation_or_completion": "participation" in text or "completion" in text,
            "has_event_language": "seminar" in text or "workshop" in text or "conference" in text,
            "has_name": bool(cert.participant_name),
            "has_date": bool(cert.issue_date),
        }
        score = sum(1 for value in checks.values() if value)
        return {
            "ok": score >= 4,
            "score": score,
            "checks": checks,
        }

    def compare_with_live_record(self, cert: ParsedCertificate, live_record: Dict[str, Any]) -> Dict[str, Any]:
        result = {
            "name_match": False,
            "title_match": False,
            "date_match": False,
            "id_match": False,
        }

        if cert.participant_name and live_record.get("participant_name"):
            result["name_match"] = cert.participant_name.strip().lower() == live_record["participant_name"].strip().lower()
        if cert.event_title and live_record.get("event_title"):
            result["title_match"] = cert.event_title.strip().lower() == live_record["event_title"].strip().lower()
        if cert.issue_date and live_record.get("issue_date"):
            result["date_match"] = cert.issue_date == live_record["issue_date"]
        if cert.certificate_id and live_record.get("certificate_id"):
            result["id_match"] = cert.certificate_id.strip().lower() == live_record["certificate_id"].strip().lower()

        return result

    def verify(self, cert: ParsedCertificate) -> Dict[str, Any]:
        if not self.can_handle(cert):
            return {
                "handled": False,
                "status": "not_ieee",
                "reasons": ["Document does not look like an IEEE certificate"],
            }

        qr_result = self.validate_qr(cert.qr_value)
        live_record = self.fetch_live_record(cert.qr_value) if qr_result["ok"] else None

        if live_record:
            compare = self.compare_with_live_record(cert, live_record)
            suspicious = not (compare["name_match"] and (compare["title_match"] or compare["id_match"]))
            return {
                "handled": True,
                "status": "suspicious" if suspicious else "likely_valid",
                "mode": "live_record_check",
                "qr": qr_result,
                "compare": compare,
                "reasons": self._reasons_from_compare(compare),
            }

        template_result = self.template_check(cert)
        if template_result["ok"] and qr_result["ok"]:
            return {
                "handled": True,
                "status": "likely_valid",
                "mode": "template_plus_qr",
                "qr": qr_result,
                "template": template_result,
                "reasons": ["Matches IEEE-style template and QR points to trusted domain"],
            }

        reasons = []
        if not template_result["ok"]:
            reasons.append("Does not sufficiently match expected IEEE certificate text pattern")
        if not qr_result["ok"]:
            reasons.append(qr_result["reason"])

        return {
            "handled": True,
            "status": "suspicious",
            "mode": "fallback_template_check",
            "qr": qr_result,
            "template": template_result,
            "reasons": reasons,
        }

    def _reasons_from_compare(self, compare: Dict[str, Any]) -> list[str]:
        reasons = []
        if not compare["name_match"]:
            reasons.append("Participant name does not match verification record")
        if not compare["title_match"]:
            reasons.append("Event title does not match verification record")
        if not compare["date_match"]:
            reasons.append("Issue date does not match verification record")
        if not compare["id_match"]:
            reasons.append("Certificate ID does not match verification record")
        return reasons
