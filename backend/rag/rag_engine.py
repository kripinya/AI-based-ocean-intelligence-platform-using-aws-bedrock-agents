import os
from groq import Groq
from rag.src.search import search_context

from dotenv import load_dotenv

# Load env variables
load_dotenv()

# Initialize Groq Client
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    # Fallback or error logging
    print("WARNING: GROQ_API_KEY not found in environment variables.")

client = Groq(api_key=api_key)

def generate_fisheries_insight(user_query, collection="fisheries"):
    """
    Uses Groq with Llama 3 to generate insights based on fisheries data.
    
    Args:
        user_query: Question about fish species, biology, habitat
        collection: Collection to search (default: "fisheries")
    """
    # Get context from fisheries ChromaDB
    context = search_context(
        user_query, 
        db_path="rag/database/chroma_db_fisheries",
        collection_name=None  # Use default collection in fisheries DB
    )
    
    # Build the prompt
    system_prompt = "You are a Marine Biologist Expert. Use the provided scientific context about fish species, biology, and habitats to answer queries."
    full_prompt = f"Context:\n{context}\n\nUser Query: {user_query}"

    # Call Groq API
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_prompt},
        ],
        model="llama-3.1-8b-instant",
    )

    return chat_completion.choices[0].message.content


def generate_overfishing_insight(user_query, search_query=None):
    """
    Uses Groq with Llama 3 to generate insights based on overfishing policy/legal data.
    
    Args:
        user_query: The detailed prompt containing specific data scenario to be answered
        search_query: Optional keywords for retrieval (if different from user_query)
    """
    # Use specific search query if provided, otherwise use the user query
    query_for_search = search_query if search_query else user_query
    
    # Get context from overfishing ChromaDB
    context = search_context(
        query_for_search,
        db_path="rag/database/chroma_db_overfishing",
        collection_name=None  # Use default collection in overfishing DB
    )
    
    # Build the prompt
    system_prompt = "You are a Fisheries Policy and Legal Expert. Use the provided context from FAO reports and legal documents to answer the specific scenario described."
    full_prompt = f"Context:\n{context}\n\nScenario & Query: {user_query}"

    # Call Groq API
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_prompt},
        ],
        model="llama-3.1-8b-instant",
    )

    return chat_completion.choices[0].message.content


# Aliases for compatibility
run_fisheries_agent = generate_fisheries_insight
rag_query = generate_fisheries_insight