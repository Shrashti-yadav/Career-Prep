from langgraph.graph import END, StateGraph

from app.graphs.nodes.revision_state import QuizState, RevisionNotesState
from app.graphs.nodes.revision_nodes import (
    generate_notes_node,
    generate_quiz_node,
    parse_and_store_notes_node,
    parse_quiz_node,
    rag_lookup_notes_node,
)


def build_revision_notes_graph():
    """
    Graph flow:
    rag_lookup → generate_notes → parse_and_store → END
    RAG enriches the prompt; parsed notes are stored back into FAISS.
    """
    g = StateGraph(RevisionNotesState)

    g.add_node("rag_lookup", rag_lookup_notes_node)
    g.add_node("generate_notes", generate_notes_node)
    g.add_node("parse_and_store", parse_and_store_notes_node)

    g.set_entry_point("rag_lookup")
    g.add_edge("rag_lookup", "generate_notes")
    g.add_edge("generate_notes", "parse_and_store")
    g.add_edge("parse_and_store", END)

    return g.compile()


def build_quiz_graph():
    """
    Graph flow:
    generate_quiz → parse_quiz → END
    Simple 2-node graph; no RAG needed since notes context is passed directly.
    """
    g = StateGraph(QuizState)

    g.add_node("generate_quiz", generate_quiz_node)
    g.add_node("parse_quiz", parse_quiz_node)

    g.set_entry_point("generate_quiz")
    g.add_edge("generate_quiz", "parse_quiz")
    g.add_edge("parse_quiz", END)

    return g.compile()


revision_notes_graph = build_revision_notes_graph()
quiz_graph = build_quiz_graph()
