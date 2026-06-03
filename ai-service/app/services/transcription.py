import io
import logging
import os
import time
import tempfile
from pydub import AudioSegment
from google import genai

logger = logging.getLogger(__name__)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def load_whisper():
    logger.info("Using cloud-based Gemini audio transcription pipeline.")

async def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    temp_path = None
    try:
        audio_in_memory = io.BytesIO(audio_bytes)
        audio_segment = AudioSegment.from_file(audio_in_memory)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            temp_path = tmp.name
            audio_segment.export(temp_path, format="mp3")

        logger.info("Uploading audio asset to Gemini File Service...")
        audio_file = client.files.upload(
            file=temp_path,
            config={"mime_type": "audio/mp3"}
        )

        logger.info("Waiting for file processing to complete...")
        while audio_file.state.name == "PROCESSING":
            time.sleep(1)
            audio_file = client.files.get(name=audio_file.name)

        if audio_file.state.name == "FAILED":
            raise ValueError("Google Cloud failed to process uploaded audio file.")

        model_name = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        logger.info(f"Initializing transcription model: {model_name}")

        response = client.models.generate_content(
            model=model_name,
            contents=[
                "Listen closely to this audio and provide an exact, clean transcription.",
                audio_file
            ]
        )

        client.files.delete(name=audio_file.name)

        return response.text.strip()

    except Exception as e:
        logger.error("Gemini audio transcription failed: %s", e)
        raise RuntimeError(f"Audio transcription engine failure: {e}")

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)