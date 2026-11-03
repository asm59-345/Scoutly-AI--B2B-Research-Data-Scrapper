"""
Unit tests for Analytics and Search History endpoints.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_analytics_overview_contract():
    response = client.get("/api/v1/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_leads_discovered" in data
    assert "total_searches_executed" in data
    assert "email_penetration_rate" in data

def test_analytics_by_industry():
    response = client.get("/api/v1/analytics/leads-by-industry")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_analytics_by_location():
    response = client.get("/api/v1/analytics/leads-by-location")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_search_history():
    response = client.get("/api/v1/search-history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

