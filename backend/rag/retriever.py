from chromadb import Client
from chromadb.config import Settings

client = Client(Settings(persist_directory="chroma_db"))
collection = client.get_collection("fisheries")

def retrieve_context(query: str, k: int = 4) -> str:
    results = collection.query(
        query_texts=[query],
        n_results=k
    )

    docs = results["documents"][0]
    return "\n\n".join(docs)