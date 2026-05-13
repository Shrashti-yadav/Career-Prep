import io
import logging
import os
import tempfile

from pydub import AudioSegment

logger = logging.getLogger(__name__)

_whisper_model = None


def load_whisper():
    global _whisper_model
    try:
        import whisper
        logger.info("Loading Whisper model...")
        _whisper_model = whisper.load_model("base.en")
        logger.info("Whisper model loaded successfully")
    except Exception as e:
        logger.error("Failed to load Whisper model: %s", e)


def get_whisper_model():
    return _whisper_model


async def transcribe_audio_bytes(audio_bytes: bytes) -> str:
    """
    Convert uploaded audio bytes → MP3 temp file → Whisper transcription.
    Always cleans up the temp file even on error.
    """
    model = get_whisper_model()
    if not model:
        raise RuntimeError("Whisper model is not loaded")

    temp_path = None
    try:
        audio_in_memory = io.BytesIO(audio_bytes)
        audio_segment = AudioSegment.from_file(audio_in_memory)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as tmp:
            temp_path = tmp.name
            audio_segment.export(temp_path, format="mp3")

        import asyncio
        result = await asyncio.to_thread(_whisper_model.transcribe, temp_path)
        return result["text"].strip()

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
