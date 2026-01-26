
import os
import sys

# Ensure we can import from rag.src
sys.path.append(os.getcwd())

from rag.src.vectorstore import create_vector_store
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader

def build_overfishing_db():
    print("🚀 Starting Overfishing Vector DB Generation...")
    
    # Path to overfishing data (FAO reports, legal documents)
    data_path = "./rag/data/overfishing/"
    
    if not os.path.exists(data_path):
        print(f"❌ Error: Data path {data_path} not found.")
        return
    
    print(f"📂 Loading PDFs from {data_path}...")
    
    # Load all PDFs from overfishing directory
    loader = DirectoryLoader(data_path, glob="./*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()
    
    if not documents:
        print("⚠️ No documents found! Check if PDFs exist.")
        return
    
    print(f"✅ Loaded {len(documents)} documents.")
    
    # Add metadata to identify this as overfishing collection
    for doc in documents:
        doc.metadata["collection"] = "overfishing"
        doc.metadata["source_type"] = "policy_legal"
    
    # Split text into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = text_splitter.split_documents(documents)
    print(f"🧩 Split into {len(chunks)} chunks.")
    
    # Create vector store in separate directory
    create_vector_store(chunks, persist_directory="./chroma_db_overfishing")
    print("🎉 Overfishing Vector Store ready!")

if __name__ == "__main__":
    build_overfishing_db()
