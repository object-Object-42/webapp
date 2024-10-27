import pickle


def fetch_embeddings_2d():
    # Load embeddings from pickle file
    with open("/app/app/api/helper/embeddings_2d.pkl", "rb") as f:
        loaded_documents = pickle.load(f)

    # Initialize lists to store the data
    titles = []
    embeddings = []
    org_name = []
    org_id = []

    # Parse the loaded documents
    for title, (embedding, category, weight) in loaded_documents.items():
        titles.append(title)
        embeddings.append(embedding)
        org_name.append(category)
        org_id.append(weight)

    return {
        "titles": titles,
        "embeddings": embeddings,
        "org_name": org_name,
        "org_id": org_id,
    }
