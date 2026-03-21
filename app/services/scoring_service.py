"""Risk scoring service."""


def calculate_risk_score(state):
    """Apply the basic rule-based scoring from the README."""
    score = 0

    if not state.get("is_certificate", False):
        score += 40

    if not state.get("qr_found", False):
        score += 10

    if state.get("duplicate_found", False):
        score += 30

    if not state.get("rule_valid", True):
        score += 25

    if state.get("ocr_confidence", 1.0) < 0.50:
        score += 10

    extracted_name = (state.get("extracted_fields", {}) or {}).get("name")
    student_name = state.get("student_name")
    if student_name and extracted_name and student_name.lower() != extracted_name.lower():
        score += 20

    suspicious = score >= 50
    return {
        "risk_score": score,
        "suspicious": suspicious,
    }
