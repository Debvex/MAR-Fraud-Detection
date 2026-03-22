"""Final node that generates explanation and closes the workflow."""

from app.services.llm_service import generate_explanation


def final_node(state):
    """Create the final explanation and finish the workflow."""
    explanation = generate_explanation(state)
    return {
        "explanation": explanation,
        "current_step": "completed",
        "logs": state.get("logs", []) + ["Explanation generated", "Workflow finished"],
    }
