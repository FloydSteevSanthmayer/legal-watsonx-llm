# Detailed Flowchart — Technical Review

This document expands on the flowchart and provides a step-by-step explanation of the system components, expected behaviors, and implementation considerations.

## Overview
The Legal Document Analyzer accepts text input via a web frontend, sends it to a FastAPI backend endpoint (`POST /api/analyze`), validates and preprocesses the input, constructs a prompt, and forwards it to an LLM hosted via IBM WatsonX. The model returns generated text which the backend post-processes and returns to the frontend as JSON.

## Step-by-step

1. **Frontend (React / Vite)**
   - User pastes or uploads a legal document. The UI should provide a clear textarea or file upload and show token/length warnings.
   - The frontend calls the backend API: `POST /api/analyze` with payload:
     ```json
     { "documentText": "..." }
     ```

2. **API Client (FastAPI) receives request**
   - Endpoint: `/api/analyze`
   - Request is validated with Pydantic schema: `DocumentPayload(documentText: str)`.

3. **Validation**
   - Ensure `documentText` is non-empty.
   - Optionally check maximum allowed length; if too large, return `413 Payload Too Large` or apply chunking.
   - Reject malformed requests with `400 Bad Request`.

4. **Preprocess & Prompt Construction**
   - Normalize whitespace, remove non-printables.
   - Optionally redact personally identifiable information (PII) if required.
   - Build a structured prompt instructing the model to:
     - Identify clauses (e.g., termination, indemnity)
     - Highlight potential risks
     - Summarize obligations for each party
   - If the document is large, split into chunks and summarize each chunk first.

5. **Send to WatsonX (ModelInference)**
   - Use IBM WatsonX SDK `ModelInference` with `model_id=meta-llama/llama-3-2-1b-instruct` (or configured model).
   - Configure generation params (temperature, max tokens).
   - Add sensible timeouts and retry/backoff logic.

6. **Receive and Parse Model Output**
   - Expect a JSON-like SDK response; extract the generated text carefully, with fallback parsing.
   - Sanitize output (strip control characters).
   - Optionally, convert to structured JSON with keys: `clauses`, `risks`, `obligations`.

7. **Return to Frontend**
   - Return a compact JSON payload:
     ```json
     {
       "analysis": "Full text or structured result",
       "summary": "...",
       "clauses": [...]
     }
     ```
   - Use HTTP 200 on success; appropriate 4xx/5xx codes on failure.

8. **Frontend Display**
   - Show the summary and allow expansion to view clause-level detail.
   - Provide an option to download the analysis as PDF or TXT.

## Security & Operational Notes
- Keep `WATSONX_API_KEY` and other secrets out of source control. Use `.env` or a secrets manager.
- Enforce CORS properly (only allow trusted origins).
- Add authentication & rate-limiting for public endpoints.
- Log requests & errors; do not log secrets or PII.

## Testing Recommendations
- Unit test validation and prompt construction.
- Integration test with a mock WatsonX client.
- End-to-end test: sample small and large documents.
