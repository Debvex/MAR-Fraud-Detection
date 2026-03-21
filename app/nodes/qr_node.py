"""Node that reads QR data when available."""

from app.services.qr_service import read_qr


def qr_node(state):
    """Scan the file for QR information."""
    result = read_qr(state["file_path"])
    return {
        "qr_found": result["found"],
        "qr_data": result["data"],
        "logs": state.get("logs", []) + ["QR check completed"],
    }
