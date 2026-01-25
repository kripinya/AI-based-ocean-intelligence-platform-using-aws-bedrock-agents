from fastapi import FastAPI, UploadFile, File
<<<<<<< HEAD
from fastapi.middleware.cors import CORSMiddleware
=======
from backend.sst_predict import get_sst_forecast
>>>>>>> 1573a12 (Add SST prediction endpoint, ML inference API, CSV batch prediction, and Docker setup)
import pandas as pd
from pydantic import BaseModel
from backend.predict import predict_chlorophyll

app = FastAPI(title="Ocean Intelligence ML API")

# Add CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

class ChlorophyllInput(BaseModel):
    depth: float
    salinity: float
    ph: float

@app.post("/predict")
def predict(data: ChlorophyllInput):
    result = predict_chlorophyll(
        data.depth,
        data.salinity,
        data.ph
    )
    return {
        "predicted_chlorophyll": result
    }

#NEW endpoint to handle batch predictions via file upload
@app.post("/predict/csv")
async def predict_from_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    
    # Normalize column names to lowercase and strip whitespace
    df.columns = df.columns.str.lower().str.strip()
    
    print(f"DEBUG: Columns found in CSV: {list(df.columns)}")

    required_cols = {"depth", "salinity", "ph"}
    if not required_cols.issubset(df.columns):
        return {
            "error": f"CSV must contain depth, salinity, and ph columns. Found: {list(df.columns)}"
        }

    predictions = []

    for _, row in df.iterrows():
        pred = predict_chlorophyll(
            row["depth"],
            row["salinity"],
            row["ph"]
        )
        predictions.append(pred)

    response = {
        "depth": df["depth"].tolist(),
        "salinity": df["salinity"].tolist(),
        "ph": df["ph"].tolist(),
        "predicted_chlorophyll": predictions
    }

    # Optional: include actual chlorophyll if present
    if "chlorophyll" in df.columns:
        response["actual_chlorophyll"] = df["chlorophyll"].tolist()

    return response
@app.get("/predict/sst")
def predict_sst():
    return get_sst_forecast()