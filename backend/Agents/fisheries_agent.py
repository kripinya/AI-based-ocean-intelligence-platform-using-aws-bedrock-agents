# from rag.rag_engine import rag_query  <-- Moved inside function for lazy loading

def analyze_fisheries(data):
    over = data["summary"]["overfishing_count"]
    healthy = data["summary"]["healthy_count"]

    ratio = round(over / (over + healthy), 2)

    if ratio > 0.5:
        risk = "High Overfishing Risk"
    else:
        risk = "Moderate Risk"

    from rag.rag_engine import rag_query
    knowledge = rag_query("impact of overfishing on marine ecosystems")

    return {
        "risk": risk,
        "ratio": ratio,
        "rag_knowledge": knowledge
    }
