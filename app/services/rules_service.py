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
    """Validate MAR rules through OpenAI using the rule file as context."""
    rules = _load_rules()
    llm_review = review_rule_validation(
        claimed_category=claimed_category,
        claimed_points=claimed_points,
        extracted_text=extracted_text,
        extracted_fields=extracted_fields,
        rules_context=rules,
    )

    return {
        "rule_valid": llm_review["rule_valid"],
        "reasons": llm_review.get("reasons", []),
        "llm_review": llm_review,
    }
