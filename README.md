# Scoutly AI — B2B Research & Lead Intelligence SaaS Platform

> **"Find the Right Businesses. Discover Better Opportunities."**  
> An autonomous, evidence-grounded B2B lead intelligence workspace combining conversational query synthesis with deep web contact discovery and explainable prospect qualification.

---

## 📸 Platform Previews & Visuals

### Obsidian Intelligence Interface (Design System generated via Stitch)
![Scoutly AI Desktop Preview](frontend/public/illustrations/stitch-hero-preview.png)

### Autonomous Prospecting Workflow
![Workflow Process Diagram](frontend/public/illustrations/workflow-diagram.svg)

---

## 🌟 What is Scoutly AI?

Scoutly AI transforms manual sales prospecting into an intelligent, autonomous pipeline:
1. **Conversational Intent Grounding:** Write natural-language queries (e.g. *"Find independent automotive service businesses in Lucknow"*); our deterministic AI parser maps it directly to Master Industry Verticals without hallucinated categories.
2. **Autonomous Web Discovery:** Headless Selenium automation extracts live commercial listings, physical addresses, phone lines, and corporate websites.
3. **Deep Web Contact Enrichment:** Crawls `/contact`, `/about`, and `/team` sub-pages to uncover verified business emails and executive leadership names (Founders, CEOs, Directors).
4. **Transparent Lead Scoring:** 100-point explainability score breaking down evidence for domain authority, active phone, corporate email, and identified decision maker.
5. **Durable Persistence:** ACID-compliant SQLite / SQLAlchemy store keeping your leads, notes, and search history safe across server restarts.
6. **Built-in Outreach Assistant:** 1-click tailored cold email and LinkedIn pitch generator (Partnership, Sales, and Introduction styles).
7. **Artisanal SaaS Architecture:** Clean, responsive multi-page application (Home, About, Services, How It Works, Workspace Hub, and Market Intelligence).

---

## 🛠️ Complete Technology Stack

- **Frontend:** React 18, Vite 5, TailwindCSS 3 (Obsidian Dark `#090D18` & Warm Off-White `#F8FAFC`), Lucide React, Dynamic Favicon Resolution.
- **Design System:** Obsidian Intelligence (Generated via Google Stitch MCP).
- **Backend API:** FastAPI, Uvicorn, Pydantic, SQLAlchemy 2.0+, BeautifulSoup4, Requests.
- **Automation Core:** Selenium WebDriver, Chrome Headless Engine, OpenPyXL (Times New Roman corporate styling), Pandas.
- **Security & DevSecOps:** Custom SSRF IP verification layer (blocking RFC1918, loopbacks, and `169.254.169.254`), CWE-1236 spreadsheet formula injection defense.
- **Testing:** Pytest automated test suite (25 test cases).
- **Containerization:** Multi-stage Dockerfiles and Docker Compose.

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Google Chrome browser (for headless extraction engine)

### 2. Backend Engine Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Health Endpoint: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Interactive API Documentation (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 3. Frontend Web Application Setup
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open the application in your browser at: **[http://127.0.0.1:5173](http://127.0.0.1:5173)**

---

## 🧪 Automated Testing

Run the comprehensive pytest test suite verifying API contracts, SSRF security, sanitization, and outreach generators:
```bash
cd backend
python -m pytest tests -v
```

### Verified Test Suite Breakdown (25/25 Tests Passing):
- `tests/test_taxonomy.py`: Validates 11 Master Taxonomy verticals and query generation.
- `tests/test_api_contract.py`: Verifies legacy and extended endpoints.
- `tests/test_sanitization.py`: Formula injection defense (`=`, `+`, `-`, `@`, `\t`, `\r`).
- `tests/test_security_ssrf.py`: Outbound request IP filtering against private/cloud metadata IPs.
- `tests/test_ai_service.py`: Grounded prompt parsing, lead qualification scoring, and summarization.
- `tests/test_outreach.py`: Sales & partnership outreach pitch generation.
- `tests/test_analytics.py`: Aggregate database query calculations for categories, cities, and jobs.

---

## 🐳 Docker Deployment

Run the complete multi-service stack with a single command:
```bash
docker-compose up -d --build
```
Access the application at [http://localhost:5173](http://localhost:5173).

---

## 📚 Complete Engineering Documentation

Detailed architecture specifications, security threat models, and operational plans are documented in [`docs/`](./docs):
- [Product Requirements Document (PRD)](docs/PRD.md)
- [Technical Requirements Document (TRD)](docs/TRD.md)
- [System Design & Sequence Flows](docs/SYSTEM_DESIGN.md)
- [Architecture & Adapter Hierarchy](docs/ARCHITECTURE.md)
- [API Specification Contract](docs/API.md)
- [Testing Strategy & Coverage Matrix](docs/TESTING.md)
- [Deployment, Backup & Rollback Guide](docs/DEPLOYMENT.md)
- [Security, SSRF & Compliance Controls](docs/SECURITY.md)
- [Current State Audit](docs/CURRENT_STATE_AUDIT.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)
