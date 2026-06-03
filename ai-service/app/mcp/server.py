"""
MCP (Model Context Protocol) Server
Exposes CareerPrep tools to external AI agents.

Run independently:  python -m app.mcp.server
Or import and mount in main FastAPI app.
"""

import asyncio
import json
import logging

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import TextContent, Tool

from app.graphs.evaluation_graph import evaluation_graph
from app.graphs.interview_graph import interview_graph
from app.graphs.resume_graph import resume_graph
from app.graphs.revision_graph import quiz_graph, revision_notes_graph
from app.rag.faiss_store import search_similar
from app.services.pdf_generator import generate_notes_pdf

logger = logging.getLogger(__name__)

mcp_server = Server("careerprep-mcp")


@mcp_server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        # ── 1. Resume Analysis ──────────────────────────────────────────────
        Tool(
            name="analyze_resume",
            description=(
                "Analyse a resume for a target role. "
                "Returns ATS score, strengths, weaknesses, missing skills, "
                "suggestions, recruiter impression, and an explainable score breakdown."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "resume_text": {"type": "string"},
                    "role":        {"type": "string"},
                    "jd_text":     {"type": "string", "default": ""},
                },
                "required": ["resume_text", "role"],
            },
        ),

        # ── 2. Interview Questions ──────────────────────────────────────────
        Tool(
            name="generate_interview_questions",
            description="Generate technical interview questions for a given role, level, and type.",
            inputSchema={
                "type": "object",
                "properties": {
                    "role":           {"type": "string", "default": "MERN Stack Developer"},
                    "level":          {"type": "string", "enum": ["Junior", "Mid", "Senior"], "default": "Junior"},
                    "count":          {"type": "integer", "default": 5},
                    "interview_type": {"type": "string", "enum": ["coding-mix", "oral"], "default": "coding-mix"},
                },
                "required": ["role"],
            },
        ),

        # ── 3. Answer Evaluation ───────────────────────────────────────────
        Tool(
            name="evaluate_answer",
            description="Evaluate a candidate's answer to a technical interview question.",
            inputSchema={
                "type": "object",
                "properties": {
                    "question":      {"type": "string"},
                    "question_type": {"type": "string", "enum": ["oral", "coding"]},
                    "role":          {"type": "string"},
                    "level":         {"type": "string"},
                    "user_answer":   {"type": "string"},
                    "user_code":     {"type": "string"},
                },
                "required": ["question", "question_type", "role", "level"],
            },
        ),

        # ── 4. RAG Search ──────────────────────────────────────────────────
        Tool(
            name="search_past_analyses",
            description="Search the RAG store for similar past resume analyses.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "top_k": {"type": "integer", "default": 3},
                },
                "required": ["query"],
            },
        ),

        # ── 5. Revision Notes ──────────────────────────────────────────────
        Tool(
            name="generate_revision_notes",
            description="Generate structured last-minute revision notes for any technical topic.",
            inputSchema={
                "type": "object",
                "properties": {
                    "topic": {"type": "string"},
                    "depth": {"type": "string", "enum": ["quick", "detailed"], "default": "detailed"},
                },
                "required": ["topic"],
            },
        ),

        # ── 6. Quiz ────────────────────────────────────────────────────────
        Tool(
            name="generate_quiz",
            description="Generate a multiple-choice quiz for a technical topic.",
            inputSchema={
                "type": "object",
                "properties": {
                    "topic":         {"type": "string"},
                    "difficulty":    {"type": "string", "enum": ["easy", "medium", "hard"], "default": "medium"},
                    "count":         {"type": "integer", "default": 10},
                    "notes_context": {"type": "string"},
                },
                "required": ["topic"],
            },
        ),
    ]


