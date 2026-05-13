import ast
import json
import re


def extract_json(text: str) -> dict:
    """
    Robustly parse a JSON object from a raw LLM response.
    Strips markdown fences, removes non-ASCII noise, falls back to ast.literal_eval.
    """
    text = text.replace("```json", "").replace("```", "").strip()
    text = re.sub(r"[^\x00-\x7F]+", " ", text)

    start = text.find("{")
    end = text.rfind("}") + 1

    if start == -1 or end == 0:
        raise ValueError(f"No JSON object found. Raw (first 300 chars): {text[:300]}")

    raw = text[start:end]

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    try:
        result = ast.literal_eval(raw)
        if isinstance(result, dict):
            return result
        raise ValueError("ast.literal_eval did not return a dict")
    except (ValueError, SyntaxError) as e:
        raise ValueError(
            f"Failed to parse JSON: {e}\nRaw snippet: {raw[:300]}"
        ) from e
