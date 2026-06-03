import io
import logging
import os
import time  
import tempfile
from pydub import AudioSegment
import google.generativeai as genai

# Import settings if your config has a dedicated model key
# from app.config import settings 

logger = logging.getLogger(__name__)

def load_whisper():
    logger.info("Using cloud-based Gemini audio transcription pipeline.")

async def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    """
    Convert uploaded audio bytes → MP3 temp file → Gemini Cloud Transcription.
    Cleans up the file cleanly on finish.
    """
    temp_path = None
    try:
        audio_in_memory = io.BytesIO(audio_bytes)
        audio_segment = AudioSegment.from_file(audio_in_memory)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            temp_path = tmp.name
            audio_segment.export(temp_path, format="mp3")

        logger.info("Uploading audio asset to Gemini File Service...")
        audio_file = genai.upload_file(path=temp_path, mime_type="audio/mp3")

        # Wait for the file to finish processing in the cloud
        logger.info("Waiting for file processing to complete...")
        while audio_file.state.name == "PROCESSING":
            time.sleep(1)
            audio_file = genai.get_file(audio_file.name)

        if audio_file.state.name == "FAILED":
            raise ValueError("Google Cloud failed to process uploaded audio file.")

        # ✅ DYNAMIC: Fallback to gemini-2.5-flash if variable isn't configured in host
        model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        logger.info(f"Initializing transcription model: {model_name}")
        
        model = genai.GenerativeModel(model_name)

        response = model.generate_content([
            "Listen closely to this audio and provide an exact, clean transcription.",
            audio_file
        ])

        # Clean up the file from Google's servers after processing
        genai.delete_file(audio_file.name)

        return response.text.strip()

    except Exception as e:
        logger.error("Gemini audio transcription failed: %s", e)
        raise RuntimeError(f"Audio transcription engine failure: {e}")

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
