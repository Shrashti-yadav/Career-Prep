# app/graphs/nodes/resume_nodes.py

import logging

from app.graphs.state import ResumeState
from app.rag.faiss_store import add_document, search_similar
from app.services.ats_scorer import calculate_ats_score
from app.services.llm_client import call_llm
from app.utils.json_parser import extract_json

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# PROMPTS
# ─────────────────────────────────────────────

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

# ── Self-RAG: re-evaluate the first response critically ──────────────────────
SELF_RAG_PROMPT = """
You are an adversarial resume-evaluation auditor.

A junior AI previously analysed a resume and produced the JSON below.
Your job is to challenge that analysis and produce a BETTER one.

TARGET ROLE: {role}

ORIGINAL RESUME (first 8000 chars):
{resume_text}

JUNIOR AI's PREVIOUS ANALYSIS:
{previous_analysis}

AUDIT CHECKLIST — question every field:
1. Are the listed strengths genuinely impressive, or just filler praise?
2. Are the weaknesses specific and honest, or too vague / too kind?
3. Are missing skills truly missing from the resume, or already present?
4. Are the suggestions actionable and role-specific, or generic advice?
5. Does the recruiterImpression reflect a realistic hiring manager's view?
6. Would a real recruiter shortlist this candidate for the role? Why / why not?

Produce a REVISED analysis that fixes every flaw you find.
Return ONLY valid JSON — same schema as before, no markdown, no preamble:
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

# ── Explainable RAG: justify the ATS score ───────────────────────────────────
EXPLAINABLE_RAG_PROMPT = """
You are a transparent ATS scoring expert.

You previously analysed a resume and now you must EXPLAIN your scoring.

TARGET ROLE  : {role}
ATS SCORE    : {ats_score} / 100
FINAL ANALYSIS (JSON):
{final_analysis}

RESUME (first 4000 chars):
{resume_text}

