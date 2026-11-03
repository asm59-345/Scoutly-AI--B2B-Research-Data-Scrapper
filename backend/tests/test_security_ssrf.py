"""
Security tests verifying SSRF protection for outbound website enrichment requests.
"""

from security.ssrf import validate_url, is_ip_allowed

def test_blocked_private_and_loopback_ips():
    assert is_ip_allowed("127.0.0.1") is False
    assert is_ip_allowed("10.0.0.1") is False
    assert is_ip_allowed("192.168.1.1") is False
    assert is_ip_allowed("172.16.0.5") is False
    assert is_ip_allowed("169.254.169.254") is False  # AWS/GCP metadata
    assert is_ip_allowed("::1") is False               # IPv6 loopback

def test_allowed_public_ips():
    assert is_ip_allowed("8.8.8.8") is True
    assert is_ip_allowed("1.1.1.1") is True

def test_validate_url_schemes():
    assert validate_url("file:///etc/passwd")[0] is False
    assert validate_url("ftp://example.com")[0] is False
    assert validate_url("gopher://example.com")[0] is False

def test_validate_url_restricted_hosts():
    assert validate_url("http://127.0.0.1/status")[0] is False
    assert validate_url("http://169.254.169.254/latest/meta-data/")[0] is False
    assert validate_url("http://localhost:8000/api")[0] is False
    assert validate_url("http://metadata.google.internal")[0] is False

def test_validate_url_valid_target():
    # Public domain validation
    is_safe, reason = validate_url("https://example.com")
    assert is_safe is True
    assert reason is None

