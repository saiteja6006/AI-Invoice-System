from db.mongo import invoice_collection
from datetime import datetime
from bson import ObjectId


def serialize_mongo(doc):
    if isinstance(doc, list):
        return [serialize_mongo(d) for d in doc]

    if isinstance(doc, dict):
        return {k: serialize_mongo(v) for k, v in doc.items()}

    if isinstance(doc, ObjectId):
        return str(doc)

    return doc


def save_invoice(data):
    print("Saving to DB:", data)   
    data["created_at"] = datetime.utcnow()
    result = invoice_collection.insert_one(data)
    print("Inserted ID:", result.inserted_id)
    return str(result.inserted_id)


def get_all_invoices():
    invoices = list(invoice_collection.find())
    return serialize_mongo(invoices)