from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pydantic import BaseModel

# ML logic imports
from services.predict import predict_chlorophyll
from services.sst_predict import forecast_sst_from_csv
# fish_classifier imports moved to lazy loading (only when endpoint is called)
# This speeds up server reload significantly

# -----------------------------
# App Initialization
# -----------------------------
app = FastAPI(title="Ocean Intelligence ML API")

# Allow frontend access (React/Vite + Docker)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:5173",      # Vite dev server
        "http://localhost",            # Docker frontend
        "http://localhost:80",         # Docker frontend explicit port
        "*"                            # Allow all for development
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
@app.post("/api/predict")
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
@app.post("/api/predict/csv")
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
@app.post("/api/predict/sst/csv")
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
@app.get("/api/predict/sst")
def sst_info():
    return {
        "message": "Upload SST CSV to /predict/sst/csv with columns: date,value"
    }



# MULTI-AGENT ORCHESTRATION ENDPOINTS
# -----------------------------
from Agents.orchestrator import orchestrate, auto_route
from Agents.overfishing_agent import analyze_overfishing

@app.post("/api/orchestrate")
async def orchestrate_request(input_type: str, data: dict):
    """
    Multi-agent orchestrator endpoint.
    Routes requests to FisheriesAgent or OverfishingAgent based on input type.
    
    Args:
        input_type: "image", "species_query", "telemetry", "telemetry_batch"
        data: Input data for the agent
    """
    return orchestrate(input_type, data)

@app.post("/api/auto_route")
async def auto_route_request(data: dict):
    """
    Automatically detect input type and route to appropriate agent.
    """
    return auto_route(data)
# 5️⃣ Overfishing Monitor - GET (Mock Data)
@app.get("/api/overfishing_monitor")
def get_overfishing_data():
    """
    Returns sample overfishing monitoring data for testing.
    In production, use POST endpoint with CSV upload.
    """
    from services.overfishing_analyze import get_sample_overfishing_data
    return get_sample_overfishing_data()


# 6️⃣ Overfishing Monitor - CSV Upload (with Multi-Agent Integration)
@app.post("/api/overfishing_monitor")
async def analyze_overfishing_csv(file: UploadFile = File(...)):
    """
    Analyze overfishing from CSV data using OverfishingAgent.
    CSV must contain columns: Date, Stock_Volume, Catch_Volume
    
    This endpoint now uses the multi-agent system for enhanced insights.
    """
    from services.overfishing_analyze import analyze_overfishing_from_csv

    try:
        df = pd.read_csv(file.file)
        
        # Get visualization data
        viz_data = analyze_overfishing_from_csv(df=df)
        
        # Use OverfishingAgent for AI-powered insights on the MOST SEVERE overfishing instance
        agent_insights = None
        max_violation_margin = -1
        
        for _, row in df.iterrows():
            telemetry = {
                "date": row.get("date", row.get("Date", "Unknown")),
                "stock_volume": row.get("stock_volume", row.get("Stock_Volume", 0)),
                "catch_volume": row.get("catch_volume", row.get("Catch_Volume", 0))
            }
            
            # Use quick local check before calling full agent to save time
            stock = telemetry["stock_volume"]
            catch = telemetry["catch_volume"]
            threshold = stock * 0.2
            
            if catch > threshold:
                violation_margin = catch - threshold
                
                # Update if this is the most severe violation found so far
                if violation_margin > max_violation_margin:
                    max_violation_margin = violation_margin
                    # Analyze this specific severe instance with the agent
                    agent_insights = analyze_overfishing(telemetry)
        
        # Combine visualization data with agent insights
        return {
            "visualization": viz_data,
            "agent_analysis": agent_insights
        }
        
    except ValueError as e:
        return {"error": str(e)}
    except Exception as e:
        return {"error": f"Failed to process CSV: {str(e)}"}


# 7️⃣ eDNA Analysis - Sequence Upload with GenAI
@app.post("/api/v1/edna/analyze")
async def analyze_edna_sequence(file: UploadFile = File(...)):
    """
    Analyze eDNA sequence from FASTA/FASTQ file using GenAI.
    
    Accepts: .fasta, .fastq, .fa, .fq files
    
    Returns:
        {
            "species_scientific": str,
            "species_common": str,
            "confidence": float (0-100),
            "genetic_markers": list,
            "invasive_status": str,
            "characteristics": dict,
            "ecological_role": str,
            "interesting_facts": list
        }
    """
    from services.edna_analyzer import analyze_edna_file
    
    try:
        # Read file content
        file_content = await file.read()
        file_text = file_content.decode('utf-8')
        
        # Analyze eDNA sequence
        analysis = analyze_edna_file(file_text)
        
        return {
            "success": True,
            "analysis": analysis,
            "detected_species": [{
                "species": analysis.get("species_common", "Unknown"),
                "confidence": analysis.get("confidence", 0),
                "invasive": analysis.get("invasive_status") == "invasive",
                "sequenceId": analysis.get("sequence_metadata", {}).get("sequence_id", "Unknown")
            }],
            "invasive_species": [{
                "species": analysis.get("species_common", "Unknown")
            }] if analysis.get("invasive_status") == "invasive" else []
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to analyze eDNA sequence: {str(e)}"
        }


