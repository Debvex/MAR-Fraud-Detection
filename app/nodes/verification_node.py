"""Deprecated compatibility shim.

The active workflow now splits verification into:
- verification_agent_node
- tool_runner_node
"""


def verification_node(state):
    """Return the current state unchanged for compatibility only."""
    return state
