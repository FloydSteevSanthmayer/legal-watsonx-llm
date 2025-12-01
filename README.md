# legal-watsonx-llm

**Legal Document Analyzer using IBM WatsonX (Llama-3)**

A production-ready example showing how to integrate a FastAPI backend with an IBM WatsonX LLM and a React/Vite frontend to analyze legal documents.  
The service extracts key clauses, highlights potential risks, and summarizes obligations for each party — with support for large-document chunking and secure credential handling.

---

## Included in this repository
- `backend/` — FastAPI backend (add your backend files here)
- `frontend/` — React / Vite frontend (add your frontend files here)
- `flowchart_colored.mmd` — Mermaid source for the architecture flowchart
- `flowchart_colored.png` — Rendered diagram image
- `FLOWCHART_DETAILED.md` — Detailed technical flow
- `APP_STRUCTURE.md` — Suggested app file structure and checklist
- `Dockerfile`, `requirements.txt`, `.env.example`, `.gitignore`
- CI & automation: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `.pre-commit-config.yaml`
- `tests/` — pytest scaffold
- `LICENSE` — MIT (author: Floyd Steev Santhmayer)
- `CONTRIBUTING.md` — contribution guide

---

## Quick start
1. Copy `.env.example` -> `.env` and fill in WatsonX credentials.
2. Backend:
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```
3. Frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Call the API:
   ```bash
   curl -X POST http://localhost:8000/api/analyze \
     -H "Content-Type: application/json" \
     -d '{"documentText":"Your contract text here"}'
   ```

---

## Support & Contributing
See `CONTRIBUTING.md` for contribution guidelines.
