from .vectorstore import search_vectors

def retrieve_context(query):
    results = search_vectors(query)
    return " ".join(results)
