# legal-watsonx-llm

**Legal Document Analyzer — IBM WatsonX (Llama‑3) Integration**

---

## Overview

**legal-watsonx-llm** is a professional reference implementation for automated legal document analysis powered by IBM WatsonX (Llama‑3 family).  
This scaffold demonstrates a secure, testable, and production-minded architecture combining a FastAPI backend with a React/Vite frontend (frontend UI implemented using **lovable**). It focuses on delivering clear, auditable outputs: clause extraction, risk identification, and per‑party obligation summaries.

---

## Features

- **LLM-driven analysis:** Uses WatsonX ModelInference to generate concise legal analyses.
- **Structured output:** Returns summaries, clause lists, identified risks, and obligations.
- **Large-document handling:** Chunking and progressive summarization to respect token limits.
- **Secure configuration:** Environment-driven configuration; no secrets in source control.
- **Developer workflow:** Includes pytest scaffold, CI templates, and pre-commit hooks suggestions.
- **Container-ready:** Multi-stage Dockerfile for reproducible builds.

---

## Quick Start (Developer)

### Prerequisites
- Python 3.11+
- Node.js 18+ (frontend)
- Docker (optional)
- IBM WatsonX credentials: `WATSONX_URL`, `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`

### Backend (local)
```bash
# from project root
cd backend
python -m venv .venv
# macOS / Linux
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\activate
pip install -r ../requirements.txt

# copy env example and add credentials
cp ../.env.example .env

# run dev server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (local)
```bash
cd frontend
npm install
npm run dev
```

### Example API Request
```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{ "documentText": "Insert contract or legal text here" }'
```

---

## Architecture (Concise)

1. **Frontend (React + lovable)** — collects text input or files; calls backend API.
2. **Backend (FastAPI)** — validates input (Pydantic), preprocesses text, performs optional chunking, constructs LLM prompts, calls WatsonX ModelInference, postprocesses results, and returns structured JSON.
3. **WatsonX (LLM)** — generates the legal analysis based on the prompt.
4. **Infra & Ops** — `.env` for credentials (or secret manager), CORS config, logging, authentication, rate-limiting, and CI.

---

## Recommended File Structure (high-level)
```
/ (repo root)
├─ backend/
│  ├─ app.py
│  ├─ services/
│  │  └─ watsonx_client.py
│  └─ tests/
├─ frontend/
│  ├─ package.json
│  └─ src/
├─ flowchart_colored.mmd
├─ flowchart_colored.png
├─ Dockerfile
├─ requirements.txt
├─ .env.example
├─ .gitignore
├─ .github/
└─ README.md
```

---

## Security & Best Practices

- **Never commit secrets.** Use `.env` locally and a secrets manager in production.
- **Do not add `node_modules/` to source control.** Use `.gitignore`.
- **Add authentication & rate-limiting** before exposing endpoints publicly.
- **Log responsibly:** avoid persisting PII or secrets in logs.
- **Testing:** unit test prompt construction and parsing; integration test with mocked WatsonX.

---

## Contributing & License

- **Author / Maintainer:** Floyd Steev Santhmayer  
- **License:** MIT

Contributions are welcome. Please follow conventional commits, add tests for new behavior, and run pre-commit hooks locally.
