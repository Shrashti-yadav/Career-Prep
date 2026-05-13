import json
import logging
import os
import pickle
from datetime import datetime
from typing import Optional

import numpy as np

from app.config import settings
from app.services.llm_client import embed_text

logger = logging.getLogger(__name__)

# In-memory store: list of {"id", "text", "metadata", "embedding"}
_documents: list[dict] = []
_index = None  # faiss.IndexFlatL2 loaded lazily


def _get_index(dim: int = 768):
    global _index
    if _index is None:
        try:
            import faiss
            _index = faiss.IndexFlatL2(dim)
        except ImportError:
            logger.error("faiss-cpu not installed. Run: pip install faiss-cpu")
            raise
    return _index


def _index_path() -> str:
    os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)
    return os.path.join(settings.FAISS_INDEX_PATH, "index.faiss")


def _docs_path() -> str:
    os.makedirs(settings.FAISS_INDEX_PATH, exist_ok=True)
    return os.path.join(settings.FAISS_INDEX_PATH, "docs.pkl")


def load_index():
    """Load persisted FAISS index and document store from disk."""
    global _documents, _index
    try:
        import faiss
        if os.path.exists(_index_path()) and os.path.exists(_docs_path()):
            _index = faiss.read_index(_index_path())
            with open(_docs_path(), "rb") as f:
                _documents = pickle.load(f)
            logger.info("FAISS index loaded: %d documents", len(_documents))
    except Exception as e:
        logger.warning("Could not load FAISS index: %s", e)


def save_index():
    """Persist FAISS index and document store to disk."""
    try:
        import faiss
        if _index is not None:
            faiss.write_index(_index, _index_path())
            with open(_docs_path(), "wb") as f:
                pickle.dump(_documents, f)
    except Exception as e:
        logger.error("Failed to save FAISS index: %s", e)


async def add_document(text: str, metadata: dict) -> str:
    """Embed text and add to FAISS index. Returns document ID."""
    embedding = await embed_text(text)
    vector = np.array([embedding], dtype=np.float32)

    idx = _get_index(len(embedding))
    idx.add(vector)

    doc_id = f"doc_{len(_documents)}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    _documents.append({"id": doc_id, "text": text, "metadata": metadata})

    save_index()
    logger.info("Document added to RAG store: %s", doc_id)
    return doc_id


async def search_similar(query: str, top_k: int = 3) -> list[dict]:
    """
    Search FAISS for top_k most similar past documents.
    Returns list of {text, metadata, score}.
    """
    if not _documents:
        return []

    embedding = await embed_text(query)
    vector = np.array([embedding], dtype=np.float32)

    idx = _get_index(len(embedding))
    distances, indices = idx.search(vector, min(top_k, len(_documents)))

    results = []
    for dist, i in zip(distances[0], indices[0]):
        if i < len(_documents):
            results.append({
                "text": _documents[i]["text"],
                "metadata": _documents[i]["metadata"],
                "score": float(dist),
            })
    return results
