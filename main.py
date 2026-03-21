"""Command-line entry point for testing the full workflow on any file."""

from __future__ import annotations

import argparse
import os
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



from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import jwt
from jwt import InvalidTokenError
from pydantic import BaseModel

from backend.database import supabase

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def greet():
    return {
        "message": "Hello, World"
    }


security = HTTPBearer()

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITHM = "HS256"

if not SUPABASE_JWT_SECRET:
    raise ValueError("SUPABASE_JWT_SECRET must be set in .env")


# ✅ Request schema
class SignupRequest(BaseModel):
    email: str
    password: str
    name: str


class LoginRequest(BaseModel):
    email: str
    password: str


class DashboardResponse(BaseModel):
    total_submissions: int
    flagged_submissions: int
    valid_submissions: int
    pending_review: int
    average_risk_score: float


# 🔐 Signup
@app.post("/signup")
async def signup(data: SignupRequest):
    response = supabase.auth.sign_up({
        "email": data.email,
        "password": data.password,
        "options": {
            "data": {
                "name": data.name
            }
        }
    })

    if response.user is None:
        raise HTTPException(status_code=400, detail=str(response))

    return {
        "message": "User created successfully",
        "user": response.user
    }


# 🔓 Login
@app.post("/login")
async def login(data: LoginRequest):
    response = supabase.auth.sign_in_with_password({
        "email": data.email,
        "password": data.password
    })

    if response.session is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "access_token": response.session.access_token,
        "refresh_token": response.session.refresh_token
    }


# 🛡️ Protected route dependency
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    print("CREDENTIALS:", credentials)
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing token")

    token = credentials.credentials
    print("TOKEN:", token)

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=[ALGORITHM]
        )
        print("PAYLOAD:", payload)
        return payload

    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )


@app.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    current_user: dict = Depends(get_current_user)
):
    del current_user  # Auth guard only; no per-user filtering yet.

    table_name = os.getenv("DASHBOARD_TABLE", "submissions")

    try:
        response = (
            supabase
            .table(table_name)
            .select("decision,review_status,risk_score")
            .limit(1000)
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load dashboard data from table '{table_name}': {exc}",
        )

    rows = response.data or []
    total_submissions = len(rows)

    flagged_submissions = sum(
        1
        for row in rows
        if row.get("decision") == "admin_review"
        or row.get("review_status") == "admin_review_required"
    )
    valid_submissions = sum(1 for row in rows if row.get("decision") == "likely_valid")
    pending_review = sum(
        1
        for row in rows
        if "pending" in str(row.get("review_status") or "").lower()
    )

    risk_values = []
    for row in rows:
        value = row.get("risk_score")
        if value is None:
            continue
        try:
            risk_values.append(float(value))
        except (TypeError, ValueError):
            continue

    average_risk_score = round(sum(risk_values) / len(risk_values), 2) if risk_values else 0.0

    return DashboardResponse(
        total_submissions=total_submissions,
        flagged_submissions=flagged_submissions,
        valid_submissions=valid_submissions,
        pending_review=pending_review,
        average_risk_score=average_risk_score,
    )





if __name__ == "__main__":
    main()
