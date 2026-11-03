"""
Contract and regression tests for FastAPI endpoints.
Verifies that legacy and extended contracts remain 100% compliant.
"""

from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_get_categories_contract():
    response = client.get("/api/categories")
    assert response.status_code == 200
    data = response.json()
    assert "1" in data
    assert "7" in data
    assert data["7"]["name"] == "Corporate & Tech"
    assert "IT Service Providers" in data["7"]["sub"]

def test_scrape_start_validation():
    # Empty subcategories should return 400
    invalid_payload = {
        "category_group_id": "7",
        "selected_subcategories": [],
        "country": "India",
        "city": "Lucknow"
    }
    response = client.post("/api/scrape/start", json=invalid_payload)
    assert response.status_code == 400

    # Valid payload should initiate job and return JOB_<timestamp> ID
    valid_payload = {
        "category_group_id": "7",
        "selected_subcategories": ["Startups"],
        "country": "India",
        "state": "Uttar Pradesh",
        "city": "Lucknow",
        "limit": 5,
        "headless": True
    }
    with patch("main.run_async_scraper_pipeline") as mock_pipeline:
        response = client.post("/api/scrape/start", json=valid_payload)
        assert response.status_code == 200
        data = response.json()
        assert "job_id" in data
        assert data["job_id"].startswith("JOB_")
        assert data["status"] == "Initiated"

def test_scrape_status_contract():
    # Non-existent job
    response = client.get("/api/scrape/status/JOB_NONEXISTENT_9999")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Not Found"
    assert "logs" in data
    assert "records" in data

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_parse_prompt_endpoint():
    response = client.post("/api/v1/research/parse-prompt", json={
        "prompt": "Find top cafes and bakeries in Lucknow"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category_group_id"] == "1"
    assert data["city"] == "Lucknow"
