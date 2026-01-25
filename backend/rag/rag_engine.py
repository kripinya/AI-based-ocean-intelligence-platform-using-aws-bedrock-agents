from rag.src.data_loader import load_documents
from rag.src.vectorstore import add_documents
from rag.src.search import retrieve_context

docs = load_documents()
add_documents(docs)

def rag_query(query):
    return retrieve_context(query)
