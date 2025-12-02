# Backend — legal-watsonx-llm

## Overview
The backend is a **FastAPI** service responsible for processing legal documents, generating prompts, and interacting with the **IBM WatsonX LLM (ModelInference API)**.  
It serves as the core engine of the Legal WatsonX LLM application, providing structured, accurate, and reliable legal insights to the frontend.

The backend is designed with:

- Clean architecture  
- Strong typing using **Pydantic**  
- Production-ready API patterns  
- Secure CORS configuration  
- Robust error handling  
- Docker support  

---

## Key Responsibilities
- Receive legal document text from the frontend  
- Validate and sanitize input  
- Construct high-quality prompts for WatsonX LLM  
- Send LLM requests via IBM ModelInference API  
- Generate:
  - Legal summaries  
  - Extracted clauses  
  - Risk assessment  
  - Obligations per party  
- Return clean, structured JSON responses  

---

## Tech Stack
- **FastAPI**  
- **Python 3.11+**  
- **IBM WatsonX ModelInference (Llama 3.x)**  
- **Uvicorn**  
- **Pydantic**  
- **Docker ready**  

---

## Installation & Setup

### 1. Create a virtual environment
```bash
cd backend
python -m venv .venv
2. Activate environment
Windows

powershell
Copy code
.\.venv\Scripts\activate
macOS / Linux

bash
Copy code
source .venv/bin/activate
3. Install dependencies
bash
Copy code
pip install -r requirements.txt
Environment Configuration
Create a .env file:

ini
Copy code
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_API_KEY=your_api_key
WATSONX_PROJECT_ID=your_project_id
FRONTEND_ORIGIN=http://localhost:5173
⚠️ Do NOT commit .env to GitHub.

Running the Server
bash
Copy code
uvicorn app:app --reload --host 0.0.0.0 --port 8000
API Docs available at:

bash
Copy code
http://localhost:8000/docs
API — POST /api/analyze
Request example
json
Copy code
{
  "documentText": "This Agreement is made on..."
}
Response example
json
Copy code
{
  "analysis": "LLM-generated legal analysis..."
}
Error Responses
Code	Description
400	Invalid input
413	Input too large
429	Rate limit reached
500	WatsonX or server error

Deployment
Docker (recommended)
bash
Copy code
docker build -t legal-watsonx-backend .
docker run -p 8000:8000 legal-watsonx-backend
Production checklist
Use Gunicorn/Uvicorn workers

Harden CORS rules

Use HTTPS for all requests

Store secrets in a secrets manager

Enable rate limiting

Security Notes
Never commit .env

Sanitize all inputs

Do not expose internal stack traces

Always validate API responses

