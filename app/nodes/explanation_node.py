"""Node that creates a readable explanation of the workflow result."""

from app.services.llm_service import generate_explanation


def explanation_node(state):
    """Generate an admin-friendly explanation."""
    explanation = generate_explanation(state)
    return {
        "explanation": explanation,
        "logs": state.get("logs", []) + ["Explanation generated"],
    }
