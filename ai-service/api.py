import os
import re
import json
import time
import tempfile
import ast
from typing import Optional, TypedDict

import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

import google.generativeai as genai

from langgraph.graph import StateGraph, END
from tenacity import retry, wait_exponential, stop_after_attempt

import fitz
from docx import Document

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ================= ENV =================
load_dotenv()

PORT = int(os.getenv("AI_SERVICE_PORT", 8000))
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise Exception("Missing GEMINI_API_KEY")


# ================= GEMINI =================
genai.configure(api_key=GEMINI_API_KEY)
llm = genai.GenerativeModel("models/gemini-2.5-flash")


# ================= FASTAPI =================
app = FastAPI(title="AI Interview + Resume Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= STATE =================
class GraphState(TypedDict):
    input: dict
    output: dict


# ================= GEMINI CALL =================
@retry(wait=wait_exponential(min=2, max=20), stop=stop_after_attempt(3))
def safe_llm_call(prompt: str):
    time.sleep(1)

    response = llm.generate_content(
        prompt,
        generation_config={"temperature": 0.2}
    )

    if not response or not response.text:
        raise Exception("Empty Gemini response")

    return response.text.strip()


# ================= JSON PARSER =================
def extract_json(text: str):
    text = text.replace("```json", "").replace("```", "").strip()

    start = text.find("{")
    end = text.rfind("}") + 1

    if start == -1 or end == 0:
        raise Exception("No JSON found")

    raw = text[start:end]
    raw = re.sub(r'[^\x00-\x7F]+', ' ', raw)

    try:
        return json.loads(raw)
    except:
        return ast.literal_eval(raw)


# ================= RESUME TEXT =================
def extract_resume_text(file_path):
    text = ""

    if file_path.endswith(".pdf"):
        pdf = fitz.open(file_path)
        for page in pdf:
            text += page.get_text()

    elif file_path.endswith(".docx"):
        doc = Document(file_path)
        for p in doc.paragraphs:
            text += p.text + "\n"

    return text.strip()


# ================= ATS SCORE =================
def calculate_ats_score(resume_text, jd_text):
    if not resume_text or not jd_text:
        return 0

    resume_text = resume_text.lower()
    jd_text = jd_text.lower()[:8000]

    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)

    try:
        tfidf = vectorizer.fit_transform([resume_text, jd_text])
        similarity = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
    except:
        similarity = 0

    jd_words = set(jd_text.split())
    resume_words = set(resume_text.split())

    keyword_match = len(jd_words & resume_words) / max(len(jd_words), 1)

    score = (similarity * 0.6 + keyword_match * 0.4) * 100

    return round(max(0, min(score, 100)), 2)


# ================= RESUME NODE =================
def analyze_resume_node(state: GraphState):
    req = state["input"]

    resume_text = req.get("resume_text", "")
    jd_text = req.get("jd_text", "")
    role = req.get("role", "")

    ats_score = calculate_ats_score(resume_text, jd_text) if jd_text else 0

    prompt = f"""
You are an ATS Resume Analyzer.

ROLE: {role}

JOB DESCRIPTION:
{jd_text if jd_text else "No JD provided"}

RESUME:
{resume_text[:8000]}

Return ONLY JSON:
{{
  "summary": {{
    "name": "",
    "email": "",
    "phone": "",
    "experience": "",
    "education": "",
    "skills": ""
  }},
  "strengths": [],
  "weaknesses": [],
  "missingSkills": [],
  "suggestions": [],
  "recruiterImpression": ""
}}
"""

    response = safe_llm_call(prompt)
    data = extract_json(response)

    data["atsScore"] = ats_score

    return {"output": data}


# ================= GRAPH =================
def build_resume_graph():
    g = StateGraph(GraphState)
    g.add_node("resume", analyze_resume_node)
    g.set_entry_point("resume")
    g.add_edge("resume", END)
    return g.compile()


resume_graph = build_resume_graph()


# ================= RESUME API =================
@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    jd: Optional[UploadFile] = File(None),
    role: str = Form("MERN Stack Developer")   # 🔥 FIXED HERE
):
    try:

        # save resume file
        suffix = ".pdf"
        if resume.filename.endswith(".docx"):
            suffix = ".docx"

        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await resume.read())
            resume_path = tmp.name

        resume_text = extract_resume_text(resume_path)

        # optional JD
        jd_text = ""
        if jd and jd.filename:
            jd_text = (await jd.read()).decode("utf-8", errors="ignore")

        # run AI graph
        result = resume_graph.invoke({
            "input": {
                "resume_text": resume_text,
                "jd_text": jd_text,
                "role": role
            }
        })

        os.remove(resume_path)

        return result["output"]

    except Exception as e:
        print("FASTAPI ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


# ================= HEALTH =================
@app.get("/")
def home():
    return {"message": "AI Service Running"}


# ================= RUN =================
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=PORT)