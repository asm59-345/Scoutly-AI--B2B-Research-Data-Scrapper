"""
Tests for outreach email drafting and bulk lead management endpoints.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_draft_lead_outreach():
    payload = {
        "firm_name": "Apex Cloud Systems",
        "contact_person": "Vikram Seth",
        "category": "Software Companies",
        "pitch_type": "partnership"
    }
    response = client.post("/api/v1/leads/draft-outreach", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "subject" in data
    assert "body" in data
    assert "Hi Vikram," in data["body"]
    assert "Apex Cloud Systems" in data["body"]
    assert "Software Companies" in data["body"]

def test_bulk_manage_leads_validation():
    response = client.post("/api/v1/leads/bulk-action", json={
        "lead_ids": [],
        "action": "pin"
    })
    assert response.status_code == 400

