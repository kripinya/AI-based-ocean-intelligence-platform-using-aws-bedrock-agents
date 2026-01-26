"""
Overfishing Agent - Analyzes telemetry data for overfishing detection.

This agent:
1. Parses JSON/CSV telemetry data (Stock Volume vs. Catch Volume)
2. Detects overfishing when Catch Volume exceeds 20% of Stock Volume
3. Performs RAG search limited to overfishing policy/legal documents
4. Returns legal consequences, sustainability tips, and alternative species
"""

from rag.rag_engine import generate_overfishing_insight


def analyze_overfishing(telemetry_data: dict) -> dict:
    """
    Analyze overfishing from telemetry data.
    
    Args:
        telemetry_data: Dictionary containing:
            - date: Date of measurement
            - stock_volume: Total fish stock volume
            - catch_volume: Volume of fish caught
            
    Returns:
        Dictionary with analysis results and RAG insights if overfishing detected
    """
    # Extract data
    date = telemetry_data.get("date", "Unknown")
    stock_volume = telemetry_data.get("stock_volume", 0)
    catch_volume = telemetry_data.get("catch_volume", 0)
    
    # Calculate overfishing threshold (20% of stock)
    threshold = stock_volume * 0.2
    
    # Determine if overfishing is occurring
    is_overfishing = catch_volume > threshold
    
    # Calculate percentage
    if stock_volume > 0:
        catch_percentage = round((catch_volume / stock_volume) * 100, 2)
    else:
        catch_percentage = 0
    
    # Base response
    response = {
        "date": date,
        "stock_volume": stock_volume,
        "catch_volume": catch_volume,
        "threshold": round(threshold, 2),
        "catch_percentage": catch_percentage,
        "is_overfishing": is_overfishing,
        "status": "OVERFISHING DETECTED" if is_overfishing else "HEALTHY FISHING"
    }
    
    # If overfishing detected, perform RAG search for legal/sustainability insights
    if is_overfishing:
        print(f"⚠️ Overfishing detected on {date}: {catch_volume} > {threshold}")
        print("🔍 Searching overfishing policy database for insights...")
        
        # Build comprehensive query for RAG
        query = f"""
        What are the legal consequences and regulations for overfishing when catch volume 
        exceeds sustainable thresholds? What sustainability practices should be followed? 
        What are alternative species that can be harvested instead?
        """
        
        try:
            # Get insights from overfishing collection
            rag_insights = generate_overfishing_insight(query)
            
            response["rag_insights"] = rag_insights
            response["recommendations"] = [
                "Reduce catch volume immediately",
                "Review FAO sustainable fishing guidelines",
                "Consider alternative species with healthier stock levels",
                "Implement catch monitoring systems"
            ]
        except Exception as e:
            print(f"❌ RAG query failed: {e}")
            response["rag_insights"] = f"Error retrieving policy insights: {str(e)}"
            response["recommendations"] = [
                "Reduce catch volume immediately",
                "Consult local fisheries management authority"
            ]
    else:
        response["message"] = "Fishing levels are within sustainable limits."
    
    return response


def analyze_overfishing_batch(telemetry_list: list) -> dict:
    """
    Analyze multiple telemetry data points.
    
    Args:
        telemetry_list: List of telemetry dictionaries
        
    Returns:
        Dictionary with batch analysis results
    """
    results = []
    overfishing_count = 0
    healthy_count = 0
    
    for data in telemetry_list:
        result = analyze_overfishing(data)
        results.append(result)
        
        if result["is_overfishing"]:
            overfishing_count += 1
        else:
            healthy_count += 1
    
    return {
        "total_analyzed": len(telemetry_list),
        "overfishing_count": overfishing_count,
        "healthy_count": healthy_count,
        "overfishing_ratio": round(overfishing_count / len(telemetry_list), 2) if telemetry_list else 0,
        "results": results
    }
