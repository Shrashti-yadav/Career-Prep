import json
import logging

from app.graphs.nodes.revision_state import QuizState, RevisionNotesState
from app.rag.faiss_store import add_document, search_similar
from app.services.llm_client import call_llm

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# REVISION NOTES NODES
# ─────────────────────────────────────────────────────────────

NOTES_PROMPT = """
You are an expert technical educator creating last-minute revision notes.

TOPIC: {topic}
DEPTH: {depth}

SIMILAR PAST NOTES FROM KNOWLEDGE BASE (use as enrichment context):
{rag_context}

Create structured revision notes. Return ONLY valid JSON — no markdown fences, no preamble:
{{
  "topic": "{topic}",
  "summary": "2-3 sentence overview of the topic",
  "key_concepts": [
    {{
      "title": "concept name",
      "explanation": "clear concise explanation",
      "example": "short example or code snippet if relevant"
    }}
  ],
  "important_points": ["bullet point 1", "bullet point 2"],
  "common_mistakes": ["mistake 1", "mistake 2"],
  "interview_tips": ["tip 1", "tip 2"],
  "quick_revision": "a 5-line cheat-sheet summary of the entire topic"
}}
"""

QUIZ_PROMPT = """
You are a strict technical quiz generator.

TOPIC: {topic}
DIFFICULTY: {difficulty}
NUMBER OF QUESTIONS: {count}

NOTES CONTEXT (use this as the knowledge source):
{notes_context}

Generate exactly {count} multiple-choice questions. Return ONLY valid JSON array — no markdown, no preamble:
[
  {{
    "id": 1,
    "question": "question text",
    "options": {{
      "A": "option A",
      "B": "option B",
      "C": "option C",
      "D": "option D"
    }},
    "correct_answer": "A",
    "explanation": "why this answer is correct"
  }}
]
"""


async def rag_lookup_notes_node(state: RevisionNotesState) -> dict:
    """Fetch similar past notes from FAISS to enrich the LLM prompt."""
    try:
        results = await search_similar(f"revision notes {state['topic']}", top_k=2)
        logger.info("RAG: found %d similar notes for topic '%s'", len(results), state["topic"])
        return {"similar_past_notes": results}
    except Exception as e:
        logger.warning("RAG lookup failed (non-fatal): %s", e)
        return {"similar_past_notes": []}


async def generate_notes_node(state: RevisionNotesState) -> dict:
    """Call Gemini to generate structured revision notes."""
    rag_context = "No similar past notes found."
    if state.get("similar_past_notes"):
        snippets = [
            f"- {doc['metadata'].get('topic', 'N/A')}: {doc['text'][:200]}"
            for doc in state["similar_past_notes"]
        ]
        rag_context = "\n".join(snippets)

    prompt = NOTES_PROMPT.format(
        topic=state["topic"],
        depth=state["depth"],
        rag_context=rag_context,
    )

    try:
        raw = await call_llm(prompt, temperature=0.3, json_mode=True)
        return {"raw_notes": raw, "error": None}
    except Exception as e:
        logger.error("Notes generation failed: %s", e)
        return {"raw_notes": "", "error": str(e)}


async def parse_and_store_notes_node(state: RevisionNotesState) -> dict:
    """Parse the LLM JSON response and store notes in FAISS for future RAG lookups."""
    if state.get("error"):
        return {"output": None}

    try:
        raw = state["raw_notes"].replace("```json", "").replace("```", "").strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        data = json.loads(raw[start:end])
    except Exception as e:
        logger.error("Notes JSON parse failed: %s", e)
        return {"output": None, "error": f"JSON parse failed: {e}"}

    # Store in FAISS so future similar topics get richer context
    try:
        doc_text = (
            f"Topic: {data.get('topic', state['topic'])}\n"
            f"Summary: {data.get('summary', '')}\n"
            f"Quick revision: {data.get('quick_revision', '')}"
        )
        await add_document(doc_text, {
            "topic": state["topic"],
            "type": "revision_notes",
            "depth": state["depth"],
        })
        logger.info("Stored notes for topic '%s' in FAISS", state["topic"])
    except Exception as e:
        logger.warning("RAG store failed (non-fatal): %s", e)

    return {"output": data}


# ─────────────────────────────────────────────────────────────
# QUIZ NODES
# ─────────────────────────────────────────────────────────────

async def generate_quiz_node(state: QuizState) -> dict:
    """Call Gemini to generate MCQ quiz questions."""
    notes_context = state.get("notes_context") or f"General knowledge about {state['topic']}"

    prompt = QUIZ_PROMPT.format(
        topic=state["topic"],
        difficulty=state["difficulty"],
        count=state["count"],
        notes_context=notes_context[:4000],
    )

    try:
        raw = await call_llm(prompt, temperature=0.4, json_mode=True)
        return {"raw_quiz": raw, "error": None}
    except Exception as e:
        logger.error("Quiz generation failed: %s", e)
        return {"raw_quiz": "", "error": str(e)}


def parse_quiz_node(state: QuizState) -> dict:
    """Parse the LLM JSON array response into a list of question dicts."""
    if state.get("error"):
        return {"output": []}

    try:
        raw = state["raw_quiz"].replace("```json", "").replace("```", "").strip()
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start == -1 or end == 0:
            raise ValueError("No JSON array found in response")
        questions = json.loads(raw[start:end])
        return {"output": questions, "error": None}
    except Exception as e:
        logger.error("Quiz JSON parse failed: %s | raw: %s", e, state["raw_quiz"][:200])
        return {"output": [], "error": f"Quiz parse failed: {e}"}
