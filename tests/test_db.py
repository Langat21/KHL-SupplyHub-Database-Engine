# tests/test_db.py
import pytest
from fastapi.testclient import TestClient
from backend.api.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "online", "database": "khl_supplyhub"}

def test_get_products():
    response = client.get("/products")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_orders():
    response = client.get("/orders")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_revenue_by_status_analytics():
    response = client.get("/analytics/revenue-by-status")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_low_stock_analytics():
    response = client.get("/analytics/low-stock?threshold=100")
    assert response.status_code == 200
    assert isinstance(response.json(), list)