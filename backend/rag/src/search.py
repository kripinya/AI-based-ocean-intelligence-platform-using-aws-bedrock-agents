from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Global variable for lazy loading
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        print("DEBUG: Lazy loading embeddings...")
        _embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embeddings

def search_context(query, db_path="./chroma_db_fisheries"):
    print(f"DEBUG: Entering search_context with path: {db_path}")
    
    embeddings = get_embeddings()

    # Load the existing database
    print("DEBUG: Loading Chroma DB...")
    db = Chroma(persist_directory=db_path, embedding_function=embeddings)
    print("DEBUG: Chroma DB loaded.")
    
    # Search for top 3 relevant chunks
    print(f"DEBUG: Searching for '{query}'...")
    results = db.similarity_search(query, k=3)
    print(f"DEBUG: Found {len(results)} results.")
    
    # Combine results into a single string
    context = "\n".join([doc.page_content for doc in results])
    return context