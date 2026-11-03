# Current State Repository Audit — Lead Harvester / GestureAI

**Audit Date:** 2026-10-29  
**Audited Target:** Lead Harvester / GestureAI Maps Extractor  
**Target Transformation:** Scoutly AI — B2B Research & Lead Intelligence  

---

## 1. Executive Summary & Existing Architecture

The current repository is a functional monorepo consisting of a Python/FastAPI backend and a React/Vite/TailwindCSS frontend. It automates business lead discovery by scraping Google Maps via Selenium WebDriver and enriching extracted leads by visiting the target company websites via HTTP requests (BeautifulSoup) to detect email addresses and executive contact personnel.

```
lead-harvester/
├── backend/
│   ├── main.py                     # FastAPI server, endpoints, in-memory state tracking
│   ├── scraper_core.py             # GoogleMapsScraper class, Selenium automation, web enrichment, Excel export
│   ├── requirements.txt            # Python dependencies (pinned versions)
│   └── extended_scraper.log        # Scraper execution logging output
├── frontend/
│   ├── index.html                  # HTML entry point
│   ├── package.json                # React 18, Vite 5, TailwindCSS 3
│   ├── vite.config.js              # Vite dev server configuration + /api proxy to http://127.0.0.1:8000
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── src/
│       ├── main.jsx                # React root bootstrap
│       ├── index.css               # Tailwind directives
│       └── App.jsx                 # Monolithic UI containing controls, polling, table, terminal log
├── Leads_Export_1784126276975.csv  # Sample export artifact
├── .txt                            # Startup quick-commands reference
└── CLAUDE.md                       # Workspace protocol and instructions
```

---

## 2. Component-by-Component Audit

### 2.1 Backend (`backend/`)
- **Framework:** FastAPI `0.110.0` with Uvicorn `0.28.0`.
- **CORS Policy:** Open wildcard (`allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]`).
- **Job Execution Model:**
  - Uses FastAPI `BackgroundTasks.add_task(run_async_scraper_pipeline, job_id, payload)`.
  - In-memory global dictionary `active_jobs_progress = {}` stores jobs by ID (`JOB_<epoch_seconds>`).
  - No persistent database or persistent queue (Redis/Celery/Postgres). State is lost if server restarts.
- **Scraper Engine (`backend/scraper_core.py`):**
  - **Browser Automation:** Selenium `4.18.1` with `ChromeDriverManager` and `webdriver.Chrome`.
  - **Options:** `--headless=new` (configurable via payload `headless: bool`), `--no-sandbox`, `--disable-dev-shm-usage`, user-agent masking, and `navigator.webdriver` CDP suppression.
  - **Query Generation:** `f"{sub_cat} in {city}, {state}, {country}"`.
  - **Navigation & Feed:** Enters `https://www.google.com/maps/search/<query>`, scrolls the `role="feed"` element up to `limit` unique links (`/maps/place/`).
  - **Data Extraction:** Visits each place URL, reads `<h1>` (Firm Name), parses elements with `data-item-id` (`address`, `phone:tel:`, `authority`), and falls back to `aria-label` matching.
  - **Deep Website Enrichment:** For businesses with a website, makes HTTP GET requests using `requests` (`verify=False`, timeout 12s) to the homepage and candidate subpages (`contact`, `about`, `team`, `management`). Searches for emails via regex and personnel names via pattern matching against priority executive titles (Founder, CEO, Director, Owner).
  - **Export:** Generates `.xlsx` using `pandas` and formats cells with `openpyxl` using Times New Roman 11pt, bold headers.

### 2.2 Frontend (`frontend/`)
- **Framework:** React 18 (`react`, `react-dom`) bundled with Vite `5.2.0`.
- **Styling:** Tailwind CSS `3.4.3`. Dark terminal aesthetic (`bg-gray-950`).
- **State Management:** Local React hooks in `src/App.jsx`.
- **Proxy Configuration:** Proxies all `/api` requests to `http://127.0.0.1:8000`.
- **Job Polling:** Polls `/api/scrape/status/{job_id}` every 2500ms until `Completed` or `Failed`.
- **Client Features:**
  - Category selector mapped to `MASTER_TAXONOMY` (with fallback mock if backend is down).
  - Subcategory multiselect checkboxes.
  - Geographic inputs: Country, State, City.
  - Search limit and headless toggle.
  - Terminal log viewer with auto-scroll.
  - Real-time result table with search filter and clipboard copy.
  - Client-side CSV export trigger.

---

## 3. Endpoints & Schemas

