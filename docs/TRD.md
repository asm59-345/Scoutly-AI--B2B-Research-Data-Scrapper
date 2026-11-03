# Technical Requirements Document (TRD) — Scoutly AI

**Version:** 1.0.0  
**Stack:** FastAPI (Python 3.11+) + React 18 / Vite 5 / TailwindCSS 3  

---

## 1. Technical Architecture & Technology Choices

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Backend Framework** | FastAPI `0.110.0` | Asynchronous high-performance REST engine with Pydantic validation. |
| **Persistence / ORM** | SQLAlchemy `2.0+` & SQLite | Lightweight, zero-config local ACID persistence with seamless PostgreSQL upgrade path. |
| **Browser Automation** | Selenium `4.18+` / Chrome | Dynamic feed extraction and JavaScript rendering for Google Maps listings. |
| **Web Scraping & Enrichment**| BeautifulSoup4 & Requests | Fast DOM parsing for contact extraction (`/contact`, `/about`). |
| **Frontend Framework** | React `18.2+` + Vite `5.2+` | Modern reactive UI with fast build and HMR tooling. |
| **Styling & Design System** | TailwindCSS `3.4+` + Lucide Icons | Accessible, responsive design with dark/light mode token architecture. |
| **Safety & DevSecOps** | Custom SSRF & Sanitization modules | RFC1918 + Cloud metadata blocking; CSV formula injection defense. |

---

## 2. API & Data Contracts

### 2.1 Preserved Legacy Contracts
1. `GET /api/categories` -> Returns dictionary of 11 industry verticals with subcategories.
2. `POST /api/scrape/start` -> Enqueues background worker, returns `{"job_id": "JOB_<timestamp>", "status": "Initiated"}`.
3. `GET /api/scrape/status/{job_id}` -> Returns `{"status": "...", "logs": [...], "records": [...]}`.

### 2.2 Extended v1 Contracts
1. `POST /api/v1/research/parse-prompt` -> Converts natural-language strings to structured taxonomy items.
2. `POST /api/v1/leads/summarize` -> Computes grounded textual overview based strictly on verified attributes.
3. `GET /api/v1/leads/saved` -> Retrieves durable leads from SQLite database with confidence scores.
4. `GET /api/health` -> System health and DB connectivity monitoring.

---

## 3. Security Requirements

- **CORS:** Configurable via `ALLOWED_ORIGINS` environment variable.
- **SSRF Prevention:** Hostname and DNS resolution verification blocking `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, and `169.254.169.254`.
- **CSV Formula Injection:** Leading `=, +, -, @, \t, \r` prepended with `'` prior to export.

