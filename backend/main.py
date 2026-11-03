import os
import json
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from scraper_core import MASTER_TAXONOMY
from database.connection import init_db, get_db
from database.models import ResearchJob, LeadRecord, ResearchProject
from services.job_queue import (
    ScrapingRequest,
    active_jobs_progress,
    run_async_scraper_pipeline
)
from services.ai_service import AIService
from services.outreach_service import OutreachService

# Initialize SQLite database schema
init_db()

app = FastAPI(
    title="Scoutly AI — B2B Research & Lead Intelligence Engine",
    description="Engine API supporting Google Maps extraction, website contact discovery, and AI research capabilities.",
    version="1.0.0"
)

# CORS Configuration with environment override
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 0. ROOT & HEALTH ENDPOINTS ---

@app.get("/")
def root():
    """Root entry point: returns service identity and pointers to UI and Docs."""
    return {
        "service": "Scoutly AI — B2B Research & Lead Intelligence",
        "version": "1.2.0",
        "status": "online",
        "frontend_ui": "http://127.0.0.1:5173",
        "documentation": "/docs",
        "health": "/api/health"
    }

# --- 1. LEGACY COMPATIBILITY ENDPOINTS (100% PRESERVED) ---

@app.get("/api/categories")
def get_categories_structure():
    """Returns the complete MASTER_TAXONOMY structure."""
    return MASTER_TAXONOMY

