"""Typed shared state used by the LangGraph workflow."""

from typing import Any, Dict, List, Optional, TypedDict


class GraphState(TypedDict, total=False):
    """State object passed between all workflow nodes."""

    submission_id: str
    file_path: str
    file_name: str
    student_id: str
    student_name: str
    claimed_category: str
    claimed_points: int
    is_certificate: bool
    document_type_confidence: float
    extracted_text: str
    extracted_fields: Dict[str, Any]
    ocr_confidence: float
    qr_found: bool
    qr_data: Optional[str]
    duplicate_found: bool
    duplicate_score: float
    duplicate_matches: List[Dict[str, Any]]
    rule_valid: bool
    rule_result: Dict[str, Any]
    risk_score: float
    suspicious: bool
    decision: str
    review_status: str
    explanation: str
    alerts: List[Dict[str, Any]]
    decision_confidence: float
    processing_status: str
    llm_document_review: Dict[str, Any]
    llm_rule_review: Dict[str, Any]
    llm_decision_review: Dict[str, Any]
    issuer_adapter_name: str
    issuer_verified: bool
    issuer_verification_mode: str
    issuer_verification_result: Dict[str, Any]
    agent_plan: Dict[str, Any]
    tool_runs: List[Dict[str, Any]]
    available_tools: List[str]
    next_tool_name: str
    next_tool_reason: str
    verification_complete: bool
    current_step: str
    timeline: List[Dict[str, Any]]
    logs: List[str]
