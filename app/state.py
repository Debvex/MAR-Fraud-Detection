"""Typed shared state used by the LangGraph workflow."""

from typing import Any, Dict, List, Optional, TypedDict


class GraphState(TypedDict, total=False):
    """State object passed between all workflow nodes."""

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
    logs: List[str]
