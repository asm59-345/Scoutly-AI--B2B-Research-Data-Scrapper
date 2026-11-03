# Scoutly AI — API Specification

This document details the verified API contracts of Scoutly AI, maintaining 100% backward compatibility with existing Lead Harvester endpoints while defining secured, extensible v1 routes.

---

## 1. Compatibility Routes (Legacy Contract Preserved)

### 1.1 Get Categories
- **Endpoint:** `GET /api/categories`
- **Description:** Returns the 11 business industry taxonomy groups and their associated subcategories.
- **Authentication:** Public (compatible) / Optional Bearer Token.
- **Response `200 OK`:**
```json
{
  "1": {
    "name": "Food & Beverage",
    "sub": [
      "Restaurants",
      "Coffee Shops",
      "Wine Shops",
      "Bakeries",
      "Cafes",
      "Bars",
      "Fast Food Chains"
    ]
  },
  "7": {
    "name": "Corporate & Tech",
    "sub": [
      "Startups",
      "Mid-Range Corporate Offices",
      "MNC Corporate Hubs",
      "IT Service Providers",
      "Software Companies",
      "Co-working Spaces"
    ]
  }
}
```

---

### 1.2 Start Lead Generation / Research Job
- **Endpoint:** `POST /api/scrape/start`
- **Description:** Enqueues a search and enrichment job for the selected categories and geographic parameters.
- **Request Headers:**
  - `Content-Type: application/json`
- **Request Body (`ScrapingRequest`):**
```json
{
  "category_group_id": "7",
  "selected_subcategories": [
    "IT Service Providers",
    "Software Companies"
  ],
  "country": "India",
  "state": "Uttar Pradesh",
  "city": "Lucknow",
  "limit": 20,
  "headless": true
}
```
- **Validation Constraints:**
  - `category_group_id`: Non-empty string.
  - `selected_subcategories`: Non-empty array of strings.
  - `city`: Non-empty string.
  - `limit`: Optional integer, between 1 and 100 (default: 20).
  - `headless`: Optional boolean (default: true).
- **Response `200 OK`:**
```json
{
  "job_id": "JOB_1784126276",
  "status": "Initiated"
}
```
- **Error Responses:**
  - `400 Bad Request`: When `selected_subcategories` is empty or city is missing.
  - `429 Too Many Requests`: When client exceeds rate limits.

---

### 1.3 Check Job Status & Live Records
- **Endpoint:** `GET /api/scrape/status/{job_id}`
- **Description:** Polls the status, live diagnostic logs, and streamed business records for an active or completed job.
- **Path Parameters:**
  - `job_id` (string, required): Format `JOB_\d+`
- **Response `200 OK`:**
```json
{
  "status": "Running",
  "logs": [
    "[22:30:15] Workflow initialization active...",
    "[22:30:18] Identified 12 matching business profiles.",
    "[22:30:22] Parsing business profile entry details [1/12]"
  ],
  "records": [
    {
      "Sl.": 1,
      "Firm Name": "Apex Software Solutions",
      "Contact Number": "+91522223344",
      "Contact Email": "contact@apexsoftware.in",
      "Contact Person Name": "Rajesh Kumar",
      "Address": "Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh",
      "Website URL": "https://apexsoftware.in"
    }
  ]
}
```
- **Status Enum Values:** `Queued`, `Running`, `Completed`, `Failed`, `Not Found`.
- **Note on `Not Found`:**
```json
{
  "status": "Not Found",
  "logs": ["[SYSTEM ERROR] Job token mismatch."],
  "records": []
}
```

---

## 2. Scoutly AI Extended API (v1 Compatible Extensions)

These endpoints provide persistence, AI query parsing, research summarization, and security management.

### 2.1 Natural Language Query Parser
- **Endpoint:** `POST /api/v1/research/parse-prompt`
- **Description:** Grounded natural-language query parser converting prompt strings into validated parameters.
- **Request Body:**
```json
{
  "prompt": "Find top software startups and IT providers in Lucknow with contact details"
}
```
- **Response `200 OK`:**
```json
{
  "category_group_id": "7",
  "category_name": "Corporate & Tech",
  "selected_subcategories": ["Startups", "IT Service Providers", "Software Companies"],
  "country": "India",
  "state": "Uttar Pradesh",
  "city": "Lucknow",
  "limit": 20,
  "confidence": 0.95
}
```

---

### 2.2 System Health & Readiness
- **Endpoint:** `GET /api/health`
- **Response `200 OK`:**
```json
{
  "status": "healthy",
  "timestamp": "2026-10-29T22:45:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "scraper_engine": "ready"
  }
}
```

---

### 2.3 Research Projects & Persistence
- **Endpoint:** `GET /api/v1/projects`
- **Description:** Retrieve list of saved research projects and lead collections.
- **Response `200 OK`:**
```json
[
  {
    "id": "proj_01j78...",
    "name": "Lucknow Tech Discovery",
    "created_at": "2026-10-29T18:00:00Z",
    "lead_count": 28,
    "last_job_id": "JOB_1784126276"
  }
]
```

---

### 2.4 Lead Detail & AI Summarization
- **Endpoint:** `POST /api/v1/leads/summarize`
- **Description:** Evidence-grounded business summary based exclusively on parsed public signals without hallucination.
- **Request Body:**
```json
{
  "firm_name": "Apex Software Solutions",
  "website_url": "https://apexsoftware.in",
  "source_text_snippets": ["Providing enterprise software and cloud migration since 2018."]
}
```
- **Response `200 OK`:**
```json
{
  "summary": "Enterprise software and cloud migration consultancy based in Lucknow, operational since 2018.",
  "grounded_sources": ["https://apexsoftware.in"],
  "qualification_score": 85,
  "scoring_rationale": "Active corporate website, verified local physical address, primary business email present."
}
```

