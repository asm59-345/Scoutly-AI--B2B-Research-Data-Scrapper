# Scoutly AI — Phased Implementation Plan

This implementation plan details the transformation of the Lead Harvester codebase into **Scoutly AI — B2B Research & Lead Intelligence**, while ensuring zero regression in existing scraper logic and API contracts.

---

## Phase Overview

| Phase | Title | Core Objectives | Status |
|-------|-------|-----------------|--------|
| **Phase 0** | Repository Audit & Baseline | Inspect repo, generate baseline audit, contracts, and test baseline. | **In Progress** |
| **Phase 1** | Design System & Shell | Establish Scoutly AI brand, Lucide icons, Dark/Light theme, tokens, responsive layout. | **Next** |
| **Phase 2** | API & Compatibility Layer | Wrap existing scraper behind a Provider interface; preserve legacy endpoints. | Planned |
| **Phase 3** | UI & Intelligence Modules | Implement search workspace, natural-language prompt parser, enhanced table, profile drawer, CSV formula protection. | Planned |
| **Phase 4** | Persistence & Security | Implement SQLite/SQLAlchemy ORM models, SSRF protection for website crawler, and safe exports. | Planned |
| **Phase 5** | AI Services & Queue Architecture | Pluggable AI research provider (grounded, zero hallucination), and Celery/Redis worker option alongside BackgroundTasks. | Planned |
| **Phase 6** | Comprehensive Testing Suite | Pytest test suite, API contract tests, SSRF security tests, formula injection checks, frontend build validation. | Planned |
| **Phase 7** | Packaging & Documentation | Dockerfiles, Docker Compose, CI workflows, PRD, TRD, System Design, Security, and Deployment guides. | Planned |
| **Phase 8** | Release Verification | Final smoke test, verification checklist, release verification. | Planned |

---

## Detailed Step-by-Step Execution Plan

### Phase 0: Baseline & Audit
1. Audit repository structure, dependencies, endpoints, and data flows (`docs/CURRENT_STATE_AUDIT.md`).
2. Document verified API contracts and backwards compatibility guarantees (`docs/API.md`).
3. Formulate implementation roadmap (`docs/IMPLEMENTATION_PLAN.md`).
4. Establish baseline tests with pytest and frontend build verification.

### Phase 1: Design System, Product Branding & Frontend Shell
1. Install `lucide-react` for clean, accessible icon primitives.
2. Establish Scoutly AI design system tokens (warm off-white/deep charcoal, subtle indigo accent, legible sans-serif, rounded-lg/xl, clean borders).
3. Implement theme toggle (Light / Dark mode) with `localStorage` persistence and system preference detection.
4. Build humanoid/geometric AI assistant indicator ("Scoutly Assistant").
5. Create accessible navigation header, tabs (Research Workspace, Live Jobs, Saved Leads, Settings), and breadcrumbs.

### Phase 2: Backend Compatibility Layer & Scraper Provider
1. Create `backend/providers/base.py` defining `DiscoveryProvider` interface.
2. Create `backend/providers/selenium_maps.py` wrapping the unmodified `GoogleMapsScraper` from `scraper_core.py`.
3. Preserve existing `/api/categories`, `/api/scrape/start`, and `/api/scrape/status/{job_id}` endpoints unchanged.
4. Ensure `JOB_<epoch>` identifiers and response JSON contracts maintain 100% fidelity.

### Phase 3: Research Workspace, Results Table, Drawer & Safe Exports
1. Natural language search parser on the frontend + backend endpoint `/api/v1/research/parse-prompt` matching prompt intents to taxonomy and geo targets.
2. Category and subcategory selection matrix with live chips and search filter.
3. Enhanced Results Table with pagination/virtualization, field-level verification badges (Found on Source vs Syntax Valid vs Stale), and sorting.
4. Business Profile Drawer showing lead evidence, source URLs, executive title matches, and warnings.
5. Formula injection mitigation for CSV export (prefixing `=`, `+`, `-`, `@`, `\t` with single quote `'`).
6. Preserved Times New Roman corporate-styled Excel export.

### Phase 4: Persistence & DevSecOps Safeguards
1. SQLite/SQLAlchemy models: User, ResearchProject, ResearchJob, LeadRecord, ContactEvidence.
2. Automatic persistence of job records to local SQLite database (`scoutly.db`).
3. SSRF Defense Module (`backend/security/ssrf.py`):
   - Resolve hostname to IP addresses before HTTP calls.
   - Deny loopback (`127.0.0.0/8`, `::1`), private (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), link-local (`169.254.0.0/16`), and multicast addresses.
   - Validate redirect targets before following redirects.
4. CORS restriction via configurable environment variable (`ALLOWED_ORIGINS`).

### Phase 5: Pluggable AI Service & Queue Architecture
1. Grounded AI service interface (`backend/services/ai_service.py`):
   - Grounded prompt parsing.
   - Business evidence summarizer (strictly factual, zero invented contact data).
   - Scoring algorithm with transparent explainability rules.
2. Queue service adapter (`backend/services/job_queue.py`):
   - In-memory `FastAPI.BackgroundTasks` default.
   - Ready Celery/Redis configuration template for high-volume enterprise deployments.

### Phase 6: Testing & Quality Assurance
1. Unit tests: taxonomy query generation, formula injection escaping, SSRF filter validation, grounded prompt parser.
2. Contract tests: validating `/api/categories`, `/api/scrape/start`, and `/api/scrape/status/{job_id}` against legacy schemas.
3. Integration tests: job creation and status polling.
4. Frontend build and linting verification.

### Phase 7: Production Containerization & Comprehensive Documentation
1. Production `Dockerfile` for backend and `Dockerfile` for frontend.
2. Root `docker-compose.yml` for unified local stack orchestration.
3. Production configuration: `.env.example`, `.dockerignore`, `.gitignore`.
4. Comprehensive docs: `PRD.md`, `TRD.md`, `SYSTEM_DESIGN.md`, `ARCHITECTURE.md`, `TESTING.md`, `DEPLOYMENT.md`, `SECURITY.md`, and updated `README.md`.

### Phase 8: Verification & Release Approval
1. Execute full verification suite.
2. Confirm all features work smoothly.
3. Compile final audit report.

