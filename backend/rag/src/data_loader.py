import os

def load_documents(folder_path=None):
    if folder_path is None:
        # Resolve path: current_file -> src -> rag -> data
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        folder_path = os.path.join(base_dir, "data")
    docs = []
    for file in os.listdir(folder_path):
        if file.endswith(".txt"):
            with open(os.path.join(folder_path, file), "r", encoding="utf-8") as f:
                docs.append(f.read())
    return docs
