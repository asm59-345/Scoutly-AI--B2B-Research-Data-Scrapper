"""
Unit tests for AI Intelligence Service: prompt parsing, scoring, and grounded summarization.
"""

from services.ai_service import AIService

def test_parse_prompt_automotive_example():
    prompt = "Find independent automotive service businesses in Lucknow and identify publicly listed company contact details."
    result = AIService.parse_natural_language_prompt(prompt)
    assert result["category_group_id"] == "3"
    assert result["category_name"] == "Automotive"
    assert any("Auto Repair" in s or "Car" in s for s in result["selected_subcategories"])
    assert result["city"] == "Lucknow"
    assert result["confidence"] > 0.6

def test_parse_prompt_software_example():
    prompt = "Search top 10 software companies and startups in Lucknow, Uttar Pradesh"
    result = AIService.parse_natural_language_prompt(prompt)
    assert result["category_group_id"] == "7"
    assert result["limit"] == 10
    assert result["city"] == "Lucknow"

def test_lead_qualification_scoring():
    full_lead = {
        "Firm Name": "Apex Tech",
        "Website URL": "https://apextech.com",
        "Contact Number": "+91 522 123456",
        "Contact Email": "info@apextech.com",
        "Contact Person Name": "Anita Sharma"
    }
    score_res = AIService.calculate_lead_score(full_lead)
    assert score_res["score"] == 100
    assert score_res["verification_status"] == "independently_verified"

    partial_lead = {
        "Firm Name": "Small Shop",
        "Website URL": "",
        "Contact Number": "12345",
        "Contact Email": "",
        "Contact Person Name": ""
    }
    partial_score = AIService.calculate_lead_score(partial_lead)
    assert partial_score["score"] == 25
    assert partial_score["verification_status"] == "found_on_source"

def test_summarize_business_profile_grounded():
    summary_data = AIService.summarize_business_profile(
        firm_name="Green Horizon Labs",
        website_url="https://greenhorizon.org",
        address="Sector B, Lucknow",
        category="Research Centers",
        snippets=["Leading agricultural research institute founded in 2015."]
    )
    assert "Green Horizon Labs" in summary_data["summary"]
    assert "Sector B, Lucknow" in summary_data["summary"]
    assert "https://greenhorizon.org" in summary_data["grounded_sources"]
    assert "hallucination_guarantee" in summary_data

