# Deployment & Production Operations Guide — Scoutly AI

---

## 1. Local Development Setup

### 1.1 Backend Service
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```
- Interactive API Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 1.2 Frontend Application
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
- Web Application: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 2. Docker Containerized Deployment

Run the complete multi-service architecture locally using Docker Compose:

```bash
# Build and run containers in detached mode
docker-compose up -d --build

# View container logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 3. Production Environment Separation Recommendations

- **Frontend:** Deploy to a managed static hosting CDN (Vercel, Cloudflare Pages, or AWS S3 + CloudFront).
- **Backend API:** Managed container service (AWS ECS, Google Cloud Run, or Railway) running FastAPI.
- **Worker Pipeline:** Long-running container worker for headless Chrome / Selenium or background jobs.
- **Database:** Managed PostgreSQL (AWS RDS / Supabase) by changing `DATABASE_URL` in `.env`.
- **Artifact Exports:** Private S3 bucket or equivalent object storage with pre-signed URLs.

---

## 4. Rollback & Backup Procedures

1. **Database Backup:**
   - For SQLite: Copy `scoutly.db` to safe backup storage:
     ```bash
     sqlite3 scoutly.db ".backup 'scoutly_backup_$(date +%Y%m%d).db'"
     ```
2. **Container Rollback:**
   - Tag releases (`scoutly-backend:1.0.0`, `scoutly-backend:1.0.1`).
   - If a failure occurs in deployment, redeploy the previous container tag.

