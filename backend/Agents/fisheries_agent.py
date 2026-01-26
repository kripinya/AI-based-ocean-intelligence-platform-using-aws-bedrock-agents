"""
Fisheries Agent - Handles fish species classification and biological information.

This agent:
1. Analyzes fish species from image classification results
2. Performs RAG search limited to fisheries biology/habitat documents
3. Returns species details, habitat, conservation status
"""

from rag.rag_engine import generate_fisheries_insight


def analyze_fish_species(species_name: str) -> dict:
    """
    Get detailed biological information about a fish species.
    
    Args:
        species_name: Name of the fish species
        
    Returns:
        Dictionary with species information and RAG insights
    """
    print(f"🐟 Analyzing species: {species_name}")
    print("🔍 Searching fisheries biology database...")
    
    # Build query for RAG (limited to fisheries collection)
    query = f"""
    What is the conservation status, habitat, key biological characteristics, 
    and ecological importance of {species_name}? Include information about 
    their distribution, behavior, and any threats they face.
    """
    
    try:
        # Get insights from fisheries collection only
        rag_insights = generate_fisheries_insight(query)
        
        return {
            "species": species_name,
            "biological_info": rag_insights,
            "data_source": "fisheries_biology_collection"
        }
    except Exception as e:
        print(f"❌ RAG query failed: {e}")
        return {
            "species": species_name,
            "biological_info": f"Error retrieving species information: {str(e)}",
            "data_source": "error"
        }


def classify_fish(image_result: dict) -> dict:
    """
    Process fish classification results and enrich with biological data.
    
    Args:
        image_result: Dictionary from fish classifier containing:
            - species: Identified species name
            - confidence: Confidence score
            - top_predictions: Top 3 predictions
            
    Returns:
        Dictionary with classification results and biological insights
    """
    species = image_result.get("species", "Unknown")
    confidence = image_result.get("confidence", 0)
    
    response = {
        "classification": {
            "species": species,
            "confidence": confidence,
            "top_predictions": image_result.get("top_predictions", {})
        }
    }
    
    # Only fetch biological info if species was identified with reasonable confidence
    if species and species != "Unknown" and species != "Error" and confidence > 30:
        biological_data = analyze_fish_species(species)
        response["biological_data"] = biological_data
    else:
        response["biological_data"] = {
            "species": species,
            "biological_info": "Species not identified with sufficient confidence for biological lookup.",
            "data_source": "none"
        }
    
    return response

