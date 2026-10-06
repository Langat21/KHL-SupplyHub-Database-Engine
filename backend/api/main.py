# main.py — FastAPI Layer for KHL SupplyHub
import os
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

# Database Connection with explicit timeout
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client["khl_supplyhub"]


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
    try:
        # Ping the server to verify MongoDB connection
        client.admin.command('ping')
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
    return {"status": "online", "database": db_status}


@app.get("/products", tags=["Products"])
def list_products(category: Optional[str] = None):
    try:
        query = {}
        if category:
            query["category"] = category
        products = list(db.products.find(query))
        return [serialize_doc(p) for p in products]
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")


@app.get("/orders", tags=["Orders"])
def list_orders(status_filter: Optional[str] = None):
    try:
        query = {}
        if status_filter:
            query["o_status"] = status_filter
        orders = list(db.orders.find(query))
        return [serialize_doc(o) for o in orders]
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")


@app.get("/analytics/revenue-by-status", tags=["Analytics"])
def revenue_by_status():
    try:
        pipeline = [
            {"$group": {"_id": "$o_status", "total_revenue": {"$sum": "$total_amount"}, "count": {"$sum": 1}}},
            {"$sort": {"total_revenue": -1}}
        ]
        return list(db.orders.aggregate(pipeline))
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")


@app.get("/analytics/low-stock", tags=["Analytics"])
def low_stock_alert(threshold: int = 100):
    try:
        products = list(db.products.find({"stock": {"$lt": threshold}}))
        return [serialize_doc(p) for p in products]
    except PyMongoError as e:
        raise HTTPException(status_code=500, detail=f"Database query error: {str(e)}")