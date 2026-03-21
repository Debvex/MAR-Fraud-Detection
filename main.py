"""Command-line entry point for testing the full workflow on any file."""

from __future__ import annotations

import argparse
from pathlib import Path

from app.graph import build_graph


def build_parser() -> argparse.ArgumentParser:
    """Create a simple CLI for testing different files."""
    parser = argparse.ArgumentParser(
        description="Run the MAR certificate fraud detection workflow on one file."
    )
    parser.add_argument(
        "file_path",
        nargs="?",
        default="sample_certificate.pdf",
        help="Path to the certificate file to test. Defaults to sample_certificate.pdf.",
    )
    parser.add_argument(
        "--student-id",
        default="IT2026001",
        help="Student ID used during rule and explanation checks.",
    )
    parser.add_argument(
        "--student-name",
        default="Debmalya Sett",
        help="Student name used for name mismatch checks.",
    )
    parser.add_argument(
        "--claimed-category",
        default="workshop",
        help="Claimed MAR category for the submission.",
    )
    parser.add_argument(
        "--claimed-points",
        type=int,
        default=10,
        help="Claimed MAR points for the submission.",
    )
    return parser


def build_initial_state(args: argparse.Namespace) -> dict:
    """Convert CLI arguments into the graph input state."""
    file_path = Path(args.file_path)
    return {
        "file_path": str(file_path),
        "file_name": file_path.name,
        "student_id": args.student_id,
        "student_name": args.student_name,
        "claimed_category": args.claimed_category,
        "claimed_points": args.claimed_points,
        "logs": [],
    }


def print_result(result: dict) -> None:
    """Render the workflow result in a readable format."""
    print("\n=== FINAL RESULT ===")
    print(f"Decision: {result.get('decision')}")
    print(f"Review Status: {result.get('review_status')}")
    print(f"Risk Score: {result.get('risk_score')}")
    print(f"Document Type Confidence: {result.get('document_type_confidence')}")
    print(f"OCR Confidence: {result.get('ocr_confidence')}")
    print(f"QR Found: {result.get('qr_found')}")
    print(f"Duplicate Found: {result.get('duplicate_found')}")
    print(f"Rule Valid: {result.get('rule_valid')}")
    print(f"Explanation: {result.get('explanation')}")
    print("\nExtracted Fields:")
    for key, value in (result.get("extracted_fields") or {}).items():
        print(f"- {key}: {value}")
    print("\nLogs:")
    for log in result.get("logs", []):
        print(f"- {log}")


def main() -> None:
    """Run the graph on the provided file."""
    parser = build_parser()
    args = parser.parse_args()

    graph = build_graph()
    initial_state = build_initial_state(args)
    result = graph.invoke(initial_state)
    print_result(result)


if __name__ == "__main__":
    main()
