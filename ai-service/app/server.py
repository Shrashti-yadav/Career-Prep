import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router
from app.api.revision_routes import revision_router  # ← NEW
from app.rag.faiss_store import load_index
from app.services.transcription import load_whisper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    app = FastAPI(
        title="AI CareerPrep Service",
        description="Interview assistant + Resume analyzer powered by Gemini + LangGraph + RAG",
        version="2.0.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(router)
    app.include_router(revision_router)  # ← NEW: mounts all /revision/* endpoints

    @app.on_event("startup")
    async def startup():
        #logger.info("Loading Whisper model...")
        #load_whisper()
        logger.info("Loading FAISS index...")
        load_index()
        logger.info("Service ready.")

    return app