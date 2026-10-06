# main.py — FastAPI Layer for KHL SupplyHub
import os
import certifi
from typing import Optional
from fastapi import FastAPI, HTTPException, status
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson import ObjectId

app = FastAPI(
    title="KHL SupplyHub Database Engine",
    description="Data Access API for MongoDB Document Model Implementation",
    version="1.0.0"
)


def get_mongo_uri() -> str:
    """Resolve the MongoDB URI from either supported environment variable name."""
    return os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017"


def build_client() -> MongoClient:
    uri = get_mongo_uri()
    connection_kwargs = {"serverSelectionTimeoutMS": 5000}
    if "mongodb+srv" in uri.lower() or "mongodb.net" in uri.lower():
        connection_kwargs["tls"] = True
        connection_kwargs["tlsCAFile"] = certifi.where()
    return MongoClient(uri, **connection_kwargs)


client = build_client()
db = client["khl_supplyhub"]


def is_database_available() -> bool:
    try:
        client.admin.command("ping")
        return True
    except Exception:
        return False


# Helper function to recursively serialize BSON ObjectId instances to strings
def serialize_doc(doc):
    if not doc:
        return None

    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    if "customer_id" in doc and isinstance(doc["customer_id"], ObjectId):
        doc["customer_id"] = str(doc["customer_id"])
    if "supplier_id" in doc and isinstance(doc["supplier_id"], ObjectId):
        doc["supplier_id"] = str(doc["supplier_id"])

    if "order_details" in doc and isinstance(doc["order_details"], list):
        for item in doc["order_details"]:
            if "product_id" in item and isinstance(item["product_id"], ObjectId):
                item["product_id"] = str(item["product_id"])

    if "transaction" in doc and isinstance(doc["transaction"], dict):
        if "transaction_id" in doc["transaction"] and isinstance(doc["transaction"]["transaction_id"], ObjectId):
            doc["transaction"]["transaction_id"] = str(doc["transaction"]["transaction_id"])

    return doc


# --- API ENDPOINTS ---

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "online", "database": "khl_supplyhub"}


@app.get("/products", tags=["Products"])
def list_products(category: Optional[str] = None):
    try:
        if not is_database_available():
            return []
        query = {}
        if category:
            query["category"] = category
        products = list(db.products.find(query))
        return [serialize_doc(p) for p in products]
    except PyMongoError:
        return []
    except Exception:
        return []


@app.get("/orders", tags=["Orders"])
def list_orders(status_filter: Optional[str] = None):
    try:
        if not is_database_available():
            return []
        query = {}
        if status_filter:
            query["o_status"] = status_filter
        orders = list(db.orders.find(query))
        return [serialize_doc(o) for o in orders]
    except PyMongoError:
        return []
    except Exception:
        return []


@app.get("/analytics/revenue-by-status", tags=["Analytics"])
def revenue_by_status():
    try:
        if not is_database_available():
            return []
        pipeline = [
            {"$group": {"_id": "$o_status", "total_revenue": {"$sum": "$total_amount"}, "count": {"$sum": 1}}},
            {"$sort": {"total_revenue": -1}}
        ]
        return list(db.orders.aggregate(pipeline))
    except PyMongoError:
        return []
    except Exception:
        return []


@app.get("/analytics/low-stock", tags=["Analytics"])
def low_stock_alert(threshold: int = 100):
    try:
        if not is_database_available():
            return []
        products = list(db.products.find({"stock": {"$lt": threshold}}))
        return [serialize_doc(p) for p in products]
    except PyMongoError:
        return []
    except Exception:
        return []