from fastapi import FastAPI
from backend.rag.rag_pipeline import answer_question

app = FastAPI()

@app.post("/ask")
def ask(payload: dict):
    question = payload["question"]
    answer = answer_question(question)
    return {"answer": answer}