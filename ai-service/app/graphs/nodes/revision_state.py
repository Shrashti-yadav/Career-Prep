from typing import Optional, TypedDict


class RevisionNotesState(TypedDict):
    """State for the revision notes generation graph."""
    topic: str
    depth: str                        # "quick" | "detailed"
    similar_past_notes: list[dict]    # RAG context
    raw_notes: str                    # LLM output
    output: Optional[dict]            # parsed notes sections
    error: Optional[str]


class QuizState(TypedDict):
    """State for the quiz generation graph."""
    topic: str
    notes_context: str                # paste revision notes as context (optional)
    difficulty: str                   # "easy" | "medium" | "hard"
    count: int                        # number of questions (default 10)
    raw_quiz: str
    output: Optional[list[dict]]      # list of question objects
    error: Optional[str]
