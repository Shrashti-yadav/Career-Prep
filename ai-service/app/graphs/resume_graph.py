# app/graphs/resume_graph.py

from langgraph.graph import END, StateGraph

from app.graphs.state import ResumeState
from app.graphs.nodes.resume_nodes import (
    analyze_resume_node,
    explainable_rag_node,
    finalize_resume_node,
    rag_lookup_node,
    self_rag_node,
)


def build_resume_graph():
    """
    Pipeline:

        rag_lookup
            │
            ▼
         analyze          ← first-pass LLM (uses external RAG context)
            │
            ▼
        self_rag          ← adversarial re-evaluation of its own output
            │
            ▼
      explainable_rag     ← generates score breakdown + justification
            │
            ▼
         finalize         ← parse JSON, attach scores, store in FAISS
            │
            ▼
           END
    """
    g = StateGraph(ResumeState)

    g.add_node("rag_lookup",       rag_lookup_node)
    g.add_node("analyze",          analyze_resume_node)
    g.add_node("self_rag",         self_rag_node)
    g.add_node("explainable_rag",  explainable_rag_node)
    g.add_node("finalize",         finalize_resume_node)

    g.set_entry_point("rag_lookup")
    g.add_edge("rag_lookup",      "analyze")
    g.add_edge("analyze",         "self_rag")
    g.add_edge("self_rag",        "explainable_rag")
    g.add_edge("explainable_rag", "finalize")
    g.add_edge("finalize",        END)

    return g.compile()


resume_graph = build_resume_graph()
