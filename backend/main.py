from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel

# ML logic imports
from predict import predict_chlorophyll
from sst_predict import forecast_sst_from_csv
# fish_classifier imports moved to lazy loading (only when endpoint is called)
# This speeds up server reload significantly

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
# Startup Event
# -----------------------------
# Commented out to prevent server hanging on startup
# The fish classifier model will load lazily on first use
# @app.on_event("startup")
# async def startup_event():
#     """Load ML models at application startup"""
#     print("🚀 Loading ML models...")
#     load_model_and_labels()
#     print("✅ All models loaded successfully!")

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



# AGENTIC ENDPOINT 
# -----------------------------
from Agents.fisheries_agent import analyze_fisheries

@app.get("/agentic/fisheries")
def agentic_fisheries():
    dummy_data = {
        "summary": {
            "overfishing_count": 128,
            "healthy_count": 112
        }
    }

    result = analyze_fisheries(dummy_data)

    return {
        "agentic_decision": result
    }
# 5️⃣ Overfishing Monitor - GET (Mock Data)
@app.get("/overfishing_monitor")
def get_overfishing_data():
    """
    Returns sample overfishing monitoring data for testing.
    In production, use POST endpoint with CSV upload.
    """
    from overfishing_analyze import get_sample_overfishing_data
    return get_sample_overfishing_data()


# 6️⃣ Overfishing Monitor - CSV Upload
@app.post("/overfishing_monitor")
async def analyze_overfishing_csv(file: UploadFile = File(...)):
    """
    Analyze overfishing from CSV data.
    CSV must contain columns: Date, Stock_Volume, Catch_Volume
    """
    from overfishing_analyze import analyze_overfishing_from_csv

    try:
        df = pd.read_csv(file.file)
        return analyze_overfishing_from_csv(df=df)
    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"Failed to process CSV: {str(e)}"}


# 7️⃣ Fish Species Classification - Image Upload
@app.post("/predict/fish_species")
async def classify_fish_species(file: UploadFile = File(...)):
    """
    Classify fish species from an uploaded image.
    
    Accepts: JPG, PNG, WebP, and other common image formats
    
    Returns:
        {
            "species": str,
            "confidence": float (0-100),
            "top_predictions": dict (top 3 predictions with confidence)
        }
    """
    from PIL import Image
    import io
    
    try:
        # Lazy import to avoid loading heavy PyTorch on every reload
        from fish_classifier import predict_fish_species
        
        # Read image file
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Make prediction
        result = predict_fish_species(image)
        
        # RAG Integration: Get Conservation Status
        try:
            from rag.rag_engine import run_fisheries_agent
            species = result.get("species", "Unknown")
            if species and species != "Unknown" and species != "Error":
                print(f"🔎 Running RAG for: {species}")
                insight = run_fisheries_agent(f"What is the conservation status, habitat, and key characteristics of {species}?")
                result["conservation_status"] = insight
            else:
                result["conservation_status"] = "No species identified for conservation search."
        except Exception as e:
            error_msg = str(e)
            print(f"⚠️ RAG Agent Error: {error_msg}")
            result["conservation_status"] = f"Error retrieving status: {error_msg}"

        return result
        
    except Exception as e:
        return {
            "error": f"Failed to classify image: {str(e)}",
            "species": "Error",
            "confidence": 0.0
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
