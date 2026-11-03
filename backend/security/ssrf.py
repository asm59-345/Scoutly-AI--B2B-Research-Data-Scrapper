"""
SSRF Protection Module for Scoutly AI.
Prevents Server-Side Request Forgery during external website crawling and enrichment.
"""

import socket
import ipaddress
import urllib.parse
from typing import Tuple, List, Optional
import requests

BLOCKED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),       # Link-local & cloud metadata
    ipaddress.ip_network("172.16.0.0/12"),       # Private range
    ipaddress.ip_network("192.168.0.0/16"),      # Private range
    ipaddress.ip_network("224.0.0.0/4"),        # Multicast
    ipaddress.ip_network("240.0.0.0/4"),        # Reserved
    ipaddress.ip_network("::1/128"),            # IPv6 loopback
    ipaddress.ip_network("fc00::/7"),           # IPv6 unique local
    ipaddress.ip_network("fe80::/10"),          # IPv6 link-local
    ipaddress.ip_network("ff00::/8"),           # IPv6 multicast
]

BLOCKED_HOSTNAMES = {
    "localhost",
    "metadata.google.internal",
    "metadata.google.internal.",
    "instance-data",
}

def is_ip_allowed(ip_str: str) -> bool:
    """Returns True if the IP address is public and routable, False otherwise."""
    try:
        ip = ipaddress.ip_address(ip_str)
        if ip.is_loopback or ip.is_private or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
            return False
        for net in BLOCKED_NETWORKS:
            if ip in net:
                return False
        return True
    except ValueError:
        return False

def validate_url(url: str) -> Tuple[bool, Optional[str]]:
    """
    Validates that a URL is safe to fetch via HTTP/HTTPS.
    Returns (True, None) if safe, or (False, reason) if unsafe.
    """
    if not url:
        return False, "Empty URL"
    
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Unsupported scheme '{parsed.scheme}'. Only http and https allowed."
    
    hostname = parsed.hostname
    if not hostname:
        return False, "Missing hostname in URL."
    
    hostname_lower = hostname.lower()
    if hostname_lower in BLOCKED_HOSTNAMES:
        return False, f"Access to restricted hostname '{hostname}' is blocked."
    
    # Check if hostname is an IP address
    try:
        ip = ipaddress.ip_address(hostname)
        if not is_ip_allowed(str(ip)):
            return False, f"Access to IP '{hostname}' is restricted (private/loopback/metadata)."
        return True, None
    except ValueError:
        pass
    
    # Resolve DNS
    try:
        addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        resolved_ips = {item[4][0] for item in addr_info}
    except Exception as e:
        return False, f"DNS resolution failed for hostname '{hostname}': {str(e)}"
    
    for ip_str in resolved_ips:
        if not is_ip_allowed(ip_str):
            return False, f"Hostname '{hostname}' resolves to restricted IP: {ip_str}"
            
    return True, None

def safe_requests_get(url: str, headers: Optional[dict] = None, timeout: int = 10, max_redirects: int = 3) -> Optional[requests.Response]:
    """
    Executes a safe GET request verifying that the initial URL and any redirection targets
    do not point to private/metadata IP addresses.
    """
    current_url = url
    for _ in range(max_redirects + 1):
        is_safe, reason = validate_url(current_url)
        if not is_safe:
            return None
        try:
            resp = requests.get(current_url, headers=headers, timeout=timeout, allow_redirects=False, verify=True)
            if resp.is_redirect or resp.status_code in (301, 302, 303, 307, 308):
                location = resp.headers.get("Location")
                if not location:
                    break
                current_url = urllib.parse.urljoin(current_url, location)
                continue
            return resp
        except Exception:
            return None
    return None

