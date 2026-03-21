# MAR Certificate Fraud Detection with LangGraph

This repository contains a working beginner-friendly prototype for checking MAR certificate submissions.

It uses a sequential **LangGraph** workflow and keeps the project simple:

- one file per node,
- one file per service,
- one shared graph state,
- one CLI entry point in `main.py`.

The current repository is no longer just a blueprint. It now contains a runnable implementation that can test the included sample certificate and other files afterward.

---

## 1. What The Project Does

The workflow processes one uploaded file and:

1. checks whether it looks like a certificate,
2. extracts text and basic fields,
3. checks for QR data,
4. checks for duplicates,
5. validates the MAR claim,
6. computes a risk score,
7. routes the case,
8. generates a short explanation.

This is an MVP focused on readability and working end to end.

---

## 2. Current Workflow

```text
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
   ├── admin_review → admin_review_node
   └── likely_valid → mark_valid_node
                    ↓
             explanation_node
                    ↓
                 end_node
```

Routing:

- `risk_score >= 50` → `admin_review`
- `risk_score < 50` → `likely_valid`

---

## 3. Current Implementation

### Document type detection
- implemented with OCR text and certificate-like keywords
- kept behind a service interface so a real LayoutLMv3 model can replace it later

### OCR
- `.pdf` files: tries direct text extraction with `pypdf`
- image files: uses `PaddleOCR` when available
- text files: reads text directly
- extracts a few basic fields using simple regex and line heuristics

### QR detection
- uses `OpenCV + pyzbar` when possible
- safely falls back to `qr_found = False` if decoding is unavailable

### Duplicate detection
- uses a local JSON store at `app/data/hashes/hash_store.json`
- stores a SHA-256 hash of each processed file

### Rule validation
- checks claimed category
- checks claimed points
- checks extracted text presence
- checks extracted date
- uses `app/data/mar_rules.json`

### Explanation
- uses the OpenAI API when available
- falls back to a local deterministic explanation if the API call cannot complete

### Human in the loop
- suspicious cases go to `admin_review_required`
- low-risk cases go to `likely_valid_pending_human_confirmation`

---

## 4. Project Structure

```text
MAR-Fraud-Detection/
├── .env.example
├── main.py
├── requirements.txt
├── sample_certificate.pdf
├── app/
│   ├── config.py
│   ├── graph.py
│   ├── state.py
│   ├── data/
│   │   ├── hashes/
│   │   │   └── hash_store.json
│   │   ├── mar_rules.json
│   │   ├── processed/
│   │   └── uploads/
│   ├── nodes/
│   ├── services/
│   └── utils/
├── backend/
├── frontend/
└── notebooks/
    └── layoutlmv3_experiments.ipynb
```

---

## 5. Important Files

### `main.py`
Runs the full workflow from the command line.

It:

- accepts a file path,
- accepts student and claim details,
- builds the initial graph state,
- runs the graph,
- prints the final result.

### `app/graph.py`
Builds and compiles the LangGraph workflow.

### `app/state.py`
Defines the shared `GraphState`.

### `app/services/ocr_service.py`
Handles PDF reading, OCR fallback, and field extraction preparation.

### `app/services/duplicate_service.py`
Checks and stores file hashes for duplicate detection.

### `app/services/rules_service.py`
Applies the simple MAR rule checks.

### `app/services/llm_service.py`
Generates the final explanation.

---

## 6. Setup

### Step 1: create a virtual environment

```powershell
py -3 -m venv .venv
```

### Step 2: activate it

```powershell
.venv\Scripts\activate
```

### Step 3: install dependencies

Using `pip`:

```powershell
pip install -r requirements.txt
```

Using `uv pip`:

```powershell
uv pip install --python .venv\Scripts\python.exe -r requirements.txt
```

### Step 4: configure `.env`

Create `.env` from `.env.example` and set:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

---

## 7. How To Run

Run the included sample certificate:

```powershell
.venv\Scripts\python.exe main.py
```

Current defaults in `main.py` are chosen to match the included sample:

- file: `sample_certificate.pdf`
- `student_id = IT2026001`
- `student_name = Debmalya Sett`
- `claimed_category = workshop`
- `claimed_points = 10`

---

## 8. Test Any File

You can test any file by passing the path as the first argument:

```powershell
.venv\Scripts\python.exe main.py "path\to\certificate.pdf"
```

You can also override the metadata:

```powershell
.venv\Scripts\python.exe main.py "path\to\certificate.pdf" --student-id IT2026001 --student-name "Student Name" --claimed-category workshop --claimed-points 10
```

Current practical input support:

- PDF files
- image files supported by PaddleOCR and OpenCV
- text files like `.txt` and `.md`

---

## 9. Example Output

```text
=== FINAL RESULT ===
Decision: likely_valid
Review Status: likely_valid_pending_human_confirmation
Risk Score: 10
Document Type Confidence: 0.6
OCR Confidence: 0.9
QR Found: False
Duplicate Found: False
Rule Valid: True
Explanation: This file was flagged because no QR code was detected.
```

The script also prints:

- extracted fields,
- workflow logs.

---

## 10. Current Limitations

This is still a simple MVP.

- document classification is heuristic
- duplicate detection is exact file-hash based
- field extraction uses basic regex and line heuristics
- QR detection depends on image readability
- scanned PDFs may need better OCR rendering later
- explanation generation may fall back locally if API access is blocked

---

## 11. Future Improvements

Good next upgrades are:

- replace heuristic document classification with real LayoutLMv3 inference
- improve scanned PDF handling
- improve issuer and certificate ID extraction
- add student record matching
- add FastAPI routes in `backend/`
- add a React admin interface in `frontend/`
- move duplicate tracking to a real database

---

## 12. Summary

This repository now contains a working LangGraph-based MAR certificate verification prototype with:

- certificate-type detection,
- OCR with PDF support,
- QR checking,
- duplicate detection,
- MAR rule validation,
- risk scoring,
- admin review routing,
- explanation generation,
- a CLI in `main.py` for testing any file.
