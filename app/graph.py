"""Graph builder for the MAR certificate fraud workflow."""

from langgraph.graph import END, StateGraph

from app.nodes.admin_review_node import admin_review_node
from app.nodes.decision_node import decision_node
from app.nodes.document_type_node import document_type_node
from app.nodes.duplicate_check_node import duplicate_check_node
from app.nodes.end_node import end_node
from app.nodes.explanation_node import explanation_node
from app.nodes.mark_valid_node import mark_valid_node
from app.nodes.ocr_node import ocr_node
from app.nodes.qr_node import qr_node
from app.nodes.risk_score_node import risk_score_node
from app.nodes.rule_check_node import rule_check_node
from app.nodes.start_node import start_node
from app.state import GraphState


def build_graph():
    """Create and compile the sequential workflow from the README plan."""
    builder = StateGraph(GraphState)

    builder.add_node("start_node", start_node)
    builder.add_node("document_type_node", document_type_node)
    builder.add_node("ocr_node", ocr_node)
    builder.add_node("qr_node", qr_node)
    builder.add_node("duplicate_check_node", duplicate_check_node)
    builder.add_node("rule_check_node", rule_check_node)
    builder.add_node("risk_score_node", risk_score_node)
    builder.add_node("decision_node", decision_node)
    builder.add_node("admin_review_node", admin_review_node)
    builder.add_node("mark_valid_node", mark_valid_node)
    builder.add_node("explanation_node", explanation_node)
    builder.add_node("end_node", end_node)

    builder.set_entry_point("start_node")

    builder.add_edge("start_node", "document_type_node")
    builder.add_edge("document_type_node", "ocr_node")
    builder.add_edge("ocr_node", "qr_node")
    builder.add_edge("qr_node", "duplicate_check_node")
    builder.add_edge("duplicate_check_node", "rule_check_node")
    builder.add_edge("rule_check_node", "risk_score_node")
    builder.add_edge("risk_score_node", "decision_node")

    def route_decision(state: GraphState) -> str:
        return state.get("decision", "admin_review")

    builder.add_conditional_edges(
        "decision_node",
        route_decision,
        {
            "admin_review": "admin_review_node",
            "likely_valid": "mark_valid_node",
        },
    )

    builder.add_edge("admin_review_node", "explanation_node")
    builder.add_edge("mark_valid_node", "explanation_node")
    builder.add_edge("explanation_node", "end_node")
    builder.add_edge("end_node", END)

    return builder.compile()