class ChatRequest(BaseModel):
    species_data: dict
    question: str

@app.post("/api/v1/edna/chat")
async def chat_about_edna_species(request: ChatRequest):
    """
    Interactive chatbot for asking questions about analyzed species.
    
    Args:
        request: ChatRequest object containing species_data and question
        
    Returns:
        {
            "question": str,
            "answer": str,
            "conversation_length": int
        }
    """
    from services.edna_analyzer import chat_with_species
    
    try:
        response = chat_with_species(request.species_data, request.question)
        return {
            "success": True,
            **response
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Chat error: {str(e)}"
        }


# 8️⃣ Fish Species Classification - Image Upload (with Multi-Agent Integration)
@app.post("/api/predict/fish_species")
async def classify_fish_species(file: UploadFile = File(...)):
    """
    Classify fish species from an uploaded image using FisheriesAgent.
    
    Accepts: JPG, PNG, WebP, and other common image formats
    
    Returns:
        {
            "species": str,
            "confidence": float (0-100),
            "top_predictions": dict (top 3 predictions with confidence),
            "biological_data": dict (from FisheriesAgent)
        }
    """
    from PIL import Image
    import io
    
    try:
        # Lazy import to avoid loading heavy PyTorch on every reload
        from services.fish_classifier import predict_fish_species
        from Agents.fisheries_agent import classify_fish
        
        # Read image file
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Make prediction using fish classifier
        classifier_result = predict_fish_species(image)
        
        # Use FisheriesAgent to enrich with biological data
        try:
            agent_result = classify_fish(classifier_result)
            return agent_result
        except Exception as e:
            print(f"⚠️ FisheriesAgent Error: {e}")
            # Fallback to classifier result only
            return {
                "classification": classifier_result,
                "biological_data": {
                    "error": f"Failed to retrieve biological data: {str(e)}"
                }
            }
        
    except Exception as e:
        return {
            "error": f"Failed to classify image: {str(e)}",
            "species": "Error",
            "confidence": 0.0
        }


# 9️⃣ AWS Bedrock Agents - Fisheries Intelligence
class AgentQuery(BaseModel):
    query: str

@app.post("/api/aws/fisheries-agent")
async def query_fisheries_bedrock_agent(request: AgentQuery):
    """
    Query the AWS Bedrock Fisheries Agent for AI-powered fisheries insights.
    
    Args:
        query: Natural language question about fisheries, fish species, or stock management
        
    Returns:
        {
            "success": bool,
            "response": str,
            "agent": "fisheries"
        }
    
    Example queries:
        - "What are the best practices for sustainable tuna fishing?"
        - "Analyze the health indicators for this fish species"
        - "What conservation measures should be taken for overfished stocks?"
    """
    try:
        from aws.agents import invoke_fisheries_agent
        
        response = invoke_fisheries_agent(request.query)
        
        return {
            "success": True,
            "response": response,
            "agent": "fisheries",
            "query": request.query
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Fisheries Agent error: {str(e)}",
            "agent": "fisheries"
        }


@app.post("/api/aws/overfishing-agent")
async def query_overfishing_bedrock_agent(request: AgentQuery):
    """
    Query the AWS Bedrock Overfishing Agent for conservation insights.
    
    Args:
        query: Natural language question about overfishing patterns or conservation
        
    Returns:
        {
            "success": bool,
            "response": str,
            "agent": "overfishing"
        }
    
    Example queries:
        - "What are the signs of overfishing in this region?"
        - "Recommend conservation strategies for depleted fish stocks"
        - "Analyze the sustainability of current catch rates"
    """
    try:
        from aws.agents import invoke_overfishing_agent
        
        response = invoke_overfishing_agent(request.query)
        
        return {
            "success": True,
            "response": response,
            "agent": "overfishing",
            "query": request.query
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Overfishing Agent error: {str(e)}",
            "agent": "overfishing"
        }


@app.get("/api/aws/agents/status")
async def check_aws_agents_status():
    """
    Check if AWS Bedrock Agents are properly configured.
    
    Returns configuration status and available agents.
    """
    try:
        from aws.config import (
            FISHERIES_AGENT_ID,
            FISHERIES_AGENT_ALIAS_ID,
            OVERFISHING_AGENT_ID,
            OVERFISHING_AGENT_ALIAS_ID,
            AWS_REGION
        )
        
        fisheries_configured = bool(FISHERIES_AGENT_ID and FISHERIES_AGENT_ALIAS_ID)
        overfishing_configured = bool(OVERFISHING_AGENT_ID and OVERFISHING_AGENT_ALIAS_ID)
        
        return {
            "aws_region": AWS_REGION,
            "agents": {
                "fisheries": {
                    "configured": fisheries_configured,
                    "agent_id": FISHERIES_AGENT_ID if fisheries_configured else None,
                    "status": "ready" if fisheries_configured else "not configured"
                },
                "overfishing": {
                    "configured": overfishing_configured,
                    "agent_id": OVERFISHING_AGENT_ID if overfishing_configured else None,
                    "status": "ready" if overfishing_configured else "not configured"
                }
            },
            "overall_status": "operational" if (fisheries_configured and overfishing_configured) else "partial"
        }
    except Exception as e:
        return {
            "error": f"Configuration check failed: {str(e)}",
            "overall_status": "error"
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
