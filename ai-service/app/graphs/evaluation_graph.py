from langgraph.graph import END, StateGraph

from app.graphs.state import EvaluationState
from app.graphs.nodes.evaluation_nodes import evaluate_answer_node, parse_evaluation_node


def build_evaluation_graph():
    g = StateGraph(EvaluationState)
    g.add_node("evaluate", evaluate_answer_node)
    g.add_node("parse", parse_evaluation_node)
    g.set_entry_point("evaluate")
    g.add_edge("evaluate", "parse")
    g.add_edge("parse", END)
    return g.compile()


evaluation_graph = build_evaluation_graph()
