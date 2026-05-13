from typing import Any, Optional, TypedDict


class ResumeState(TypedDict):
    """State for the resume analysis graph."""
    # inputs
    resume_text: str
    jd_text: str
    role: str
    # intermediate
    ats_score: float
    similar_past_analyses: list[dict]
    raw_llm_response: str
    # human-in-loop review fields
    human_approved: Optional[bool]
    human_notes: Optional[str]
    # final output
    output: Optional[dict]
    error: Optional[str]


class InterviewState(TypedDict):
    """State for the question generation graph."""
    role: str
    level: str
    count: int
    interview_type: str
    questions: list[str]
    error: Optional[str]


class EvaluationState(TypedDict):
    """State for the answer evaluation graph."""
    question: str
    question_type: str
    role: str
    level: str
    user_answer: Optional[str]
    user_code: Optional[str]
    raw_response: str
    output: Optional[dict]
    error: Optional[str]
