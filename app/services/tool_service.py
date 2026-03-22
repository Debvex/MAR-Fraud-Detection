"""LangChain tool wrappers for document verification."""

from __future__ import annotations

import copy
from typing import Any

from langchain_core.tools import tool

from app.services.adapters.base import ParsedCertificate
from app.services.adapters.ieee_adapter import IEEEAdapter
from app.services.llm_service import review_final_decision
from app.services.layoutlm_service import detect_document_type
from app.services.duplicate_service import check_duplicate
from app.services.ocr_service import run_ocr
from app.services.qr_service import read_qr
from app.services.rules_service import validate_rules
from app.services.scoring_service import calculate_risk_score


ADAPTERS = [
    ("ieee", IEEEAdapter()),
]


def _build_parsed_certificate(state_snapshot: dict[str, Any]) -> ParsedCertificate:
    """Convert workflow state into the adapter input shape."""
    extracted_fields = state_snapshot.get("extracted_fields", {}) or {}
    ocr_text = state_snapshot.get("extracted_text", "") or ""
    return ParsedCertificate(
        issuer_text=str(extracted_fields.get("issuer") or ""),
        participant_name=extracted_fields.get("name"),
        event_title=extracted_fields.get("event_title") or extracted_fields.get("title"),
        issue_date=extracted_fields.get("date"),
        certificate_id=extracted_fields.get("certificate_id"),
        qr_value=state_snapshot.get("qr_data"),
        ocr_text=ocr_text,
        image_path=state_snapshot.get("file_path", ""),
    )


@tool("document_type_tool")
def document_type_tool(file_path: str) -> dict[str, Any]:
    """Check whether the uploaded file looks like a certificate."""
    result = detect_document_type(file_path)
    return {
        "is_certificate": result["is_certificate"],
        "document_type_confidence": result["confidence"],
        "llm_document_review": result.get("llm_review", {}),
    }


@tool("ocr_tool")
def ocr_tool(file_path: str) -> dict[str, Any]:
    """Extract OCR text and basic fields from the file."""
    result = run_ocr(file_path)
    return {
        "extracted_text": result["text"],
        "extracted_fields": result["fields"],
        "ocr_confidence": result["confidence"],
    }


@tool("qr_tool")
def qr_tool(file_path: str) -> dict[str, Any]:
    """Read any QR code content from the file."""
    result = read_qr(file_path)
    return {
        "qr_found": result["found"],
        "qr_data": result["data"],
    }


@tool("duplicate_check_tool")
def duplicate_check_tool(file_path: str, extracted_text: str, extracted_fields: dict[str, Any]) -> dict[str, Any]:
    """Check whether the uploaded document was already submitted."""
    result = check_duplicate(
        file_path=file_path,
        extracted_text=extracted_text,
        extracted_fields=extracted_fields,
    )
    return {
        "duplicate_found": result["duplicate_found"],
        "duplicate_score": result["duplicate_score"],
        "duplicate_matches": result["matches"],
    }


@tool("rule_check_tool")
def rule_check_tool(
    claimed_category: str,
    claimed_points: int,
    extracted_text: str,
    extracted_fields: dict[str, Any],
) -> dict[str, Any]:
    """Validate MAR rules against the extracted certificate evidence."""
    result = validate_rules(
        claimed_category=claimed_category,
        claimed_points=claimed_points,
        extracted_text=extracted_text,
        extracted_fields=extracted_fields,
    )
    return {
        "rule_valid": result["rule_valid"],
        "rule_result": result,
        "llm_rule_review": result.get("llm_review", {}),
    }


@tool("risk_score_tool")
def risk_score_tool(state_snapshot: dict[str, Any]) -> dict[str, Any]:
    """Calculate the fraud risk score from the current evidence."""
    result = calculate_risk_score(state_snapshot)
    return {
        "risk_score": result["risk_score"],
        "suspicious": result["suspicious"],
    }


