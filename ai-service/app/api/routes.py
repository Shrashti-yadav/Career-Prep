# app/api/routes.py

import logging
import os
import tempfile
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

from app.config import settings
from app.graphs.evaluation_graph import evaluation_graph
from app.graphs.interview_graph import interview_graph
from app.graphs.resume_graph import resume_graph
from app.services.resume_parser import extract_resume_text
from app.services.transcription import transcribe_audio_bytes

logger = logging.getLogger(__name__)
router = APIRouter()


# ─────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────

class QuestionRequest(BaseModel):
    role: str = "MERN Stack Developer"
    level: str = "Junior"
    count: int = 5
    interview_type: str = "coding-mix"


class QuestionResponse(BaseModel):
    questions: list[str]
    model_used: str = settings.GEMINI_MODEL


class EvaluationRequest(BaseModel):
    question: str
    question_type: str
    role: str
    level: str
    user_answer: Optional[str] = None
    user_code: Optional[str] = None


class EvaluationResponse(BaseModel):
    technicalScore: int
    confidenceScore: int
    aiFeedback: str
    idealAnswer: str


# ─────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────

@router.get("/", tags=["health"])
async def root():
    return {"message": "AI CareerPrep Service Running", "model": settings.GEMINI_MODEL}


# ─────────────────────────────────────────────
# Interview: Generate Questions
# ─────────────────────────────────────────────

@router.post("/generate-questions", response_model=QuestionResponse, tags=["interview"])
async def generate_questions(request: QuestionRequest):
    try:
        result = await interview_graph.ainvoke({
            "role": request.role,
            "level": request.level,
            "count": request.count,
            "interview_type": request.interview_type,
            "questions": [],
            "error": None,
        })

        if result.get("error"):
            raise HTTPException(status_code=500, detail=result["error"])

        return QuestionResponse(questions=result["questions"])

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("generate-questions failed")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# Interview: Transcribe Audio
# ─────────────────────────────────────────────

@router.post("/transcribe", tags=["interview"])
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        transcription = await transcribe_audio_bytes(audio_bytes)
        return {"transcription": transcription}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.exception("transcription failed")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# Interview: Evaluate Answer
# ─────────────────────────────────────────────

@router.post("/evaluate", response_model=EvaluationResponse, tags=["interview"])
async def evaluate(request: EvaluationRequest):
    try:
        result = await evaluation_graph.ainvoke({
            "question": request.question,
            "question_type": request.question_type,
            "role": request.role,
            "level": request.level,
            "user_answer": request.user_answer,
            "user_code": request.user_code,
            "raw_response": "",
            "output": None,
            "error": None,
        })

        output = result.get("output", {})
        return EvaluationResponse(**output)

    except Exception as e:
        logger.exception("evaluate failed")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# Resume Analysis: Submit resume → get result directly
# ─────────────────────────────────────────────

@router.post("/analyze-resume", tags=["resume"])
async def analyze_resume(
    resume: UploadFile = File(...),
    jd: Optional[UploadFile] = File(None),
    role: str = Form("MERN Stack Developer"),
):
    if resume.content_type not in settings.ALLOWED_RESUME_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Only PDF and DOCX are allowed.",
        )

    suffix = ".docx" if resume.filename.endswith(".docx") else ".pdf"
    resume_path = None

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await resume.read())
            resume_path = tmp.name

        resume_text = extract_resume_text(resume_path)
        if not resume_text:
            raise HTTPException(
                status_code=422,
                detail="Could not extract text from resume file."
            )

        jd_text = ""
        if jd and jd.filename:
            raw_jd = await jd.read()
            jd_text = raw_jd.decode("utf-8", errors="ignore")[:settings.MAX_JD_CHARS]

        # Run graph straight through — no pause, no approval step
        result = await resume_graph.ainvoke({
            "resume_text": resume_text,
            "jd_text": jd_text,
            "role": role,
            "ats_score": 0.0,
            "similar_past_analyses": [],
            "raw_llm_response": "",
            "output": None,
            "error": None,
        })

        output = result.get("output", {})

        # Bubble up any graph-level error as HTTP 500
        if not output or output.get("error"):
            error_detail = output.get("error", "Analysis failed with no output.")
            logger.error("Resume graph returned error: %s", error_detail)
            raise HTTPException(status_code=500, detail=error_detail)

        return {"status": "complete", "result": output}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("analyze-resume failed")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if resume_path and os.path.exists(resume_path):
            os.remove(resume_path)