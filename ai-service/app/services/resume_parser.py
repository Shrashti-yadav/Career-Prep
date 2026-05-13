import logging

import fitz
from docx import Document

logger = logging.getLogger(__name__)


def extract_resume_text(file_path: str) -> str:
    """
    Extract plain text from a PDF or DOCX file.
    fitz.open() uses context manager to prevent file handle leaks.
    """
    text = ""
    try:
        if file_path.endswith(".pdf"):
            with fitz.open(file_path) as pdf:
                for page in pdf:
                    text += page.get_text()
        elif file_path.endswith(".docx"):
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
        else:
            logger.warning("Unsupported file type: %s", file_path)
    except Exception as e:
        logger.error("Failed to extract resume text from %s: %s", file_path, e)

    return text.strip()
