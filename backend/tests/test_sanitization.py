"""
Unit tests for CSV/Excel formula injection prevention.
"""

from security.sanitization import sanitize_cell_value, sanitize_record, sanitize_records_list

def test_sanitize_cell_value_dangerous_characters():
    assert sanitize_cell_value("=1+1") == "'=1+1"
    assert sanitize_cell_value("+2+2") == "'+2+2"
    assert sanitize_cell_value("-5*10") == "'-5*10"
    assert sanitize_cell_value("@SUM(A1:A10)") == "'@SUM(A1:A10)"
    assert sanitize_cell_value("\tcmd") == "'\tcmd"

def test_sanitize_cell_value_safe_strings():
    assert sanitize_cell_value("Normal Company Ltd") == "Normal Company Ltd"
    assert sanitize_cell_value("https://example.com") == "https://example.com"
    assert sanitize_cell_value("+91 9999999999") == "'+91 9999999999"  # Leading plus escaped for spreadsheet safety
    assert sanitize_cell_value("") == ""
    assert sanitize_cell_value(None) == ""

def test_sanitize_records_list():
    raw = [
        {"Firm Name": "=HYPERLINK(\"http://malicious.com\")", "Address": "123 Main St"}
    ]
    cleaned = sanitize_records_list(raw)
    assert cleaned[0]["Firm Name"] == "'=HYPERLINK(\"http://malicious.com\")"
    assert cleaned[0]["Address"] == "123 Main St"

