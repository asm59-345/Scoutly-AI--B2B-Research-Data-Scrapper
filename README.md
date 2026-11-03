# Scoutly AI — B2B Research & Lead Intelligence

> **"Discover businesses. Research smarter. Find better prospects."**

Scoutly AI is a B2B research workspace and automated lead intelligence platform that extracts verified commercial listings, enriches them with public executive contact details, and provides grounded AI research assistance.

---

## 🚀 Key Features

- **Grounded AI Prompt Parser:** Convert plain-English prompts into structured, validated search queries mapped strictly to industry taxonomy.
- **Automated Discovery Engine:** Headless Selenium automation extracting business names, phone numbers, addresses, and websites.
- **Deep Website Enrichment:** Crawls `/contact`, `/about`, and `/team` pages to detect verified corporate emails and decision-maker names (Founders, CEOs, Directors).
- **Explainable Lead Scoring:** 100-point transparent qualification score based on domain verification, reachable telephone line, public email, and identified decision maker.
- **Durable Persistence:** SQLite/SQLAlchemy models store research jobs, progress logs, deduplicated leads, and notes across server restarts.
- **Safe Export Engine:** Automated Times New Roman corporate Excel spreadsheets and formula-injection-safe CSV downloads.
- **DevSecOps & SSRF Protection:** Outbound website crawler blocks private RFC1918 subnets, loopbacks, and cloud metadata endpoints (`169.254.169.254`).
- **Minimalist SaaS Design:** Responsive light and dark mode interface built with React 18, Tailwind CSS, and Lucide icons.

---

## 🛠️ Tech Stack

- **Backend:** Python 3.11+, FastAPI, Uvicorn, Selenium, Requests, BeautifulSoup4, SQLAlchemy, Pydantic, OpenPyXL, Pandas, Pytest.
- **Frontend:** React 18, Vite 5, TailwindCSS 3, Lucide React.
- **Storage:** SQLite (zero-config local persistence; PostgreSQL compatible).
- **Deployment:** Docker & Docker Compose.

---

## 🏁 Quickstart

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Google Chrome installed (for Selenium automation)

### 1. Run Backend
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## 🧪 Testing

Execute the backend test suite:
```bash
cd backend
python -m pytest tests -v
```
All 19 test cases verify:
- Master taxonomy & query generation
- API contract compliance (legacy & extended)
- Formula injection protection (CSV/Excel)
- SSRF security filters (blocking private/metadata IPs)
- Grounded AI prompt parsing and explainable scoring

---

## 🐳 Docker Deployment

To run both services in Docker containers:
```bash
docker-compose up -d --build
```
Access the application at [http://localhost:5173](http://localhost:5173).

---

## 📚 Complete Documentation Suite

All detailed engineering documentation is available in the [`docs/`](./docs) directory:
- [Current State Audit](docs/CURRENT_STATE_AUDIT.md)
- [Product Requirements Document (PRD)](docs/PRD.md)
- [Technical Requirements Document (TRD)](docs/TRD.md)
- [System Design Document](docs/SYSTEM_DESIGN.md)
- [Architecture Guide](docs/ARCHITECTURE.md)
- [API Specification](docs/API.md)
- [Testing Strategy & Reports](docs/TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Security & Compliance](docs/SECURITY.md)
- [Implementation Plan](docs/IMPLEMENTATION_PLAN.md)

