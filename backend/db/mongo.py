from pymongo import MongoClient
import os 

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["invoice_db"]
invoice_collection = db["invoices"]

# #Create connection
# client = MongoClient("mongodb://localhost:27017/")

# #Database
# db= client["invoice_ai_app"]

# #Collection

# invoice_collection = db["invoices"]