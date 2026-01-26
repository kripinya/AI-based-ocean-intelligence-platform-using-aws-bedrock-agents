import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

def create_vector_store(chunks, persist_directory="./chroma_db_fisheries", collection_name=None):
    """
    Initializes embeddings and creates a persistent ChromaDB vector store.
    
    Args:
        chunks: Document chunks to embed
        persist_directory: Directory to save the vector store
        collection_name: Optional collection name for organizing data
    """
    # Using a fast, local HuggingFace model for embeddings
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    # Creating the vector database from document chunks
    kwargs = {
        "documents": chunks,
        "embedding": embeddings,
        "persist_directory": persist_directory
    }
    
    if collection_name:
        kwargs["collection_name"] = collection_name
    
    vector_db = Chroma.from_documents(**kwargs)
    
    print(f"Vector store created and saved at: {persist_directory}")
    if collection_name:
        print(f"Collection name: {collection_name}")
    return vector_db

def load_vector_store(persist_directory="./chroma_db_fisheries", collection_name=None):
    """
    Loads an existing vector store for querying.
    
    Args:
        persist_directory: Directory where the vector store is saved
        collection_name: Optional collection name to load specific collection
    """
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    
    if os.path.exists(persist_directory):
        kwargs = {
            "persist_directory": persist_directory,
            "embedding_function": embeddings
        }
        
        if collection_name:
            kwargs["collection_name"] = collection_name
            
        return Chroma(**kwargs)
    else:
        print(f"Error: Vector store directory not found: {persist_directory}")
        return None