@app.post("/api/scrape/start")
def start_lead_generation(payload: ScrapingRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Initiates asynchronous lead generation workflow.
    Preserves exact legacy endpoint contract and JOB_<timestamp> ID format.
    """
    if not payload.selected_subcategories:
        raise HTTPException(status_code=400, detail="Subcategory array cannot remain empty bounds.")
    
    job_id = f"JOB_{int(time.time())}"
    
    # In-memory progress tracking structure matching frontend expectations
    active_jobs_progress[job_id] = {
        "status": "Queued",
        "logs": [f"[{time.strftime('%H:%M:%S')}] Workflow initialization active. Awaiting worker execution..."],
        "records": []
    }
    
    # Persist job record in database
    try:
        db_job = ResearchJob(
            id=job_id,
            user_id=payload.user_id,
            project_id=payload.project_id,
            category_group_id=payload.category_group_id,
            selected_subcategories=json.dumps(payload.selected_subcategories),
            country=payload.country,
            state=payload.state or "",
            city=payload.city,
            search_limit=payload.limit or 20,
            headless=payload.headless if payload.headless is not None else True,
            status="Queued"
        )
        db.add(db_job)
        db.commit()
    except Exception as e:
        print(f"Warning: Failed to persist job {job_id} to DB: {e}")

    # Enqueue pipeline execution to background worker
    background_tasks.add_task(run_async_scraper_pipeline, job_id, payload)
    
    return {"job_id": job_id, "status": "Initiated"}

@app.get("/api/scrape/status/{job_id}")
def check_job_status(job_id: str, db: Session = Depends(get_db)):
    """
    Returns progress logs and newly scraped records.
    If job completed and not in-memory, recovers from SQLite database.
    """
    if job_id in active_jobs_progress:
        return active_jobs_progress[job_id]
    
    # Fallback: check SQLite database for historical jobs
    db_job = db.query(ResearchJob).filter(ResearchJob.id == job_id).first()
    if db_job:
        db_records = db.query(LeadRecord).filter(LeadRecord.job_id == job_id).all()
        records_list = []
        for idx, rec in enumerate(db_records, start=1):
            records_list.append({
                "Sl.": idx,
                "Firm Name": rec.firm_name,
                "Contact Number": rec.contact_number,
                "Contact Email": rec.contact_email,
                "Contact Person Name": rec.contact_person_name,
                "Address": rec.address,
                "Website URL": rec.website_url,
                "confidence_score": rec.confidence_score,
                "verification_status": rec.verification_status,
                "is_pinned": rec.is_pinned,
                "notes": rec.notes
            })
        return {
            "status": db_job.status,
            "logs": [f"[{time.strftime('%H:%M:%S')}] Restored {len(records_list)} historical records from persistent database."],
            "records": records_list
        }

    return {"status": "Not Found", "logs": ["[SYSTEM ERROR] Job token mismatch."], "records": []}


# --- 2. SCOUTLY AI EXTENDED APIS (V1 COMPATIBLE EXTENSIONS) ---

class PromptParseRequest(BaseModel):
    prompt: str

class SummarizeRequest(BaseModel):
    firm_name: str
    website_url: Optional[str] = ""
    address: Optional[str] = ""
    category: Optional[str] = ""
    snippets: Optional[List[str]] = None

class LeadNotesUpdate(BaseModel):
    notes: Optional[str] = ""
    tags: Optional[str] = ""

class OutreachDraftRequest(BaseModel):
    firm_name: str
    contact_person: Optional[str] = ""
    category: Optional[str] = ""
    website_url: Optional[str] = ""
    pitch_type: Optional[str] = "partnership"

class BulkActionRequest(BaseModel):
    lead_ids: List[str]
    action: str  # "pin", "unpin", "tag", "delete"
    tag_value: Optional[str] = ""

@app.get("/api/health")
def health_check():
    """Health check endpoint for container orchestrators and monitoring."""
    return {
        "status": "healthy",
        "service": "Scoutly AI Engine",
        "timestamp": time.time(),
        "database": "sqlite_connected"
    }

@app.post("/api/v1/research/parse-prompt")
def parse_research_prompt(payload: PromptParseRequest):
    """
    AI-powered natural language prompt parser.
    Converts unstructured search queries into validated parameters matching MASTER_TAXONOMY.
    """
    if not payload.prompt.strip():
        raise HTTPException(status_code=400, detail="Search prompt cannot be empty.")
    return AIService.parse_natural_language_prompt(payload.prompt)

@app.post("/api/v1/leads/summarize")
def summarize_lead(payload: SummarizeRequest):
    """
    Generates an evidence-grounded summary of a business lead based strictly on verified inputs.
    """
    return AIService.summarize_business_profile(
        firm_name=payload.firm_name,
        website_url=payload.website_url or "",
        address=payload.address or "",
        category=payload.category or "",
        snippets=payload.snippets
    )

@app.post("/api/v1/leads/draft-outreach")
def draft_lead_outreach(payload: OutreachDraftRequest):
    """
    Generates tailored, professional sales & partnership outreach emails grounded in lead attributes.
    """
    return OutreachService.generate_draft(
        firm_name=payload.firm_name,
        contact_person=payload.contact_person,
        category=payload.category,
        website_url=payload.website_url,
        pitch_type=payload.pitch_type or "partnership"
    )

@app.post("/api/v1/leads/bulk-action")
def bulk_manage_leads(payload: BulkActionRequest, db: Session = Depends(get_db)):
    """Executes bulk operations (pin, unpin, tag, delete) across multiple lead records."""
    if not payload.lead_ids:
        raise HTTPException(status_code=400, detail="Lead ID list cannot be empty.")
    
    leads = db.query(LeadRecord).filter(LeadRecord.id.in_(payload.lead_ids)).all()
    count = len(leads)

    if payload.action == "pin":
        for l in leads: l.is_pinned = True
    elif payload.action == "unpin":
        for l in leads: l.is_pinned = False
    elif payload.action == "tag" and payload.tag_value:
        for l in leads:
            current_tags = [t.strip() for t in (l.tags or "").split(",") if t.strip()]
            if payload.tag_value not in current_tags:
                current_tags.append(payload.tag_value)
                l.tags = ", ".join(current_tags)
    elif payload.action == "delete":
        for l in leads: db.delete(l)

    db.commit()
    return {"status": "success", "affected_records": count, "action": payload.action}

@app.get("/api/v1/leads/saved")
def get_saved_leads(
    limit: int = Query(50, ge=1, le=200),
    pinned_only: bool = Query(False),
    has_email: Optional[bool] = Query(None),
    min_score: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieves persisted leads with deduplication, multi-filter criteria, and confidence scores."""
    query = db.query(LeadRecord)
    if pinned_only:
        query = query.filter(LeadRecord.is_pinned == True)
    if has_email is True:
        query = query.filter(LeadRecord.contact_email != "", LeadRecord.contact_email != None)
    if min_score is not None:
        query = query.filter(LeadRecord.confidence_score >= min_score)

    records = query.order_by(LeadRecord.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": r.id,
            "dedup_key": r.dedup_key,
            "Firm Name": r.firm_name,
            "Contact Number": r.contact_number,
            "Contact Email": r.contact_email,
            "Contact Person Name": r.contact_person_name,
            "Address": r.address,
            "Website URL": r.website_url,
            "confidence_score": r.confidence_score,
            "verification_status": r.verification_status,
            "is_pinned": r.is_pinned,
            "notes": r.notes,
            "tags": r.tags,
            "created_at": r.created_at.isoformat() if r.created_at else None
        }
        for r in records
    ]

@app.post("/api/v1/leads/{lead_id}/pin")
def toggle_lead_pin(lead_id: str, db: Session = Depends(get_db)):
    """Toggles the pinned status of a lead record."""
    lead = db.query(LeadRecord).filter(LeadRecord.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")
    lead.is_pinned = not lead.is_pinned
    db.commit()
    return {"id": lead.id, "is_pinned": lead.is_pinned}

@app.put("/api/v1/leads/{lead_id}/notes")
def update_lead_notes(lead_id: str, payload: LeadNotesUpdate, db: Session = Depends(get_db)):
    """Updates notes and tags for a lead record."""
    lead = db.query(LeadRecord).filter(LeadRecord.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found.")
    if payload.notes is not None:
        lead.notes = payload.notes
    if payload.tags is not None:
        lead.tags = payload.tags
    db.commit()
    return {"id": lead.id, "notes": lead.notes, "tags": lead.tags}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
