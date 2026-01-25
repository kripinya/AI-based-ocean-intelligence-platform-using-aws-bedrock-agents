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

def generate_fisheries_insight(user_query):
    """
    Uses Groq with Llama 3 to generate insights based on local ChromaDB context.
    """
    # 1. Get context from your local PDFs via ChromaDB
    context = search_context(user_query)
    
    # 2. Build the prompt
    system_prompt = "You are a Marine Expert. Use the provided scientific context to answer queries."
    full_prompt = f"Context:\n{context}\n\nUser Query: {user_query}"

    # 3. Call Groq API (using Llama-3-8b for speed)
    chat_completion = client.chat.completions.create(
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": full_prompt},
        ],
        model="llama-3.1-8b-instant",
    )

    return chat_completion.choices[0].message.content

# Aliases for compatibility and user request
run_fisheries_agent = generate_fisheries_insight
rag_query = generate_fisheries_insight