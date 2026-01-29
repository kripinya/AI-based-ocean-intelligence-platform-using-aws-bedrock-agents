from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv("backend/.env")

# -----------------------------
# AWS + RAG imports
# -----------------------------
from backend.aws.agents import (
    invoke_fisheries_agent,
    invoke_overfishing_agent
)
# from backend.rag.simple_retriever import retrieve_context

# -----------------------------
# ML logic imports
# -----------------------------
#from predict import predict_chlorophyll
from backend.predict import predict_chlorophyll
# from backend.sst_predict import forecast_sst_from_csv

# -----------------------------
# App Initialization
# -----------------------------
app = FastAPI(title="Ocean Intelligence AI Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Input Models
# -----------------------------
class ChlorophyllInput(BaseModel):
    depth: float
    salinity: float
    ph: float

class QAQuery(BaseModel):
    question: str

# -----------------------------
# Routes
# -----------------------------

# 1️⃣ Chlorophyll Prediction – Single Input
@app.post("/predict/chlorophyll")
def predict_single(data: ChlorophyllInput):
    prediction = predict_chlorophyll(
        data.depth,
        data.salinity,
        data.ph
    )
    return {"predicted_chlorophyll": prediction}


# # 2️⃣ Chlorophyll Prediction – CSV Upload
# @app.post("/predict/chlorophyll/csv")
# async def predict_chlorophyll_csv(file: UploadFile = File(...)):
#     df = pd.read_csv(file.file)
#     df.columns = df.columns.str.lower().str.strip()

#     required_cols = {"depth", "salinity", "ph"}
#     if not required_cols.issubset(df.columns):
#         return {"error": f"CSV must contain {required_cols}"}

#     predictions = [
#         predict_chlorophyll(row["depth"], row["salinity"], row["ph"])
#         for _, row in df.iterrows()
#     ]

#     return {
#         "depth": df["depth"].tolist(),
#         "salinity": df["salinity"].tolist(),
#         "ph": df["ph"].tolist(),
#         "predicted_chlorophyll": predictions
#     }


# # 3️⃣ SST Forecasting – CSV Upload
# @app.post("/predict/sst/csv")
# async def predict_sst_csv(file: UploadFile = File(...)):
#     df = pd.read_csv(file.file)
#     df.columns = df.columns.str.lower().str.strip()

#     required_cols = {"date", "value"}
#     if not required_cols.issubset(df.columns):
#         return {"error": "CSV must contain date,value columns"}

#     return forecast_sst_from_csv(df)


# 4️⃣ Fisheries Agent – RAG + Bedrock Agent
@app.post("/bedrock/fisheries")
def fisheries_qa(query: QAQuery):
    answer = invoke_fisheries_agent(query.question)
    return {
        "agent": "fisheries",
        "question": query.question,
        "answer": answer
    }


# 5️⃣ Overfishing Agent – RAG + Bedrock Agent
@app.post("/bedrock/overfishing")
def overfishing_qa(query: QAQuery):
    answer = invoke_overfishing_agent(query.question)
    return {
        "agent": "overfishing",
        "question": query.question,
        "answer": answer
    }