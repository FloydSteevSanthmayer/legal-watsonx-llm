# Frontend — legal-watsonx-llm

## Overview
This frontend is a **React + Vite** application designed to provide a clean and intuitive interface for legal document analysis.  
The UI follows component patterns inspired by **lovable**, ensuring a modern, responsive, and user-friendly experience.

Its responsibilities include collecting user input, sending it to the backend, and presenting AI-driven insights produced by IBM WatsonX LLM models.

---

## Key Responsibilities
- Accept pasted or uploaded legal text  
- Validate input & provide user feedback  
- Send API requests to `POST /api/analyze`  
- Display:
  - Summary  
  - Extracted clauses  
  - Risks  
  - Obligations  
- Provide export/copy functionality for analysis results  

---

## Getting Started (Development)

### Install dependencies
```bash
Start development server
npm run dev

Build for production
npm run build
npm run preview

Environment Variables

Create a .env file inside frontend/:

VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Legal WatsonX LLM


⚠️ Do not commit .env or any secrets to GitHub.

Recommended Folder Structure
frontend/
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── main.jsx
├── package.json
├── vite.config.ts
└── README.md

API Usage Example
const response = await fetch(
  `${import.meta.env.VITE_API_BASE_URL}/api/analyze`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentText }),
  }
);

Accessibility & UX Good Practices

Keyboard-friendly navigation

High contrast readability

Clear error messages

Smooth transitions for results
cd frontend
npm install
