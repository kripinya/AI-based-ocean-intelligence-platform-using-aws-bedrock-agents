import chromadb
from .embedding import get_embeddings

client = chromadb.Client()
collection = client.get_or_create_collection("marine_rag")

def add_documents(docs):
    embeddings = get_embeddings(docs)

    for i, doc in enumerate(docs):
        collection.add(
            ids=[str(i)],
            documents=[doc],
            embeddings=[embeddings[i]]
        )

def search_vectors(query):
    query_embedding = get_embeddings([query])[0]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=2
    )

    return results["documents"][0]