@tool("issuer_verification_tool")
def issuer_verification_tool(state_snapshot: dict[str, Any]) -> dict[str, Any]:
    """Run issuer-specific verification when the certificate matches a known issuer."""
    parsed_certificate = _build_parsed_certificate(state_snapshot)
    for adapter_name, adapter in ADAPTERS:
        if adapter.can_handle(parsed_certificate):
            result = adapter.verify(parsed_certificate)
            verified = result.get("handled") and result.get("status") == "likely_valid"
            return {
                "issuer_adapter_name": adapter_name,
                "issuer_verified": bool(verified),
                "issuer_verification_mode": str(result.get("mode", "no_mode")),
                "issuer_verification_result": result,
            }

    return {
        "issuer_adapter_name": "none",
        "issuer_verified": False,
        "issuer_verification_mode": "no_adapter",
        "issuer_verification_result": {
            "handled": False,
            "status": "no_adapter",
            "reasons": ["No issuer-specific adapter matched this certificate."],
        },
    }


@tool("decision_tool")
def decision_tool(state_snapshot: dict[str, Any]) -> dict[str, Any]:
    """Recommend the final review route from the full state."""
    llm_review = review_final_decision(state_snapshot)
    heuristic_decision = "admin_review" if state_snapshot.get("suspicious", False) else "likely_valid"
    risk_score = max(
        0,
        min(100, int(state_snapshot.get("risk_score", 0) + llm_review.get("risk_score_adjustment", 0))),
    )
    llm_decision = llm_review.get("decision", heuristic_decision)
    decision = "admin_review" if heuristic_decision == "admin_review" or llm_decision == "admin_review" else "likely_valid"
    return {
        "decision": decision,
        "risk_score": risk_score,
        "suspicious": decision == "admin_review",
        "decision_confidence": llm_review.get("confidence", 0.85),
        "llm_decision_review": llm_review,
        "verification_complete": True,
    }


TOOL_REGISTRY = {
    "document_type_tool": document_type_tool,
    "ocr_tool": ocr_tool,
    "qr_tool": qr_tool,
    "duplicate_check_tool": duplicate_check_tool,
    "issuer_verification_tool": issuer_verification_tool,
    "rule_check_tool": rule_check_tool,
    "risk_score_tool": risk_score_tool,
    "decision_tool": decision_tool,
}


def get_tool_catalog() -> list[dict[str, str]]:
    """Return API-friendly tool metadata."""
    return [
        {"name": name, "description": tool_obj.description or ""}
        for name, tool_obj in TOOL_REGISTRY.items()
    ]


def invoke_tool(tool_name: str, state: dict[str, Any]) -> dict[str, Any]:
    """Execute one registered LangChain tool against the current state."""
    if tool_name == "document_type_tool":
        return document_type_tool.invoke({"file_path": state["file_path"]})
    if tool_name == "ocr_tool":
        return ocr_tool.invoke({"file_path": state["file_path"]})
    if tool_name == "qr_tool":
        return qr_tool.invoke({"file_path": state["file_path"]})
    if tool_name == "duplicate_check_tool":
        return duplicate_check_tool.invoke(
            {
                "file_path": state["file_path"],
                "extracted_text": state.get("extracted_text", ""),
                "extracted_fields": state.get("extracted_fields", {}),
            }
        )
    if tool_name == "rule_check_tool":
        return rule_check_tool.invoke(
            {
                "claimed_category": state.get("claimed_category", ""),
                "claimed_points": state.get("claimed_points", 0),
                "extracted_text": state.get("extracted_text", ""),
                "extracted_fields": state.get("extracted_fields", {}),
            }
        )
    if tool_name == "issuer_verification_tool":
        return issuer_verification_tool.invoke({"state_snapshot": copy.deepcopy(state)})
    if tool_name == "risk_score_tool":
        return risk_score_tool.invoke({"state_snapshot": copy.deepcopy(state)})
    if tool_name == "decision_tool":
        return decision_tool.invoke({"state_snapshot": copy.deepcopy(state)})
    raise ValueError(f"Unknown tool: {tool_name}")
