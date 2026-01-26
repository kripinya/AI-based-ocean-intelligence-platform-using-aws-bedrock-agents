from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader

def load_fisheries_data():
   
    loader = DirectoryLoader('./data/fisheries/', glob="./*.pdf", loader_cls=PyPDFLoader)
    docs = loader.load()
    return docs