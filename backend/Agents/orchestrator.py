"""
Multi-Agent Orchestrator - Routes requests to appropriate specialized agents.

Routing Logic:
- Image inputs → FisheriesAgent (fish classification + biology)
- JSON/CSV telemetry data → OverfishingAgent (stock analysis + policy)
"""

from datetime import datetime
from Agents.fisheries_agent import classify_fish, analyze_fish_species
from Agents.overfishing_agent import analyze_overfishing, analyze_overfishing_batch


def orchestrate(input_type: str, data: dict) -> dict:
    """
    Route input to the appropriate agent based on input type.
    
    Args:
        input_type: Type of input - "image", "telemetry", "species_query"
        data: Input data for the agent
        
    Returns:
        Unified response with agent name, analysis, and insights
    """
    timestamp = datetime.now().isoformat()
    
    # Route to FisheriesAgent for image-based fish classification
    if input_type == "image":
        print("🔀 Routing to FisheriesAgent (fish classification)")
        analysis = classify_fish(data)
        
        return {
            "agent": "FisheriesAgent",
            "input_type": "image",
            "analysis": analysis,
            "timestamp": timestamp
        }
    
    # Route to FisheriesAgent for species information queries
    elif input_type == "species_query":
        print("🔀 Routing to FisheriesAgent (species information)")
        species_name = data.get("species", "Unknown")
        analysis = analyze_fish_species(species_name)
        
        return {
            "agent": "FisheriesAgent",
            "input_type": "species_query",
            "analysis": analysis,
            "timestamp": timestamp
        }
    
    # Route to OverfishingAgent for telemetry data analysis
    elif input_type == "telemetry":
        print("🔀 Routing to OverfishingAgent (overfishing analysis)")
        analysis = analyze_overfishing(data)
        
        return {
            "agent": "OverfishingAgent",
            "input_type": "telemetry",
            "analysis": analysis,
            "timestamp": timestamp
        }
    
    # Route to OverfishingAgent for batch telemetry analysis
    elif input_type == "telemetry_batch":
        print("🔀 Routing to OverfishingAgent (batch analysis)")
        telemetry_list = data.get("telemetry_list", [])
        analysis = analyze_overfishing_batch(telemetry_list)
        
        return {
            "agent": "OverfishingAgent",
            "input_type": "telemetry_batch",
            "analysis": analysis,
            "timestamp": timestamp
        }
    
    # Unknown input type
    else:
        return {
            "error": f"Unknown input type: {input_type}",
            "supported_types": ["image", "species_query", "telemetry", "telemetry_batch"],
            "timestamp": timestamp
        }


def auto_route(data: dict) -> dict:
    """
    Automatically detect input type and route to appropriate agent.
    
    Args:
        data: Input data (will auto-detect type)
        
    Returns:
        Unified response from the appropriate agent
    """
    # Check for telemetry data (has stock_volume and catch_volume)
    if "stock_volume" in data and "catch_volume" in data:
        return orchestrate("telemetry", data)
    
    # Check for batch telemetry data
    elif "telemetry_list" in data:
        return orchestrate("telemetry_batch", data)
    
    # Check for species query
    elif "species" in data and "confidence" not in data:
        return orchestrate("species_query", data)
    
    # Check for image classification result (has species and confidence)
    elif "species" in data and "confidence" in data:
        return orchestrate("image", data)
    
    # Unknown format
    else:
        return {
            "error": "Could not auto-detect input type",
            "hint": "Expected fields: (stock_volume, catch_volume) for telemetry, or (species, confidence) for image classification",
            "received_keys": list(data.keys())
        }

