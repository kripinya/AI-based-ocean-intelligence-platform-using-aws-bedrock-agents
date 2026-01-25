from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel

# ML logic imports
from predict import predict_chlorophyll
from sst_predict import forecast_sst_from_csv

# -----------------------------
# App Initialization
# -----------------------------
app = FastAPI(title="Ocean Intelligence ML API")

# Allow frontend access (React/Vite)
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

# -----------------------------
# Routes
# -----------------------------

# 1️⃣ Chlorophyll Prediction – Single Input
@app.post("/predict")
def predict_single(data: ChlorophyllInput):
    prediction = predict_chlorophyll(
        data.depth,
        data.salinity,
        data.ph
    )
    return {
        "predicted_chlorophyll": prediction
    }


# 2️⃣ Chlorophyll Prediction – CSV Upload
@app.post("/predict/csv")
async def predict_chlorophyll_csv(file: UploadFile = File(...)):
    """
    CSV must contain columns:
    depth, salinity, ph
    Optional: chlorophyll (for comparison)
    """
    df = pd.read_csv(file.file)
    df.columns = df.columns.str.lower().str.strip()

    required_cols = {"depth", "salinity", "ph"}
    if not required_cols.issubset(df.columns):
        return {
            "error": f"CSV must contain columns: {required_cols}. Found: {list(df.columns)}"
        }

    predictions = [
        predict_chlorophyll(row["depth"], row["salinity"], row["ph"])
        for _, row in df.iterrows()
    ]

    response = {
        "depth": df["depth"].tolist(),
        "salinity": df["salinity"].tolist(),
        "ph": df["ph"].tolist(),
        "predicted_chlorophyll": predictions
    }

    # Optional: compare with actual chlorophyll if provided
    if "chlorophyll" in df.columns:
        response["actual_chlorophyll"] = df["chlorophyll"].tolist()

    return response


# 3️⃣ SST Forecasting – CSV Upload (OPTION 2 ✅)
@app.post("/predict/sst/csv")
async def predict_sst_csv(file: UploadFile = File(...)):
    """
    SST CSV must contain columns:
    date,value

    Example:
    date,value
    1991-07-01,3.52
    1991-08-01,3.18
    """
    df = pd.read_csv(file.file)
    df.columns = df.columns.str.lower().str.strip()

    required_cols = {"date", "value"}
    if not required_cols.issubset(df.columns):
        return {
            "error": f"SST CSV must contain columns: {required_cols}. Found: {list(df.columns)}"
        }

    result = forecast_sst_from_csv(df)
    return result


# 4️⃣ Helper Endpoint (for frontend clarity)
@app.get("/predict/sst")
def sst_info():
    return {
        "message": "Upload SST CSV to /predict/sst/csv with columns: date,value"
    }