from backend.rag.retriever import retrieve_context
from backend.aws.bedrock_client import call_bedrock

def answer_question(question: str) -> str:
    context = retrieve_context(question)

    prompt = f"""
You are a fisheries and overfishing expert.

Context:
{context}

Question:
{question}

Answer using ONLY the context above.
"""

    return call_bedrock(prompt)