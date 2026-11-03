"""
Unit tests for MASTER_TAXONOMY structure and query generation.
"""

from scraper_core import MASTER_TAXONOMY

def test_master_taxonomy_keys_and_names():
    assert len(MASTER_TAXONOMY) == 11
    expected_categories = [
        "Food & Beverage", "Lifestyle & Wellness", "Automotive",
        "Health & Medicine", "Home, Garden & Construction", "Retail & Shopping",
        "Corporate & Tech", "Banking & Finance", "Education & Academia",
        "Public Sector & Utilities", "Social & Personal Services"
    ]
    for key, data in MASTER_TAXONOMY.items():
        assert "name" in data
        assert "sub" in data
        assert isinstance(data["sub"], list)
        assert len(data["sub"]) > 0
        assert data["name"] in expected_categories

def test_query_generation_format():
    sub_category = "Software Companies"
    geo_suffix = "Lucknow, Uttar Pradesh, India"
    query = f"{sub_category} in {geo_suffix}"
    assert query == "Software Companies in Lucknow, Uttar Pradesh, India"

