# App structure guidance — use this as a checklist for files you will add

## backend/
- app.py                    # FastAPI app (routes, startup/shutdown hooks)
- api/routes.py             # API route definitions (e.g., /api/analyze)
- api/schemas.py            # Pydantic models
- core/config.py            # Loads env vars and app config
- services/watsonx_client.py# Wrapper for ModelInference
- services/prompt_builder.py# Prompt templates and helpers
- utils/chunking.py         # Document splitting utilities
- utils/sanitizer.py        # Text sanitization / PII redaction helpers
- tests/                    # Backend unit tests (pytest)
- requirements.txt          # Backend dependencies
- README.md                 # Backend-specific instructions

## frontend/
- package.json
- vite.config.js
- src/main.jsx
- src/App.jsx
- src/components/Editor.jsx
- src/components/ResultsCard.jsx
- src/services/api.js       # fetch wrapper for backend calls
- public/
- tests/                    # Frontend tests (Vitest / RTL)
