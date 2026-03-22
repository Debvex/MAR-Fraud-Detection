"""Graph builder for the MAR certificate fraud workflow."""

from langgraph.graph import END, StateGraph

from app.nodes.final_node import final_node
from app.nodes.review_node import review_node
from app.nodes.start_node import start_node
from app.nodes.tool_runner_node import tool_runner_node
from app.nodes.verification_agent_node import verification_agent_node
from app.state import GraphState


def build_graph():
    """Create and compile a simple agent-plus-tools verification graph."""
    builder = StateGraph(GraphState)

    builder.add_node("start_node", start_node)
    builder.add_node("verification_agent_node", verification_agent_node)
    builder.add_node("tool_runner_node", tool_runner_node)
    builder.add_node("review_node", review_node)
    builder.add_node("final_node", final_node)

    builder.set_entry_point("start_node")

    builder.add_edge("start_node", "verification_agent_node")

    def route_from_planner(state: GraphState) -> str:
        if state.get("decision"):
            return "review_node"
        return "tool_runner_node"

    builder.add_conditional_edges(
        "verification_agent_node",
        route_from_planner,
        {
            "tool_runner_node": "tool_runner_node",
            "review_node": "review_node",
        },
    )

    builder.add_edge("tool_runner_node", "verification_agent_node")
    builder.add_edge("review_node", "final_node")
    builder.add_edge("final_node", END)

    return builder.compile()
