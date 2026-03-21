# MAR Certificate Fraud Detection with LangGraph

A beginner-friendly, modular project blueprint for building a **certificate verification and fake-certificate flagging system** for college MAR (Mandatory Additional Requirements / Activity points) workflows.

This project uses **LangGraph as the workflow orchestrator** and keeps each node implementation in its own Python file. It starts with a **sequential graph** and leaves **empty `frontend/` and `backend/` folders** so you can add React and FastAPI later.

---

## 1. Problem Statement

Many colleges ask students to upload certificates to claim MAR points. Because verification is often manual and time is limited, some students may upload:

- edited certificates,
- duplicated certificates,
- certificates belonging to someone else,
- wrong category claims,
- invalid MAR point claims.

This project solves that by building a pipeline that:

1. decides whether the uploaded file looks like a certificate,
2. extracts text from it,
3. reads any QR code,
4. checks duplication,
5. checks MAR rules,
6. computes a risk score,
7. routes suspicious cases to human review,
8. generates a clear explanation.

---

## 2. Final Workflow

```text
Start
  ↓
Document Type Check
(using LayoutLMv3-base fine-tuned for certificate vs non-certificate)
  ↓
OCR
  ↓
QR
  ↓
Duplicate Check
  ↓
Rule Check
  ↓
Risk Score
  ↓
Decision
  ↓
If suspicious → Admin Review
Else → Mark likely valid (Human in the Loop)
  ↓
Explanation
  ↓
End
```

---

## 3. Core Idea

LangGraph will **control the flow**.

Each node will call a **simple Python function** that does the real work.

So this project is **not** “LangGraph doing OCR.”
Instead, it is:

- **LangGraph** → workflow controller
- **LayoutLMv3-base** → document-type classifier
- **PaddleOCR** → text extraction
- **OpenCV + pyzbar** → QR decoding
- **imagehash** → duplicate detection
- **Python** → rule engine and risk scoring
- **LLM** → human-readable explanation

---

## 4. Recommended Tech Stack

## Workflow and AI orchestration
- **LangGraph**
- **LangChain**

## Document classifier
- **Hugging Face Transformers**
- **microsoft/layoutlmv3-base**

## OCR
- **PaddleOCR**

## QR reading
- **OpenCV**
- **pyzbar**

## Duplicate detection
- **imagehash**
- **Pillow**

## Rule engine and scoring
- **Pure Python**

## Explanation node
- **OpenAI API** with **GPT-4.1 mini**

Why this LLM choice?
- good for structured explanation generation,
- fast enough,
- easier for a beginner than building a local explanation model,
- simple API integration.

If you want a premium alternative, you can swap it with **Claude Sonnet 4.6** later.

## Data storage
For absolute beginner MVP:
- **SQLite** first

For later production upgrade:
- **PostgreSQL**

