import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Import the IBM WatsonX AI library
from ibm_watsonx_ai.foundation_models import ModelInference
from ibm_watsonx_ai.metanames import GenTextParamsMetaNames

# Load environment variables from the .env file in the backend folder
load_dotenv()

# --- 1. INITIALIZE FASTAPI APP ---
app = FastAPI(
    title="Legal Document Analyzer API",
    description="API for analyzing legal documents using WatsonX.ai"
)

# --- 2. CONFIGURE CORS ---
# This allows your frontend running on localhost:5173 to communicate with this backend.
origins = [
    
    "http://localhost:8080"
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. CONFIGURE WATSONX.AI CLIENT ---
try:
    credentials = {
        "url": os.getenv("WATSONX_URL"),
        "apikey": os.getenv("WATSONX_API_KEY")
    }
    project_id = os.getenv("WATSONX_PROJECT_ID")
except Exception:
    print("Error: WatsonX credentials not found in .env file. Please check your backend/.env file.")
    exit(1)

# --- 4. DEFINE MODEL PARAMETERS ---
# UPDATED: Changed to the model recommended in the LifecycleWarning.
model_id = "meta-llama/llama-3-2-1b-instruct"

decoding_parameters = {
    GenTextParamsMetaNames.MAX_NEW_TOKENS: 1024, # Increased token limit for potentially longer analyses
    GenTextParamsMetaNames.TEMPERATURE: 0.1,
}

model = ModelInference(
    model_id=model_id,
    params=decoding_parameters,
    credentials=credentials,
    project_id=project_id
)

# --- 5. DEFINE THE REQUEST BODY SHAPE ---
# This ensures the incoming data from the frontend has the correct structure.
class DocumentPayload(BaseModel):
    documentText: str

# --- 6. CREATE THE API ENDPOINT ---
@app.post("/api/analyze")
async def analyze(payload: DocumentPayload):
    """
    Receives document text from the frontend, sends it to WatsonX for analysis,
    and returns the result.
    """
    prompt = f"""
    Professionally analyze the following legal document. 
    Identify key clauses, potential risks, and summarize the main obligations for each party involved.

    Document:
    ---
    {payload.documentText}
    ---

    Professional Analysis:
    """

    try:
        generated_response = model.generate(prompt=prompt)
        
        if (generated_response and 'results' in generated_response and 
            len(generated_response['results']) > 0):
            
            analysis_text = generated_response['results'][0].get('generated_text')
            return {"analysis": analysis_text}
        else:
            raise HTTPException(status_code=500, detail="Failed to get a valid response from WatsonX")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))