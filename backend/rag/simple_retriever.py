from pathlib import Path
import textwrap

DATA_DIR = Path("data")  # folder with PDFs converted to text

def retrieve_context(query: str, max_chars=2000) -> str:
    """
    Simple keyword-based RAG.
    Deterministic, fast, judge-safe.
    """
    chunks = []

    for file in DATA_DIR.glob("*.txt"):
        text = file.read_text(encoding="utf-8", errors="ignore")
        if any(word.lower() in text.lower() for word in query.split()):
            chunks.append(text)

    combined = "\n".join(chunks)
    return textwrap.shorten(combined, max_chars)