## Frontend and backend
- **frontend/** → empty for now
- **backend/** → empty for now

You will first build the graph as a Python application.
Then you can later wrap it with FastAPI and React.

---

## 5. Important Practical Note About LayoutLMv3

`layoutlmv3-base` is a **pretrained document model**, not a ready-made “certificate or not certificate” classifier.

That means you have two choices:

### Option A — recommended for hackathon MVP
Keep the node name as `document_type_check`, but initially implement it using a **simple heuristic** such as:
- OCR keywords like `certificate`, `awarded`, `completion`, `participation`,
- presence of name/date/issuer,
- document layout confidence.

Then later replace that logic with a **fine-tuned LayoutLMv3 model**.

### Option B — use LayoutLMv3 properly
Fine-tune `layoutlmv3-base` on a small binary dataset:
- class 0 = non-certificate
- class 1 = certificate

For a beginner, **Option A first, Option B later** is the easiest path.

Still, this README keeps the architecture ready for **LayoutLMv3-based classification**.

---

## 6. Beginner-Friendly Project Structure

```text
mar-fraud-detector/
│
├── README.md
├── requirements.txt
├── .env.example
├── main.py
├── frontend/
├── backend/
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── state.py
│   ├── graph.py
│   │
│   ├── nodes/
│   │   ├── __init__.py
│   │   ├── start_node.py
│   │   ├── document_type_node.py
│   │   ├── ocr_node.py
│   │   ├── qr_node.py
│   │   ├── duplicate_check_node.py
│   │   ├── rule_check_node.py
│   │   ├── risk_score_node.py
│   │   ├── decision_node.py
│   │   ├── admin_review_node.py
│   │   ├── mark_valid_node.py
│   │   ├── explanation_node.py
│   │   └── end_node.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── layoutlm_service.py
│   │   ├── ocr_service.py
│   │   ├── qr_service.py
│   │   ├── duplicate_service.py
│   │   ├── rules_service.py
│   │   ├── scoring_service.py
│   │   └── llm_service.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── file_utils.py
│   │   ├── image_utils.py
│   │   ├── text_utils.py
│   │   └── logger.py
│   │
│   └── data/
│       ├── uploads/
│       ├── processed/
│       ├── hashes/
│       └── mar_rules.json
│
└── notebooks/
    └── layoutlmv3_experiments.ipynb
```

---

## 7. What Each Folder Is For

## `frontend/`
Keep empty for now. Later this will contain:
- React upload page
- admin dashboard
- flagged submissions list

## `backend/`
Keep empty for now. Later this will contain:
- FastAPI routes
- file upload endpoint
- admin approval/rejection endpoint

## `app/nodes/`
Each LangGraph node gets **one script file**.

## `app/services/`
Each file contains the **real action logic** behind a node.

Example:
- `ocr_node.py` calls `ocr_service.py`
- `qr_node.py` calls `qr_service.py`

This keeps your code clean.

---

## 8. LangGraph State Design

All nodes will read and write to one shared state.

Create `app/state.py`:

```python
from typing import TypedDict, Optional, Dict, Any, List

class GraphState(TypedDict, total=False):
    file_path: str
    file_name: str
    student_id: str
    student_name: str
    claimed_category: str
    claimed_points: int

    is_certificate: bool
    document_type_confidence: float

    extracted_text: str
    extracted_fields: Dict[str, Any]
    ocr_confidence: float

    qr_found: bool
    qr_data: Optional[str]

    duplicate_found: bool
    duplicate_score: float
    duplicate_matches: List[Dict[str, Any]]

    rule_valid: bool
    rule_result: Dict[str, Any]

    risk_score: float
    suspicious: bool
    decision: str

    review_status: str
    explanation: str
    logs: List[str]
```

---

## 9. Node-by-Node Responsibility

## 9.1 `start_node.py`
Purpose:
- initialize the graph,
- confirm file exists,
- write initial logs.

Output:
- `logs`
- `file_path`

---

## 9.2 `document_type_node.py`
Purpose:
- decide whether the uploaded document is a certificate or not.

Simple MVP implementation:
- run lightweight OCR,
- search for certificate-like keywords,
- optionally plug in LayoutLMv3 later.

Target output:
- `is_certificate`
- `document_type_confidence`

If `False`, the pipeline can still continue and produce a very high risk score, or stop early depending on your design.

---

## 9.3 `ocr_node.py`
Purpose:
- extract text from the certificate.

Use:
- PaddleOCR

Extract:
- full text,
- probable student name,
- issuer,
- date,
- course/event title,
- certificate ID.

Output:
- `extracted_text`
- `extracted_fields`
- `ocr_confidence`

---

## 9.4 `qr_node.py`
Purpose:
- detect and decode QR code.

Use:
- OpenCV
- pyzbar

Output:
- `qr_found`
- `qr_data`

---

## 9.5 `duplicate_check_node.py`
Purpose:
- detect if the same or similar certificate was already submitted.

Simple implementation:
- perceptual hash using `imagehash`,
- compare OCR text similarity,
- compare certificate IDs.

Output:
- `duplicate_found`
- `duplicate_score`
- `duplicate_matches`

---

## 9.6 `rule_check_node.py`
Purpose:
- validate the student’s MAR claim.

Checks:
- claimed category matches extracted content,
- claimed points match your MAR rules,
- certificate date exists,
- mandatory fields exist,
- claimed points are not unrealistic.

Output:
- `rule_valid`
- `rule_result`

---

## 9.7 `risk_score_node.py`
Purpose:
- combine all previous checks into one fraud risk score.

Example scoring:
- not a certificate → +40
- QR missing → +10
- duplicate found → +30
- rules invalid → +25
- student name mismatch → +20
- OCR too weak → +10

Output:
- `risk_score`
- `suspicious`

---

## 9.8 `decision_node.py`
Purpose:
- decide next route.

Example:
- `risk_score >= 50` → suspicious
- `risk_score < 50` → likely valid

Output:
- `decision`

---

## 9.9 `admin_review_node.py`
Purpose:
- mark suspicious cases as needing review.

Output:
- `review_status = "admin_review_required"`

---

## 9.10 `mark_valid_node.py`
Purpose:
- mark low-risk cases as likely valid.

Important:
This is still **human in the loop**, not blind auto-approval.

Output:
- `review_status = "likely_valid_pending_human_confirmation"`

---

## 9.11 `explanation_node.py`
Purpose:
- generate a simple human-readable explanation.

Examples:
- “This file was flagged because no certificate-like structure was detected, the QR code was missing, and the claimed MAR category did not match the extracted text.”
- “This file appears likely valid because the document looked like a certificate, OCR extracted the expected fields, and no duplicate or rules conflict was found.”

This is where the LLM is useful.

---

## 9.12 `end_node.py`
Purpose:
- finalize the output,
- print final result,
- save report if needed.

---

## 10. Simplest LangGraph Routing Design

Your first version should stay mostly sequential.

```text
START
  ↓
start_node
  ↓
document_type_node
  ↓
ocr_node
  ↓
qr_node
  ↓
duplicate_check_node
  ↓
rule_check_node
  ↓
risk_score_node
  ↓
decision_node
   ├── suspicious → admin_review_node
   └── likely_valid → mark_valid_node
                ↓
         explanation_node
                ↓
             end_node
```

---

## 11. Recommended `graph.py`

Create `app/graph.py` like this:

```python
from langgraph.graph import StateGraph, END
from app.state import GraphState

from app.nodes.start_node import start_node
from app.nodes.document_type_node import document_type_node
from app.nodes.ocr_node import ocr_node
from app.nodes.qr_node import qr_node
from app.nodes.duplicate_check_node import duplicate_check_node
from app.nodes.rule_check_node import rule_check_node
from app.nodes.risk_score_node import risk_score_node
from app.nodes.decision_node import decision_node
from app.nodes.admin_review_node import admin_review_node
from app.nodes.mark_valid_node import mark_valid_node
from app.nodes.explanation_node import explanation_node
from app.nodes.end_node import end_node


def build_graph():
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

    def route_decision(state: GraphState):
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
```

---

## 12. Example Minimal Node Implementations

## `app/nodes/start_node.py`

```python
import os


def start_node(state):
    file_path = state["file_path"]
    logs = state.get("logs", [])

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    logs.append(f"Start node: file exists at {file_path}")
    return {"logs": logs}
```

## `app/nodes/document_type_node.py`

```python
from app.services.layoutlm_service import detect_document_type


def document_type_node(state):
    result = detect_document_type(state["file_path"])
    return {
        "is_certificate": result["is_certificate"],
        "document_type_confidence": result["confidence"],
        "logs": state.get("logs", []) + ["Document type checked"],
    }
```

## `app/nodes/ocr_node.py`

```python
from app.services.ocr_service import run_ocr


def ocr_node(state):
    result = run_ocr(state["file_path"])
    return {
        "extracted_text": result["text"],
        "extracted_fields": result["fields"],
        "ocr_confidence": result["confidence"],
        "logs": state.get("logs", []) + ["OCR completed"],
    }
```

## `app/nodes/qr_node.py`

```python
from app.services.qr_service import read_qr


def qr_node(state):
    result = read_qr(state["file_path"])
    return {
        "qr_found": result["found"],
        "qr_data": result["data"],
        "logs": state.get("logs", []) + ["QR check completed"],
    }
```

## `app/nodes/duplicate_check_node.py`

```python
from app.services.duplicate_service import check_duplicate


def duplicate_check_node(state):
    result = check_duplicate(
        file_path=state["file_path"],
        extracted_text=state.get("extracted_text", ""),
        extracted_fields=state.get("extracted_fields", {}),
    )
    return {
        "duplicate_found": result["duplicate_found"],
        "duplicate_score": result["duplicate_score"],
        "duplicate_matches": result["matches"],
        "logs": state.get("logs", []) + ["Duplicate check completed"],
    }
```

## `app/nodes/rule_check_node.py`

```python
from app.services.rules_service import validate_rules


def rule_check_node(state):
    result = validate_rules(
        claimed_category=state.get("claimed_category", ""),
        claimed_points=state.get("claimed_points", 0),
        extracted_text=state.get("extracted_text", ""),
        extracted_fields=state.get("extracted_fields", {}),
    )
    return {
        "rule_valid": result["rule_valid"],
        "rule_result": result,
        "logs": state.get("logs", []) + ["Rule check completed"],
    }
```

## `app/nodes/risk_score_node.py`

```python
from app.services.scoring_service import calculate_risk_score


def risk_score_node(state):
    result = calculate_risk_score(state)
    return {
        "risk_score": result["risk_score"],
        "suspicious": result["suspicious"],
        "logs": state.get("logs", []) + ["Risk score calculated"],
    }
```

## `app/nodes/decision_node.py`

```python

def decision_node(state):
    decision = "admin_review" if state.get("suspicious", False) else "likely_valid"
    return {
        "decision": decision,
        "logs": state.get("logs", []) + [f"Decision made: {decision}"],
    }
```

## `app/nodes/admin_review_node.py`

```python

def admin_review_node(state):
    return {
        "review_status": "admin_review_required",
        "logs": state.get("logs", []) + ["Marked for admin review"],
    }
```

## `app/nodes/mark_valid_node.py`

```python

def mark_valid_node(state):
    return {
        "review_status": "likely_valid_pending_human_confirmation",
        "logs": state.get("logs", []) + ["Marked as likely valid"],
    }
```

## `app/nodes/explanation_node.py`

```python
from app.services.llm_service import generate_explanation


def explanation_node(state):
    explanation = generate_explanation(state)
    return {
        "explanation": explanation,
        "logs": state.get("logs", []) + ["Explanation generated"],
    }
```

## `app/nodes/end_node.py`

```python

def end_node(state):
    return {
        "logs": state.get("logs", []) + ["Workflow finished"]
    }
```

---

## 13. Example Simple Service Implementations

These are intentionally basic so you can build fast.

## `app/services/layoutlm_service.py`

```python
# Beginner MVP version.
# First use heuristics. Later replace with real LayoutLMv3 inference.

from app.services.ocr_service import run_ocr

CERTIFICATE_KEYWORDS = [
    "certificate",
    "completion",
    "participation",
    "awarded",
    "successfully completed",
]


def detect_document_type(file_path: str):
    ocr_result = run_ocr(file_path)
    text = ocr_result["text"].lower()

    hits = sum(1 for kw in CERTIFICATE_KEYWORDS if kw in text)
    confidence = min(1.0, 0.2 * hits + 0.2)

    return {
        "is_certificate": hits >= 2,
        "confidence": confidence,
    }
```

## `app/services/ocr_service.py`

```python
from paddleocr import PaddleOCR

ocr = PaddleOCR(use_angle_cls=True, lang='en')


def run_ocr(file_path: str):
    result = ocr.ocr(file_path, cls=True)

    texts = []
    confidences = []
    for line_group in result:
        for line in line_group:
            text, conf = line[1][0], line[1][1]
            texts.append(text)
            confidences.append(conf)

    full_text = "\n".join(texts)
    avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

    fields = {
        "name": None,
        "issuer": None,
        "date": None,
        "certificate_id": None,
    }

    return {
        "text": full_text,
        "fields": fields,
        "confidence": avg_conf,
    }
```

## `app/services/qr_service.py`

```python
import cv2
from pyzbar.pyzbar import decode


def read_qr(file_path: str):
    image = cv2.imread(file_path)
    if image is None:
        return {"found": False, "data": None}

    decoded = decode(image)
    if not decoded:
        return {"found": False, "data": None}

    data = decoded[0].data.decode("utf-8")
    return {"found": True, "data": data}
```

## `app/services/duplicate_service.py`

```python
from PIL import Image
import imagehash
import os
import json

HASH_DB_PATH = "app/data/hashes/hash_store.json"


def _load_hash_db():
    if not os.path.exists(HASH_DB_PATH):
        return []
    with open(HASH_DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def _save_hash_db(data):
    os.makedirs(os.path.dirname(HASH_DB_PATH), exist_ok=True)
    with open(HASH_DB_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def check_duplicate(file_path: str, extracted_text: str, extracted_fields: dict):
    image = Image.open(file_path)
    current_hash = str(imagehash.phash(image))

    db = _load_hash_db()
    matches = []

    for item in db:
        if item["hash"] == current_hash:
            matches.append(item)

    db.append({
        "file_path": file_path,
        "hash": current_hash,
        "certificate_id": extracted_fields.get("certificate_id"),
    })
    _save_hash_db(db)

    return {
        "duplicate_found": len(matches) > 0,
        "duplicate_score": 1.0 if matches else 0.0,
        "matches": matches,
    }
```

## `app/services/rules_service.py`

```python

def validate_rules(claimed_category, claimed_points, extracted_text, extracted_fields):
    text = extracted_text.lower()
    reasons = []
    rule_valid = True

    if claimed_category.lower() == "mooc":
        if "course" not in text and "completed" not in text:
            rule_valid = False
            reasons.append("Claimed MOOC, but certificate text does not strongly indicate a completed course.")

    if claimed_points <= 0:
        rule_valid = False
        reasons.append("Claimed points must be greater than zero.")

    if not extracted_text.strip():
        rule_valid = False
        reasons.append("No OCR text extracted from the file.")

    return {
        "rule_valid": rule_valid,
        "reasons": reasons,
    }
```

## `app/services/scoring_service.py`

```python

def calculate_risk_score(state):
    score = 0

    if not state.get("is_certificate", False):
        score += 40

    if not state.get("qr_found", False):
        score += 10

    if state.get("duplicate_found", False):
        score += 30

    if not state.get("rule_valid", True):
        score += 25

    if state.get("ocr_confidence", 1.0) < 0.50:
        score += 10

    suspicious = score >= 50

    return {
        "risk_score": score,
        "suspicious": suspicious,
    }
```

## `app/services/llm_service.py`

```python
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_explanation(state):
    prompt = f"""
    You are explaining the result of a certificate verification workflow.
    Return a short, clear explanation for an admin.

    State:
    - is_certificate: {state.get('is_certificate')}
    - qr_found: {state.get('qr_found')}
    - duplicate_found: {state.get('duplicate_found')}
    - rule_valid: {state.get('rule_valid')}
    - risk_score: {state.get('risk_score')}
    - decision: {state.get('decision')}
    - review_status: {state.get('review_status')}
    - rule_result: {state.get('rule_result')}
    """

    response = client.responses.create(
        model="gpt-4.1-mini",
        input=prompt,
    )

    return response.output_text
```

---

## 14. `main.py` Example

```python
from app.graph import build_graph


def main():
    graph = build_graph()

    initial_state = {
        "file_path": "sample_certificate.png",
        "file_name": "sample_certificate.png",
        "student_id": "IT2026001",
        "student_name": "Student Name",
        "claimed_category": "MOOC",
        "claimed_points": 10,
        "logs": [],
    }

    result = graph.invoke(initial_state)

    print("\n=== FINAL RESULT ===")
    print(f"Decision: {result.get('decision')}")
    print(f"Review Status: {result.get('review_status')}")
    print(f"Risk Score: {result.get('risk_score')}")
    print(f"Explanation: {result.get('explanation')}")
    print("\nLogs:")
    for log in result.get("logs", []):
        print(f"- {log}")


if __name__ == "__main__":
    main()
```

---

## 15. `requirements.txt` Example

```txt
langgraph
langchain
openai
transformers
torch
torchvision
paddleocr
paddlepaddle
opencv-python
pyzbar
pillow
imagehash
python-dotenv
pydantic
```

---

## 16. `.env.example`

```env
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 17. Setup Instructions

## Step 1 — create project folder

```bash
mkdir mar-fraud-detector
cd mar-fraud-detector
```

## Step 2 — create virtual environment

```bash
python -m venv .venv
```

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

## Step 3 — install dependencies

```bash
pip install -r requirements.txt
```

## Step 4 — create folders and files

Create the folder structure shown above.

## Step 5 — add your `.env`

```bash
copy .env.example .env
```

Then add your real OpenAI API key.

## Step 6 — put a test certificate image in the project root

Example:
- `sample_certificate.png`

## Step 7 — run the project

```bash
python main.py
```

---

## 18. What To Build First

Do not try to do everything at once.

## Phase 1 — minimum working prototype
Build only:
- `start_node`
- `document_type_node`
- `ocr_node`
- `rule_check_node`
- `risk_score_node`
- `decision_node`
- `explanation_node`

Ignore QR and duplicate check initially if needed.

## Phase 2 — stronger demo
Add:
- QR detection
- duplicate hash check
- human review route

## Phase 3 — better intelligence
Add:
- real LayoutLMv3 fine-tuning
- regex field extraction
- certificate ID matching
- admin dashboard
- FastAPI upload endpoint
- React UI

---

## 19. How To Upgrade From Heuristic to Real LayoutLMv3

When you are ready:

1. create a dataset of document images,
2. label them as:
   - `certificate`
   - `non_certificate`
3. fine-tune `layoutlmv3-base` for sequence/document classification,
4. replace the heuristic in `layoutlm_service.py` with actual model inference.

Until then, keeping the node interface the same is enough.

---

## 20. What “Human in the Loop” Means Here

This project should **not** directly punish a student.

Instead:
- if suspicious → send to admin review,
- if likely valid → still keep it pending human confirmation.

This is safer, fairer, and more realistic for a college workflow.

---

## 21. Example Final Output

```json
{
  "decision": "admin_review",
  "review_status": "admin_review_required",
  "risk_score": 65,
  "explanation": "The document was flagged because it did not strongly look like a certificate, no QR code was found, and the claimed MAR category did not match the extracted text.",
  "rule_result": {
    "rule_valid": false,
    "reasons": [
      "Claimed MOOC, but certificate text does not strongly indicate a completed course."
    ]
  }
}
```

---

## 22. Suggested Future Extensions

After your first working version, you can add:

- FastAPI file upload endpoint,
- React admin dashboard,
- PostgreSQL database,
- certificate template matching,
- issuer whitelist,
- verification URL fetch check,
- name matching against student records,
- PDF metadata analysis,
- suspicious-region visualization,
- admin feedback loop for retraining.

---

## 23. Final Recommendation

For a beginner, the best path is:

1. build the **sequential LangGraph flow first**,
2. keep one file per node,
3. keep one file per service,
4. use **simple implementations first**,
5. upgrade each service later.

That way you get a working project early instead of getting stuck on the hardest parts.

---

## 24. Short Summary

This project gives you a beginner-friendly way to build:

- a **LangGraph-controlled certificate verification pipeline**,
- a **document-type check using a LayoutLMv3-ready interface**,
- OCR extraction,
- QR detection,
- duplicate detection,
- MAR rule validation,
- risk scoring,
- admin review routing,
- LLM-based explanation generation.

Start simple. Make it run end to end. Then improve one node at a time.
