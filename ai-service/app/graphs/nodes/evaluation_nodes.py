import json
import logging
import re

from app.graphs.state import EvaluationState
from app.services.llm_client import call_llm

logger = logging.getLogger(__name__)

EVALUATION_PROMPT = """
You are a strict technical interviewer. Do NOT hallucinate positive feedback for bad input.

RULES:
- RULE 1: If the answer is gibberish, irrelevant, empty, or missing — return technicalScore: 0 and confidenceScore: 0.
- RULE 2: idealAnswer must be a clean Markdown string. Do NOT return a nested JSON object.
- RULE 3: {assessment_rule}

Context:
- Role: {role}
- Level: {level}
- Question: {question}
- Verbal Answer: {user_answer}
- Code Answer: {user_code}

Respond ONLY with valid JSON:
{{
  "technicalScore": 0,
  "confidenceScore": 0,
  "aiFeedback": "",
  "idealAnswer": ""
}}
"""


async def evaluate_answer_node(state: EvaluationState) -> dict:
    """Evaluate candidate answer using Gemini."""
    if state["question_type"] == "oral":
        assessment_rule = (
            "This is a conceptual oral question. Focus on the verbal explanation only. "
            "Ignore code blocks. If transcript is empty or nonsensical, SCORE 0."
        )
    else:
        assessment_rule = (
            "This is a coding challenge. Evaluate code logic and efficiency. "
            "Use the transcript only for thought process insight. "
            "If code is empty, undefined, or random characters, SCORE 0."
        )

    prompt = EVALUATION_PROMPT.format(
        assessment_rule=assessment_rule,
        role=state["role"],
        level=state["level"],
        question=state["question"],
        user_answer=state.get("user_answer") or "No verbal answer provided",
        user_code=state.get("user_code") or "No code provided",
    )

    try:
        raw = await call_llm(prompt, temperature=0.1, json_mode=True)
        return {"raw_response": raw, "error": None}
    except Exception as e:
        logger.error("Evaluation LLM call failed: %s", e)
        return {"raw_response": "", "error": str(e)}


def parse_evaluation_node(state: EvaluationState) -> dict:
    """Parse the LLM JSON response into a typed EvaluationResponse dict."""
    if state.get("error"):
        return {"output": {
            "technicalScore": 0,
            "confidenceScore": 0,
            "aiFeedback": f"Evaluation failed: {state['error']}",
            "idealAnswer": "N/A",
        }}

    raw = state["raw_response"]

    # Attempt 1: direct json.loads
    try:
        data = json.loads(raw)
        _normalize_ideal_answer(data)
        return {"output": data}
    except json.JSONDecodeError:
        pass

    # Attempt 2: strip newlines and retry
    try:
        fixed = re.sub(r"[\r\n\t]", " ", raw)
        data = json.loads(fixed)
        _normalize_ideal_answer(data)
        return {"output": data}
    except json.JSONDecodeError:
        pass

    # Fallback
    logger.error("Could not parse evaluation response: %s", raw[:300])
    return {"output": {
        "technicalScore": 0,
        "confidenceScore": 0,
        "aiFeedback": "Failed to parse AI response",
        "idealAnswer": "Failed to parse AI response",
    }}


def _normalize_ideal_answer(data: dict):
    """Ensure idealAnswer is always a string, not a nested object."""
    if "idealAnswer" in data and not isinstance(data["idealAnswer"], str):
        data["idealAnswer"] = json.dumps(data["idealAnswer"])
