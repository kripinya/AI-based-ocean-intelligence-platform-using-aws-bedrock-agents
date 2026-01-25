from agents.fisheries_agent import analyze_fisheries

def orchestrate(input_type, data):
    if input_type == "fisheries":
        return analyze_fisheries(data)
    
    return {"error": "Unknown domain"}
