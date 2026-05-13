from langgraph.graph import END, StateGraph

from app.graphs.state import InterviewState
from app.graphs.nodes.interview_nodes import generate_questions_node


def build_interview_graph():
    g = StateGraph(InterviewState)
    g.add_node("generate", generate_questions_node)
    g.set_entry_point("generate")
    g.add_edge("generate", END)
    return g.compile()


interview_graph = build_interview_graph()