@mcp_server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:

    # ── 1. analyze_resume ──────────────────────────────────────────────────
    if name == "analyze_resume":
        try:
            result = await resume_graph.ainvoke({
                "resume_text": arguments.get("resume_text", ""),
                "role":        arguments.get("role", ""),
                "jd_text":     arguments.get("jd_text", ""),
                "ats_score":          0.0,
                "similar_past_analyses": [],
                "raw_llm_response":   "",
                "score_explanation":  None,
                "human_approved":     None,
                "human_notes":        None,
                "output":             None,
                "error":              None,
            })
            return [TextContent(type="text", text=json.dumps(result.get("output", {})))]
        except Exception as exc:
            logger.error("analyze_resume failed: %s", exc)
            return [TextContent(type="text", text=json.dumps({"error": str(exc)}))]

    # ── 2. generate_interview_questions ────────────────────────────────────
    if name == "generate_interview_questions":
        try:
            result = await interview_graph.ainvoke({
                "role":           arguments.get("role", "MERN Stack Developer"),
                "level":          arguments.get("level", "Junior"),
                "count":          arguments.get("count", 5),
                "interview_type": arguments.get("interview_type", "coding-mix"),
                "questions":      [],
                "error":          None,
            })
            return [TextContent(type="text", text=json.dumps({
                "questions": result.get("questions", []),
                "error":     result.get("error"),
            }))]
        except Exception as exc:
            logger.error("generate_interview_questions failed: %s", exc)
            return [TextContent(type="text", text=json.dumps({"error": str(exc)}))]

    # ── 3. evaluate_answer ─────────────────────────────────────────────────
    if name == "evaluate_answer":
        try:
            result = await evaluation_graph.ainvoke({
                "question":      arguments.get("question", ""),
                "question_type": arguments.get("question_type", "oral"),
                "role":          arguments.get("role", ""),
                "level":         arguments.get("level", "Junior"),
                "user_answer":   arguments.get("user_answer"),
                "user_code":     arguments.get("user_code"),
                "raw_response":  "",
                "output":        None,
                "error":         None,
            })
            return [TextContent(type="text", text=json.dumps(result.get("output", {})))]
        except Exception as exc:
            logger.error("evaluate_answer failed: %s", exc)
            return [TextContent(type="text", text=json.dumps({"error": str(exc)}))]

    # ── 4. search_past_analyses ────────────────────────────────────────────
    if name == "search_past_analyses":
        try:
            results = await search_similar(
                query=arguments.get("query", ""),
                top_k=arguments.get("top_k", 3),
            )
            # Sanitize — FAISS objects may not be directly JSON-serializable
            safe = [
                {
                    "text":     r.get("text", ""),
                    "metadata": r.get("metadata", {}),
                }
                for r in (results or [])
            ]
            return [TextContent(type="text", text=json.dumps(safe))]
        except Exception as exc:
            logger.error("search_past_analyses failed: %s", exc)
            return [TextContent(type="text", text=json.dumps({"error": str(exc)}))]

    # ── 5. generate_revision_notes ─────────────────────────────────────────
    if name == "generate_revision_notes":
        try:
            result = await revision_notes_graph.ainvoke({
                "topic":               arguments.get("topic", ""),
                "depth":               arguments.get("depth", "detailed"),
                "similar_past_notes":  [],
                "raw_notes":           "",
                "output":              None,
                "error":               None,
            })
            return [TextContent(type="text", text=json.dumps(result.get("output") or {}))]
        except Exception as exc:
            logger.error("generate_revision_notes failed: %s", exc)
            return [TextContent(type="text", text=json.dumps({"error": str(exc)}))]

    # ── 6. generate_quiz ───────────────────────────────────────────────────
    if name == "generate_quiz":
        try:
            result = await quiz_graph.ainvoke({
                "topic":         arguments.get("topic", ""),
                "notes_context": arguments.get("notes_context", ""),
                "difficulty":    arguments.get("difficulty", "medium"),
                "count":         arguments.get("count", 10),
                "raw_quiz":      "",
                "output":        None,
                "error":         None,
            })
            return [TextContent(type="text", text=json.dumps(result.get("output") or []))]
        except Exception as exc:
            logger.error("generate_quiz failed: %s", exc)
            return [TextContent(type="text", text=json.dumps({"error": str(exc)}))]

    # ── Unknown tool ───────────────────────────────────────────────────────
    return [TextContent(type="text", text=json.dumps({"error": f"Unknown tool: {name}"}))]


async def run_mcp_server():
    """Run the MCP server over stdio (standard for MCP agents)."""
    async with stdio_server() as (read_stream, write_stream):
        await mcp_server.run(
            read_stream,
            write_stream,
            mcp_server.create_initialization_options(),
        )


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_mcp_server())
