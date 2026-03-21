"""Convenience entry point for running the API or processing one file."""

from __future__ import annotations

import argparse
import json

import uvicorn

from app.services.workflow_service import process_submission


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the MAR fraud detection backend or process one file.")
    parser.add_argument("--serve", action="store_true", help="Start the FastAPI backend.")
    parser.add_argument("--host", default="127.0.0.1", help="Host for the API server.")
    parser.add_argument("--port", type=int, default=8000, help="Port for the API server.")
    parser.add_argument("--file-path", help="Optional file path to process directly without starting the API.")
    parser.add_argument("--student-id", default="IT2026001")
    parser.add_argument("--student-name", default="Debmalya Sett")
    parser.add_argument("--claimed-category", default="workshop")
    parser.add_argument("--claimed-points", type=int, default=10)
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.serve:
        uvicorn.run("backend.main:app", host=args.host, port=args.port, reload=False)
        return

    if not args.file_path:
        raise SystemExit("Provide --serve to run the API or --file-path to process a file.")

    record = process_submission(
        file_path=args.file_path,
        student_id=args.student_id,
        student_name=args.student_name,
        claimed_category=args.claimed_category,
        claimed_points=args.claimed_points,
    )
    print(json.dumps(record["state"], indent=2, default=str))


if __name__ == "__main__":
    main()
