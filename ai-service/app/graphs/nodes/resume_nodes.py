import logging

from app.graphs.state import ResumeState
from app.rag.faiss_store import add_document, search_similar
from app.services.ats_scorer import calculate_ats_score
from app.services.llm_client import call_llm
from app.utils.json_parser import extract_json

logger = logging.getLogger(__name__)

RESUME_PROMPT = """
You are a senior ATS Resume Analyzer and technical recruiter.

ROLE BEING EVALUATED FOR: {role}

{jd_section}

RESUME:
{resume_text}

SIMILAR PAST ANALYSES FOR CONTEXT (from RAG store):
{rag_context}

Return ONLY valid JSON — no markdown, no preamble:
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


async def rag_lookup_node(state: ResumeState) -> dict:
    """Search FAISS for similar past resume analyses to enrich the LLM prompt."""
    try:
        query = f"{state['role']} {state['resume_text'][:500]}"
        results = await search_similar(query, top_k=3)
        logger.info("RAG lookup returned %d similar documents", len(results))
        return {"similar_past_analyses": results}
    except Exception as e:
        logger.warning("RAG lookup failed (non-fatal): %s", e)
        return {"similar_past_analyses": []}


async def analyze_resume_node(state: ResumeState) -> dict:
    """Core LLM node: call Gemini with resume + JD + RAG context."""

    # ✅ ATS score now based on role keywords, blended with JD if provided
    ats_score = calculate_ats_score(
        state["resume_text"],
        role=state.get("role", ""),
        jd_text=state.get("jd_text", ""),
    )
    logger.info("ATS score calculated: %s", ats_score)

    # ✅ JD section in prompt — targeted suggestions only when JD is present
    jd_text = state.get("jd_text", "").strip()
    if jd_text:
        jd_section = (
            f"JOB DESCRIPTION (use this for targeted suggestions):\n"
            f"{jd_text[:4000]}"
        )
    else:
        jd_section = (
            "JOB DESCRIPTION: Not provided. "
            "Base all suggestions and missing skills on the target role only."
        )

    rag_context = "No similar past analyses found."
    if state.get("similar_past_analyses"):
        snippets = []
        for doc in state["similar_past_analyses"]:
            meta = doc.get("metadata", {})
            snippets.append(
                f"- Role: {meta.get('role', 'N/A')} | "
                f"ATS: {meta.get('ats_score', 'N/A')} | "
                f"Impression: {meta.get('recruiterImpression', '')[:100]}"
            )
        rag_context = "\n".join(snippets)

    prompt = RESUME_PROMPT.format(
        role=state["role"],
        jd_section=jd_section,
        resume_text=state["resume_text"][:8000],
        rag_context=rag_context,
    )

    try:
        raw = await call_llm(prompt, temperature=0.2, json_mode=True)
        return {"raw_llm_response": raw, "ats_score": ats_score, "error": None}
    except Exception as e:
        logger.error("LLM analysis failed: %s", e)
        return {"error": str(e), "ats_score": ats_score}


async def finalize_resume_node(state: ResumeState) -> dict:
    """Parse LLM JSON, attach ATS score, store in RAG."""
    if state.get("error"):
        return {"output": {"error": state["error"]}}

    try:
        data = extract_json(state["raw_llm_response"])
    except ValueError as e:
        return {"output": {"error": f"JSON parse failed: {e}"}}

    data["atsScore"] = state["ats_score"]

    # Store in FAISS for future RAG lookups
    try:
        doc_text = (
            f"Role: {state['role']}\n"
            f"Resume snippet: {state['resume_text'][:500]}\n"
            f"Impression: {data.get('recruiterImpression', '')}"
        )
        await add_document(doc_text, {
            "role": state["role"],
            "ats_score": state["ats_score"],
            "recruiterImpression": data.get("recruiterImpression", ""),
            "name": data.get("summary", {}).get("name", ""),
        })
    except Exception as e:
        logger.warning("Failed to store in RAG (non-fatal): %s", e)

    return {"output": data}


def route_after_llm(state: ResumeState) -> str:
    return "finalize"