import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Server
    PORT: int = int(os.getenv("AI_SERVICE_PORT", 8000))
    MCP_PORT: int = int(os.getenv("MCP_SERVER_PORT", 8001))

    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash")
    GEMINI_EMBEDDING_MODEL: str = os.getenv("GEMINI_EMBEDDING_MODEL", "models/gemini-embedding-001")

    # RAG / FAISS
    FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "data/faiss_index")

    # Limits
    MAX_RESUME_CHARS: int = 8000
    MAX_JD_CHARS: int = 4000

    ALLOWED_RESUME_TYPES: tuple = (
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    )

    def validate(self):
        if not self.GEMINI_API_KEY:
            raise EnvironmentError("Missing GEMINI_API_KEY in .env")


settings = Settings()
settings.validate()
