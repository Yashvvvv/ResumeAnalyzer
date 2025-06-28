import os
import json
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv
import fitz  # PyMuPDF
import docx

# Load environment variables
load_dotenv()

# Configure the Gemini API
api_key = os.getenv("GOOGLE_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY not found in .env file")
genai.configure(api_key=api_key)

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
origins = ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models for Advanced Analysis ---
class Suggestion(BaseModel):
    original_text: str = Field(description="The original text from the resume that could be improved.")
    suggested_improvement: str = Field(description="A concrete suggestion for improving the text.")

class AnalysisResponse(BaseModel):
    ats_score: int = Field(description="The Applicant Tracking System (ATS) score from 0 to 100.")
    present_keywords: list[str] = Field(description="Keywords from the job description found in the resume.")
    missing_keywords: list[str] = Field(description="Keywords from the job description missing from the resume.")
    summary: str = Field(description="A brief summary of the candidate's fit.")
    suggestions: list[Suggestion] = Field(description="Actionable suggestions to improve the resume.")

# --- System Prompt for the LLM ---
SYSTEM_PROMPT = """
You are an expert ATS (Applicant Tracking System) and professional resume writing assistant. Your task is to analyze a candidate's resume against a job description with extreme detail.

You must provide a detailed analysis and output your response strictly in the following JSON format. Do not include any text before or after the JSON object.

{
  "ats_score": <An integer from 0 to 100 representing the ATS match score. Calculate this based on keyword overlap, experience relevance, and overall fit>,
  "present_keywords": [<A list of crucial keywords and skills from the job description that are present in the resume>],
  "missing_keywords": [<A list of crucial keywords and skills from the job description that are NOT present in the resume>],
  "summary": "<A brief, 2-3 sentence professional summary of the candidate's strengths and weaknesses for this specific role>",
  "suggestions": [
    {
      "original_text": "<A specific sentence or bullet point from the resume that could be improved>",
      "suggested_improvement": "<A concrete, re-written version of that sentence or a suggestion on how to better align it with the job description>"
    }
  ]
}
"""

# --- Helper Functions for File Parsing ---
def parse_pdf(contents: bytes) -> str:
    with fitz.open(stream=contents, filetype="pdf") as doc:
        text = "".join(page.get_text() for page in doc)
    return text

def parse_docx(contents: bytes) -> str:
    # docx library works with a file-like object
    import io
    doc = docx.Document(io.BytesIO(contents))
    return "\n".join([para.text for para in doc.paragraphs])

# --- API Endpoint ---
@app.post("/analyze_resume", response_model=AnalysisResponse)
async def analyze_resume(
    job_description: str = Form(...),
    resume_file: UploadFile = File(...)
):
    # Read file contents
    contents = await resume_file.read()
    
    # Parse resume text based on file type
    resume_text = ""
    if resume_file.filename.endswith(".pdf"):
        resume_text = parse_pdf(contents)
    elif resume_file.filename.endswith(".docx"):
        resume_text = parse_docx(contents)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a .pdf or .docx file.")

    if not resume_text:
        raise HTTPException(status_code=500, detail="Failed to extract text from the resume.")

    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        user_prompt = f"""
        Here is the resume:
        ---
        {resume_text}
        ---

        Here is the job description:
        ---
        {job_description}
        ---
        """

        full_prompt = f"{SYSTEM_PROMPT}\n\n{user_prompt}"
        
        response = model.generate_content(full_prompt)
        
        # Clean up the response to get pure JSON
        json_response_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        
        analysis_data = json.loads(json_response_text)
        
        return AnalysisResponse(**analysis_data)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Error decoding JSON from AI response. The AI may have returned a malformed response.")
    except Exception as e:
        print(f"An error occurred: {e}") # For server-side logging
        raise HTTPException(status_code=500, detail=f"An internal server error occurred: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Advanced ATS Resume Optimizer API"} 