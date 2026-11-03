# Product Requirements Document (PRD) — Scoutly AI

**Product Name:** Scoutly AI — B2B Research & Lead Intelligence  
**Tagline:** "Discover businesses. Research smarter. Find better prospects."  
**Document Version:** 1.0.0  
**Status:** Implemented & Verified  

---

## 1. Vision & Executive Summary

Scoutly AI transforms manual sales prospecting and fragmented lead hunting into an automated, AI-guided intelligence engine. By automating discovery across local commerce, professional hubs, and corporate verticals—and validating publicly indexed contact points via website enrichment—Scoutly AI delivers structured, validated lead matrices for B2B development teams.

---

## 2. Target Users & Personas

1. **B2B Outbound Sales & SDR Teams:**
   - Need reliable phone numbers, validated direct emails, and verified decision-maker names (CEO, Owner, Founder).
2. **Growth Marketers & Agencies:**
   - Need localized target lists across niche industry verticals (e.g., diagnostic labs, automotive workshops, tech startups).
3. **Market Researchers & Analysts:**
   - Require geographic coverage metrics, presence of digital footprint, and structured export data (CSV/Excel).

---

## 3. Core Features & Capabilities

### 3.1 Grounded AI Research Workspace
- **Natural Language Parsing:** Converts plain-English queries (e.g. *"Find independent automotive service businesses in Lucknow"*) into validated schema parameters.
- **Strict Taxonomy Matching:** Queries are mapped to the 11-category Master Taxonomy without hallucinating fake verticals.

### 3.2 Real-Time Automated Extraction Pipeline
- Headless Selenium automation extracting verified business entities directly from maps and directories.
- Streamed execution logs and live record updates delivered asynchronously via polling without page refreshes.

### 3.3 Deep Website Enrichment & Validation
- Crawls company homepages, `/contact`, `/about`, and `/team` subpages.
- Extracts decision-maker names using executive regex heuristics (Founder, CEO, Director, Partner).
- Extracts public corporate emails prioritizing executive keywords (`owner@`, `ceo@`, `info@`).

### 3.4 Lead Scoring & Detail Drawer
- Transparent 100-point explainability score (Domain presence, telephone reachability, email discovery, decision-maker name).
- Profile drawer with source provenance links and evidence-grounded AI summarization.

### 3.5 DevSecOps & Enterprise Controls
- **SSRF Defense:** Prevents server-side request forgery by blocking private IP ranges, loopback, and cloud metadata IPs (`169.254.169.254`).
- **Spreadsheet Sanitization:** Neutralizes formula injection vulnerabilities (CWE-1236) on CSV exports.
- **Data Persistence:** SQLite/SQLAlchemy database models for durable storage across service restarts.

---

## 4. Success Metrics

- **Zero API Contract Regressions:** 100% backward compatibility on `/api/categories`, `/api/scrape/start`, and `/api/scrape/status/{job_id}`.
- **Pipeline Reliability:** 100% test pass rate across unit, contract, sanitization, and SSRF security suites.
- **Data Integrity:** Strict grounding guarantee—no hallucinated contact info, revenues, or company sizes.

