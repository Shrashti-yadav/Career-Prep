import asyncio
import logging

from google import genai
from google.genai import types
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import settings

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.GEMINI_API_KEY)

print("USING MODEL:", settings.GEMINI_MODEL)


@retry(wait=wait_exponential(min=2, max=20), stop=stop_after_attempt(3), reraise=True)
async def call_llm(prompt: str, temperature: float = 0.4, json_mode: bool = False) -> str:
    await asyncio.sleep(0.5)

    config = types.GenerateContentConfig(
        temperature=temperature,
        response_mime_type="application/json" if json_mode else "text/plain",
        max_output_tokens=8192,
    )

    response = await asyncio.to_thread(
        client.models.generate_content,
        model=settings.GEMINI_MODEL,
        contents=prompt,
        config=config,
    )

    if not response or not response.text:
        raise ValueError("Empty response received from Gemini")

    return response.text.strip()


async def embed_text(text: str) -> list[float]:
    result = await asyncio.to_thread(
        client.models.embed_content,
        model=settings.GEMINI_EMBEDDING_MODEL,
        contents=text,
    )
    return result.embeddings[0].values