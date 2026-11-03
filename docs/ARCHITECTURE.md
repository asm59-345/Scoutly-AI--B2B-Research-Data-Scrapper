# Architecture Document — Scoutly AI

## 1. Directory Structure

```
scoutly-ai/
├── backend/
│   ├── main.py                     # FastAPI server, endpoints, lifecycle management
│   ├── scraper_core.py             # Preserved GoogleMapsScraper implementation
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # Production container definition
│   ├── database/
│   │   ├── connection.py           # SQLAlchemy engine, session factory, dedup key
│   │   └── models.py               # ORM models (User, Project, Job, Lead, Event)
│   ├── providers/
│   │   ├── base.py                 # Abstract DiscoveryProvider interface
│   │   └── selenium_maps.py        # Adapter wrapping scraper_core.py
│   ├── security/
│   │   ├── ssrf.py                 # Outbound IP verification & DNS resolution guard
│   │   └── sanitization.py         # CSV & Excel formula injection defense
│   ├── services/
│   │   ├── ai_service.py           # Grounded prompt parser, scoring & summarization
│   │   └── job_queue.py            # Job coordinator & background worker pipeline
│   └── tests/
│       ├── test_taxonomy.py        # Master taxonomy integrity tests
│       ├── test_sanitization.py    # Formula injection tests
│       ├── test_security_ssrf.py   # SSRF defense tests
│       ├── test_ai_service.py      # Grounded AI logic tests
│       └── test_api_contract.py    # FastAPI contract regression tests
├── frontend/
│   ├── index.html                  # HTML entry point
│   ├── package.json                # React 18, Vite 5, Tailwind 3, Lucide icons
│   ├── vite.config.js              # Dev proxy configuration
│   ├── tailwind.config.js          # Design system color tokens & dark mode
│   ├── Dockerfile                  # Multi-stage production container
│   └── src/
│       ├── main.jsx                # React root
│       ├── index.css               # Base CSS & font smoothing
│       └── App.jsx                 # Scoutly AI workspace & drawer UI
├── docs/                           # Full engineering documentation suite
├── docker-compose.yml              # Multi-container orchestration
├── .env.example                    # Template environment variables
└── README.md                       # Master product documentation
```

---

## 2. Dependency Inversion & Adapter Pattern

Scoutly AI isolates external scraping libraries and automation scripts behind the `DiscoveryProvider` abstract interface. This ensures that future providers (e.g. Official Google Places API, Clearbit, ZoomInfo) can be swapped in without modifying controller logic or API contracts:

```
[ FastAPI Routes ]
        │
        ▼
[ Job Coordinator ]
        │
        ▼
[ DiscoveryProvider Interface ] ◄── (Dependency Inversion)
        │
        ├── SeleniumGoogleMapsProvider (Current) ──> GoogleMapsScraper (Preserved)
        └── LicensedAPIProvider (Future Extensibility)
```

