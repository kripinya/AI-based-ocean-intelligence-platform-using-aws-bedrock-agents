
import os
import sys

# Get backend root directory (3 levels up from rag/scripts/build_overfishing_db.py)
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.abspath(os.path.join(current_dir, "../../../"))

# Add backend root to sys.path so we can import 'rag' and 'services'
if backend_root not in sys.path:
    sys.path.append(backend_root)

from rag.src.vectorstore import create_vector_store
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader

def build_overfishing_db():
    print("🚀 Starting Overfishing Vector DB Generation...")
    print(f"📂 Backend Root: {backend_root}")
    
    # Path to overfishing data (FAO reports, legal documents)
    data_path = os.path.join(backend_root, "rag/data/overfishing/")
    
    if not os.path.exists(data_path):
        print(f"❌ Error: Data path {data_path} not found.")
        return
    
    print(f"📂 Loading PDFs from {data_path}...")
    
    # Load all PDFs from overfishing directory
    # Note: explicit glob path is safer
    loader = DirectoryLoader(data_path, glob="*.pdf", loader_cls=PyPDFLoader)
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
    
    # Create vector store in correct directory
    persist_dir = os.path.join(backend_root, "rag/database/chroma_db_overfishing")
    create_vector_store(chunks, persist_directory=persist_dir)
    print(f"🎉 Overfishing Vector Store ready at {persist_dir}!")

if __name__ == "__main__":
    build_overfishing_db()
