import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Optional

from app.graphs.revision_graph import quiz_graph, revision_notes_graph
from app.services.pdf_generator import generate_notes_pdf

logger = logging.getLogger(__name__)
revision_router = APIRouter(prefix="/revision", tags=["revision"])


# ─────────────────────────────────────────────
# Pydantic schemas
# ─────────────────────────────────────────────

class NotesRequest(BaseModel):
    topic: str = Field(..., example="React Hooks")
    depth: str = Field("detailed", example="detailed")


class PdfRequest(BaseModel):
    topic: str
    notes_data: dict  # raw notes from backend, sent back by frontend


class QuizSubmission(BaseModel):
    topic: str
    questions: list[dict]
    user_answers: dict[str, str]


class QuizResult(BaseModel):
    score: int
    total: int
    percentage: float
    passed: bool
    results: list[dict]


# ─────────────────────────────────────────────
# Helper: convert backend notes shape → UI shape
# ─────────────────────────────────────────────

def _to_ui_notes(data: dict) -> dict:
    key_points = [
        {
            "title": kc.get("title", ""),
            "description": kc.get("explanation", ""),
            "example": kc.get("example", ""),
        }
        for kc in data.get("key_concepts", [])
    ]
    tips = (
        data.get("interview_tips", [])
        + data.get("important_points", [])
        + data.get("common_mistakes", [])
    )
    return {
        "topic": data.get("topic", ""),
        "summary": data.get("summary", ""),
        "keyPoints": key_points,
        "tips": tips,
    }


def _to_ui_quiz(questions: list[dict]) -> list[dict]:
    option_keys = ["A", "B", "C", "D"]
    ui_questions = []
    for q in questions:
        opts_dict = q.get("options", {})
        options_list = [opts_dict.get(k, "") for k in option_keys]
        correct_letter = q.get("correct_answer", "A").upper()
        correct_index = (
            option_keys.index(correct_letter) if correct_letter in option_keys else 0
        )
        ui_questions.append(
            {
                "question": q.get("question", ""),
                "options": options_list,
                "correctAnswer": correct_index,
                "explanation": q.get("explanation", ""),
            }
        )
    return ui_questions


# ─────────────────────────────────────────────
# POST /revision/generate
# Combined endpoint → { notes, quiz, raw_notes }
# ─────────────────────────────────────────────

@revision_router.post("/generate")
async def generate_notes_and_quiz(request: NotesRequest):
    try:
        notes_result = await revision_notes_graph.ainvoke(
            {
                "topic": request.topic,
                "depth": request.depth,
                "similar_past_notes": [],
                "raw_notes": "",
                "output": None,
                "error": None,
            }
        )

        if notes_result.get("error"):
            raise HTTPException(status_code=500, detail=notes_result["error"])

        notes_data = notes_result.get("output")
        if not notes_data:
            raise HTTPException(
                status_code=500, detail="Notes generation returned empty output"
            )

        logger.info("Notes generated for topic: %s", request.topic)

        notes_context = (
            f"{notes_data.get('summary', '')}\n\n{notes_data.get('quick_revision', '')}"
        )

        quiz_result = await quiz_graph.ainvoke(
            {
                "topic": request.topic,
                "notes_context": notes_context,
                "difficulty": "medium",
                "count": 10,
                "raw_quiz": "",
                "output": None,
                "error": None,
            }
        )

        quiz_questions = quiz_result.get("output") or []

        return {
            "notes": _to_ui_notes(notes_data),
            "quiz": _to_ui_quiz(quiz_questions),
            "raw_notes": notes_data,  # ✅ send raw notes so PDF can use it directly
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("generate notes+quiz failed")
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# POST /revision/notes/pdf
# Accepts already-generated notes_data → no LLM call
# ─────────────────────────────────────────────

@revision_router.post("/notes/pdf")
async def generate_notes_pdf_endpoint(request: PdfRequest):
    try:
        if not request.notes_data:
            raise HTTPException(status_code=400, detail="notes_data is empty")

        logger.info("Generating PDF for topic: %s", request.topic)
        logger.info("notes_data keys: %s", list(request.notes_data.keys()))

        pdf_bytes = generate_notes_pdf(request.notes_data)

        # Validate PDF bytes
        if not pdf_bytes:
            raise HTTPException(status_code=500, detail="PDF generator returned empty bytes")

        if pdf_bytes[:4] != b"%PDF":
            logger.error("Invalid PDF header: %s", pdf_bytes[:20])
            raise HTTPException(status_code=500, detail="PDF generation produced invalid output")

        logger.info("PDF generated successfully: %d bytes", len(pdf_bytes))

        filename = f"revision_{request.topic.replace(' ', '_').lower()}.pdf"

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"',
                "Content-Length": str(len(pdf_bytes)),
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("generate-notes-pdf failed")
        raise HTTPException(status_code=500, detail=str(e))