### 3.1 `GET /api/categories`
- **Description:** Returns the complete 11-category `MASTER_TAXONOMY` dictionary.
- **Response Format:**
  ```json
  {
    "1": { "name": "Food & Beverage", "sub": ["Restaurants", "Coffee Shops", "..."] },
    "...": { "name": "...", "sub": [...] }
  }
  ```

### 3.2 `POST /api/scrape/start`
- **Request Body (`ScrapingRequest`):**
  ```json
  {
    "category_group_id": "string",
    "selected_subcategories": ["string"],
    "country": "string",
    "state": "string (optional, default '')",
    "city": "string",
    "limit": 20,
    "headless": true
  }
  ```
- **Response Format:**
  ```json
  {
    "job_id": "JOB_1784126276",
    "status": "Initiated"
  }
  ```

### 3.3 `GET /api/scrape/status/{job_id}`
- **Description:** Returns the current execution status, log messages, and accumulated scraped records.
- **Response Format:**
  ```json
  {
    "status": "Queued" | "Running" | "Completed" | "Failed" | "Not Found",
    "logs": ["[17:00:00] Starting browser automation..."],
    "records": [
      {
        "Sl.": 1,
        "Firm Name": "Example Corp",
        "Contact Number": "+91 1234567890",
        "Contact Email": "contact@example.com",
        "Contact Person Name": "John Doe",
        "Address": "123 Main St, Lucknow",
        "Website URL": "https://example.com"
      }
    ]
  }
  ```

---

## 4. Frontend Feature to Backend Mapping

| Frontend Component | UI Action / State | Backend Endpoint | Method | Status |
|-------------------|-------------------|------------------|--------|--------|
| Category Dropdown | On load / refresh | `/api/categories` | GET | Active |
| Start Button | Click "Fire Automated..." | `/api/scrape/start` | POST | Active |
| Polling Hook | `setInterval(2500ms)` | `/api/scrape/status/{job_id}` | GET | Active |
| Terminal Console | Displays `terminalLogs` | Fed by `status.logs` | GET | Active |
| Results Grid | Displays `scrapedRecords` | Fed by `status.records` | GET | Active |
| CSV Export | Download button | Client-side memory parsing | N/A | Active |
| Excel Export | Backend file trigger | Generated on backend disk per batch | Local file | Active |
| Copy Lead | Row button | `navigator.clipboard.writeText` | N/A | Active |

---

## 5. Pre-Existing Defects, Gaps & Security Risks

1. **No Persistence:** `active_jobs_progress` is in-memory. If server restarts or terminates, all job history and records vanish.
2. **Missing Tests:** Repository contained 0 automated tests in backend or frontend.
3. **No Authentication or Authorization:** Any caller can trigger scrapes or inspect any job's logs and scraped data.
4. **SSRF Vulnerability in Web Enrichment:** `scraper_core.py` issues unvalidated `requests.get(website_url, verify=False)` directly from business listings, which could be exploited to query internal network services or cloud metadata endpoints (`http://169.254.169.254`).
5. **CSV Formula Injection:** CSV export blindly wraps cell strings in double quotes without escaping leading formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`), posing spreadsheet formula injection risks.
6. **No Rate Limiting:** `/api/scrape/start` can be spammed, spinning up multiple resource-heavy Chrome processes that can exhaust CPU and memory.
7. **Wildcard CORS:** `allow_origins=["*"]` is active in production code.
8. **Hardcoded Ports & URLs:** Frontend relies on hardcoded proxy target `http://127.0.0.1:8000`.

---

## 6. Compatibility Matrix & Preservation Guarantee

| Feature / Artifact | Preservation Requirement | Compatibility Strategy |
|-------------------|--------------------------|------------------------|
| `MASTER_TAXONOMY` | 100% Preserved | Imported directly into adapter/models without modification. |
| `GoogleMapsScraper` | 100% Preserved | Wrapped behind a `DiscoveryProvider` adapter interface. Original class untouched. |
| `/api/categories` | 100% Preserved | Kept identical in path, verb, and return JSON structure. |
| `/api/scrape/start` | 100% Preserved | Schema preserved with backwards-compatible optional fields. Returns `{"job_id": ..., "status": ...}`. |
| `/api/scrape/status/{job_id}` | 100% Preserved | Preserved identical response schema (`status`, `logs`, `records`). |
| `JOB_<epoch>` ID format | 100% Preserved | Maintained for compatibility with existing clients. |
| Excel Output Styling | 100% Preserved | Times New Roman corporate styling function retained. |
| Client CSV Export | 100% Preserved + Sanitized | Sanitized against formula injection while preserving column structure. |

