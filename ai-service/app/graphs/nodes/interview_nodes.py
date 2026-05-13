import logging

from app.graphs.state import InterviewState
from app.services.llm_client import call_llm

logger = logging.getLogger(__name__)

QUESTION_PROMPT = """
You are a professional technical interviewer.

Task: Generate exactly {count} unique interview questions for a {level}-level {role}.

Rules:
{instructions}
- Output exactly one question per line.
- No numbering, no bullet points, no extra commentary.
- Each question on its own line only.
"""


async def generate_questions_node(state: InterviewState) -> dict:
    """Generate interview questions using Gemini."""
    interview_type = state["interview_type"]
    count = state["count"]

    if interview_type == "coding-mix":
        coding_count = max(1, int(count * 0.2))
        oral_count = count - coding_count
        instructions = (
            f"- The first {coding_count} questions MUST be coding challenges requiring function implementation.\n"
            f"- The remaining {oral_count} questions MUST be conceptual oral questions."
        )
    else:
        instructions = "- All questions MUST be conceptual oral questions. Do NOT include any coding challenges."

    prompt = QUESTION_PROMPT.format(
        count=count,
        level=state["level"],
        role=state["role"],
        instructions=instructions,
    )

    try:
        raw = await call_llm(prompt, temperature=0.6)
        questions = [q.strip() for q in raw.split("\n") if q.strip()]
        return {"questions": questions[:count], "error": None}
    except Exception as e:
        logger.error("Question generation failed: %s", e)
        return {"questions": [], "error": str(e)}
