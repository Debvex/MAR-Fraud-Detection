"""MAR rules validation service."""

from __future__ import annotations

import json

from app.config import RULES_PATH
from app.services.llm_service import review_rule_validation


def _load_rules():
    """Load the simple category rules from JSON."""
    with RULES_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def validate_rules(claimed_category, claimed_points, extracted_text, extracted_fields):
    """Validate basic category, points, and required field rules."""
    rules = _load_rules()
    category_key = (claimed_category or "").strip().lower()
    text = (extracted_text or "").lower()
    reasons = []
    rule_valid = True

    if claimed_points <= 0:
        rule_valid = False
        reasons.append("Claimed points must be greater than zero.")

    if not (extracted_text or "").strip():
        rule_valid = False
        reasons.append("No OCR text extracted from the file.")

    category_rule = rules.get("categories", {}).get(category_key)
    if category_rule is None:
        rule_valid = False
        reasons.append("Claimed category is not defined in MAR rules.")
    else:
        if claimed_points > category_rule["max_points"]:
            rule_valid = False
            reasons.append("Claimed points exceed the allowed maximum for the category.")

        keywords = category_rule.get("keywords", [])
        if keywords and not any(keyword in text for keyword in keywords):
            rule_valid = False
            reasons.append("Certificate text does not strongly match the claimed category.")

    if not extracted_fields.get("date"):
        rule_valid = False
        reasons.append("Certificate date could not be extracted.")

    llm_review = review_rule_validation(
        claimed_category=claimed_category,
        claimed_points=claimed_points,
        extracted_text=extracted_text,
        extracted_fields=extracted_fields,
        heuristic_rule_valid=rule_valid,
        heuristic_reasons=reasons,
    )
    final_rule_valid = rule_valid and llm_review["rule_valid"]
    final_reasons = reasons.copy()
    for reason in llm_review.get("reasons", []):
        if reason not in final_reasons:
            final_reasons.append(reason)

    return {
        "rule_valid": final_rule_valid,
        "reasons": final_reasons,
        "heuristic_rule_valid": rule_valid,
        "llm_review": llm_review,
    }
