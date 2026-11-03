# System Design Document — Scoutly AI

```mermaid
graph TD
    User["Client Browser (React 18 + Tailwind)"] -->|Vite Proxy /api| API["FastAPI Gateway (Port 8000)"]
    
    subgraph FastAPI Backend Core
        API -->|Parse Query| AIService["AI Service (Prompt & Scoring)"]
        API -->|Start Job| Queue["Job Coordinator & BackgroundTasks"]
        API -->|Status & Records| DB[(SQLite Database scoutly.db)]
        
        Queue -->|Search & Extract| Provider["SeleniumGoogleMapsProvider"]
        Provider -->|Maps Browser Feed| Maps["Google Maps Automation"]
        
        Provider -->|Website URLs| SSRF["SSRF Protection Layer"]
        SSRF -->|Public Safe Request| TargetSites["Company Websites (/contact, /about)"]
        
        TargetSites -->|Extract Emails & Execs| Enricher["Contact Enrichment"]
        Enricher -->|Sanitize Values| Sanitizer["Sanitization Engine"]
        Sanitizer -->|Store Leads| DB
        Sanitizer -->|Export .xlsx| Excel["Corporate Excel Generator"]
    end
```

---

## 1. Sequence Diagram: Lead Research Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Sales Researcher
    participant UI as Scoutly AI Frontend
    participant API as FastAPI Backend
    participant Worker as Background Worker
    participant Browser as Chrome WebDriver
    participant TargetWeb as Target Website
    participant DB as SQLite Database

    User->>UI: Enter prompt or select taxonomy & click Start
    UI->>API: POST /api/scrape/start {selected_subcategories, city, ...}
    API->>DB: Persist ResearchJob (Status: Queued)
    API-->>UI: Return {job_id: "JOB_1784126276", status: "Initiated"}
    
    API->>Worker: Enqueue run_async_scraper_pipeline(job_id)
    Worker->>Browser: Launch Chrome & Navigate to Google Maps
    
    loop Polling Status
        UI->>API: GET /api/scrape/status/JOB_1784126276
        API-->>UI: Return {status: "Running", logs: [...], records: [...]}
    end

    Browser-->>Worker: Scrape business names, phones, addresses, websites
    Worker->>TargetWeb: Safe HTTP GET (SSRF Verified)
    TargetWeb-->>Worker: Parse public emails & executive titles
    Worker->>DB: Persist deduplicated LeadRecord & Confidence Score
    Worker->>DB: Update ResearchJob (Status: Completed)
    
    UI->>API: GET /api/scrape/status/JOB_1784126276
    API-->>UI: Return {status: "Completed", records: [...]}
    User->>UI: Export sanitized CSV / Excel
```

---

## 2. Deduplication & Data Identity Model

To prevent duplicate records from inflating lead metrics, Scoutly AI generates a deterministic deduplication hash:

$$\text{DedupKey} = \text{SHA256}(\text{normalized}(\text{FirmName}) + \text{"::"} + \text{normalized}(\text{City}) + \text{"::"} + \text{normalized}(\text{WebsiteHost}))$$

This guarantees stable uniqueness even if listings have slight punctuation variations.

