# Security, SSRF Defenses & Compliance — Scoutly AI

---

## 1. Threat Modeling & Attack Surface

Scoutly AI executes automated web discovery and HTTP enrichment of external domains. Without robust safeguards, outbound web crawling can be leveraged for Server-Side Request Forgery (SSRF), Denial of Service (DoS), or spreadsheet formula injection.

---

## 2. Implemented Defense In Depth

### 2.1 SSRF Defense (`backend/security/ssrf.py`)
External website crawling validates all target URLs before dispatching requests:
1. **Scheme Enforcement:** Only `http://` and `https://` protocols are allowed. File, FTP, Gopher, and custom schemes are rejected.
2. **IP & Subnet Whitelisting:**
   - Blocks Loopback (`127.0.0.0/8`, `::1`).
   - Blocks RFC1918 Private ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`).
   - Blocks Cloud Metadata & Link-Local IPs (`169.254.169.254`, `169.254.0.0/16`).
   - Blocks Multicast and reserved ranges.
3. **DNS Re-Resolution:** Resolves DNS hostnames and verifies all returned socket IP addresses prior to HTTP requests.
4. **Redirect Validation:** Validates redirection targets (`Location` headers) against the same IP safety filters before following.

### 2.2 Spreadsheet Formula Injection Defense (CWE-1236)
`backend/security/sanitization.py` and the frontend CSV generator sanitize all exported data:
- Strings beginning with dangerous formula tokens (`=`, `+`, `-`, `@`, `\t`, `\r`) are automatically escaped with a leading single quote (`'`).
- Prevents malicious command execution when spreadsheets are opened in Microsoft Excel, LibreOffice, or Google Sheets.

### 2.3 Strict Grounding — Zero Hallucinated PII
- Contact emails, phone numbers, and executive names are populated **only** when matching verified public signals on Google Maps or target websites.
- The AI service does not generate synthetic identities or contact numbers.
- Unsupported data points are marked as `"N/A"` or `"Unverified"`.

### 2.4 CORS & Request Protection
- Wildcard CORS is replaced with an explicit allowed origin configuration via the `ALLOWED_ORIGINS` environment variable.

