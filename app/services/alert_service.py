"""Alert generation helpers for dashboard-friendly fraud analysis."""

from __future__ import annotations


def build_alerts(state: dict) -> list[dict]:
    """Create alert records from the final workflow state."""
    alerts = []

    if state.get("duplicate_found"):
        alerts.append(
            {
                "type": "duplicate_found",
                "severity": "high",
                "title": "Duplicate Found",
                "message": "A matching file hash already exists in the submission store.",
            }
        )

    if not state.get("rule_valid", True):
        alerts.append(
            {
                "type": "rule_violation",
                "severity": "medium",
                "title": "Rule Violation",
                "message": "; ".join(state.get("rule_result", {}).get("reasons", [])) or "The MAR rule validation failed.",
            }
        )

    if not state.get("qr_found", False):
        alerts.append(
            {
                "type": "qr_missing",
                "severity": "low",
                "title": "QR Missing",
                "message": "No QR code was detected in the uploaded file.",
            }
        )

    if not state.get("is_certificate", False):
        alerts.append(
            {
                "type": "document_uncertain",
                "severity": "high",
                "title": "Document Type Uncertain",
                "message": "The uploaded file did not strongly look like a certificate.",
            }
        )

    return alerts
