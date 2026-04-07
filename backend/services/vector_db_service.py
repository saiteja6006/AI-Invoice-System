from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import uuid

# client = QdrantClient(path="qdrant_data")
def store_embedding_data(*args, **kwargs):
    print("Qdrant disabled in deployment")
    return


def search_similar_data(*args, **kwargs):
    print("Qdrant disabled in deployment")
    return []

COLLECTION_NAME = "invoices"


def init_collection(vector_size: int):
    collections = client.get_collections().collections
    names = [c.name for c in collections]

    if COLLECTION_NAME not in names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=vector_size,
                distance=Distance.COSINE
            )
        )


def store_embedding_data(embedding, payload):
    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload=payload
            )
        ]
    )


def search_similar_data(embedding, limit=3):
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=embedding,
        limit=limit
    )
    return results.points