Produce a clear, structured score explanation.
Return ONLY valid JSON — no markdown, no preamble:
{{
  "scoreBreakdown": {{
    "keywordMatch"     : {{ "score": 0, "max": 40, "reason": "" }},
    "experienceDepth"  : {{ "score": 0, "max": 25, "reason": "" }},
    "educationFit"     : {{ "score": 0, "max": 15, "reason": "" }},
    "formattingClarity": {{ "score": 0, "max": 10, "reason": "" }},
    "skillsCoverage"   : {{ "score": 0, "max": 10, "reason": "" }}
  }},
  "whyThisScore"   : "",
  "howToImprove"   : [],
  "confidenceNote" : ""
}}
"""


# ─────────────────────────────────────────────
# NODE 1 — RAG lookup (FAISS)
# ─────────────────────────────────────────────

async def rag_lookup_node(state: ResumeState) -> dict:
    """
    Search FAISS for similar past analyses to enrich the first LLM call.
    Non-fatal: returns empty list on any error.
    """
    try:
        query = f"{state['role']} {state['resume_text'][:500]}"
        results = await search_similar(query, top_k=3)
        logger.info("RAG lookup returned %d similar documents", len(results))
        return {"similar_past_analyses": results}
    except Exception as exc:
        logger.warning("RAG lookup failed (non-fatal): %s", exc)
        return {"similar_past_analyses": []}


# ─────────────────────────────────────────────
# NODE 2 — First-pass LLM analysis
# ─────────────────────────────────────────────

async def analyze_resume_node(state: ResumeState) -> dict:
    """
    Core LLM node: call Gemini with resume + JD + RAG context.
    Calculates ATS score and runs the first-pass analysis.
    """
    # ATS score — blended role-keywords + JD keywords
    ats_score = calculate_ats_score(
        state["resume_text"],
        role=state.get("role", ""),
        jd_text=state.get("jd_text", ""),
    )
    logger.info("ATS score calculated: %s", ats_score)

    # Build JD section
    jd_text = state.get("jd_text", "").strip()
    if jd_text:
        jd_section = (
            f"JOB DESCRIPTION (use this for targeted suggestions):\n{jd_text[:4000]}"
        )
    else:
        jd_section = (
            "JOB DESCRIPTION: Not provided. "
            "Base all suggestions and missing skills on the target role only."
        )

    # Build RAG context string
    rag_context = "No similar past analyses found."
    if state.get("similar_past_analyses"):
        snippets = [
            f"- Role: {doc.get('metadata', {}).get('role', 'N/A')} | "
            f"ATS: {doc.get('metadata', {}).get('ats_score', 'N/A')} | "
            f"Impression: {doc.get('metadata', {}).get('recruiterImpression', '')[:100]}"
            for doc in state["similar_past_analyses"]
        ]
        rag_context = "\n".join(snippets)

    prompt = RESUME_PROMPT.format(
        role=state["role"],
        jd_section=jd_section,
        resume_text=state["resume_text"][:8000],
        rag_context=rag_context,
    )

    try:
        raw = await call_llm(prompt, temperature=0.2, json_mode=True)
        logger.info("First-pass LLM analysis complete")
        return {"raw_llm_response": raw, "ats_score": ats_score, "error": None}
    except Exception as exc:
        logger.error("LLM analysis failed: %s", exc)
        return {"error": str(exc), "ats_score": ats_score}


# ─────────────────────────────────────────────
# NODE 3 — Self-RAG (adversarial re-evaluation)
# ─────────────────────────────────────────────

async def self_rag_node(state: ResumeState) -> dict:
    """
    Self-RAG: feed the first-pass response back to Gemini in adversarial /
    auditor mode so it critiques and improves its own output.

    If the first pass already errored, this node is a no-op — the error
    propagates downstream.
    """
    if state.get("error"):
        logger.warning("Skipping self-RAG because first-pass errored.")
        return {}

    try:
        first_pass_json = extract_json(state["raw_llm_response"])
    except ValueError as exc:
        logger.warning("Self-RAG skipped — could not parse first-pass JSON: %s", exc)
        return {}   # finalize_node will handle the parse error

    import json as _json

    prompt = SELF_RAG_PROMPT.format(
        role=state["role"],
        resume_text=state["resume_text"][:8000],
        previous_analysis=_json.dumps(first_pass_json, indent=2),
    )

    try:
        revised_raw = await call_llm(prompt, temperature=0.3, json_mode=True)
        logger.info("Self-RAG re-evaluation complete")
        # Override the raw response so finalize uses the *revised* analysis
        return {"raw_llm_response": revised_raw}
    except Exception as exc:
        logger.warning("Self-RAG failed (non-fatal, keeping first-pass): %s", exc)
        return {}   # keep original raw_llm_response unchanged


# ─────────────────────────────────────────────
# NODE 4 — Explainable RAG (score justification)
# ─────────────────────────────────────────────

async def explainable_rag_node(state: ResumeState) -> dict:
    """
    Ask Gemini to explain WHY the ATS score was given, broken down by
    category, with actionable improvement tips.

    Runs after self-RAG so it explains the *final* revised analysis.
    """
    if state.get("error"):
        return {"score_explanation": None}

    try:
        final_analysis = extract_json(state["raw_llm_response"])
    except ValueError:
        return {"score_explanation": None}

    import json as _json

    prompt = EXPLAINABLE_RAG_PROMPT.format(
        role=state["role"],
        ats_score=state.get("ats_score", "N/A"),
        final_analysis=_json.dumps(final_analysis, indent=2),
        resume_text=state["resume_text"][:4000],
    )

    try:
        raw_explanation = await call_llm(prompt, temperature=0.1, json_mode=True)
        explanation = extract_json(raw_explanation)
        logger.info("Explainable RAG complete")
        return {"score_explanation": explanation}
    except Exception as exc:
        logger.warning("Explainable RAG failed (non-fatal): %s", exc)
        return {"score_explanation": None}


# ─────────────────────────────────────────────
# NODE 5 — Finalize: parse, enrich, store
# ─────────────────────────────────────────────

async def finalize_resume_node(state: ResumeState) -> dict:
    """
    Parse the (possibly self-RAG-revised) LLM JSON, attach ATS score +
    score explanation, then store the result in FAISS for future lookups.
    """
    if state.get("error"):
        return {"output": {"error": state["error"]}}

    try:
        data = extract_json(state["raw_llm_response"])
    except ValueError as exc:
        return {"output": {"error": f"JSON parse failed: {exc}"}}

    # Attach numeric ATS score
    data["atsScore"] = state["ats_score"]

    # Attach explainable-RAG breakdown (may be None if that node failed)
    data["scoreExplanation"] = state.get("score_explanation")

    # ── Store enriched result in FAISS for future RAG lookups ──────────────
    try:
        doc_text = (
            f"Role: {state['role']}\n"
            f"Resume snippet: {state['resume_text'][:500]}\n"
            f"Impression: {data.get('recruiterImpression', '')}"
        )
        await add_document(
            doc_text,
            metadata={
                "role": state["role"],
                "ats_score": state["ats_score"],
                "recruiterImpression": data.get("recruiterImpression", ""),
                "name": data.get("summary", {}).get("name", ""),
            },
        )
        logger.info("Stored analysis in FAISS RAG store")
    except Exception as exc:
        logger.warning("Failed to store in RAG (non-fatal): %s", exc)

    return {"output": data}
