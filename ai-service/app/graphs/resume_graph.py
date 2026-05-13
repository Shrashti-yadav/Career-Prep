# app/graphs/resume_graph.py

from langgraph.graph import END, StateGraph

from app.graphs.state import ResumeState
from app.graphs.nodes.resume_nodes import (
    analyze_resume_node,
    finalize_resume_node,
    rag_lookup_node,
    route_after_llm,
)


def build_resume_graph():
    g = StateGraph(ResumeState)

    g.add_node("rag_lookup", rag_lookup_node)
    g.add_node("analyze", analyze_resume_node)
    g.add_node("finalize", finalize_resume_node)

    g.set_entry_point("rag_lookup")
    g.add_edge("rag_lookup", "analyze")
    g.add_edge("analyze", "finalize")   # ✅ plain edge, no router needed
    g.add_edge("finalize", END)

    return g.compile()

resume_graph = build_resume_graph()