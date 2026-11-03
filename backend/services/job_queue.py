"""
Job execution coordinator and progress tracker for Scoutly AI.
Maintains in-memory dictionary for ultra-fast polling while persisting jobs,
events, and leads to SQLite for durability.
"""

import time
import uuid
import datetime
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from providers.selenium_maps import SeleniumGoogleMapsProvider
from database.connection import SessionLocal, generate_lead_dedup_key
from database.models import ResearchJob, JobProgressEvent, LeadRecord
from security.sanitization import sanitize_cell_value
from services.ai_service import AIService

logger = logging.getLogger(__name__)

class ScrapingRequest(BaseModel):
    category_group_id: str
    selected_subcategories: List[str]
    country: str
    state: Optional[str] = ""
    city: str
    limit: Optional[int] = 20
    headless: Optional[bool] = True
    project_id: Optional[str] = None
    user_id: Optional[str] = None

# In-memory dictionary for real-time polling backward compatibility
active_jobs_progress: Dict[str, Dict[str, Any]] = {}

def log_event(job_id: str, msg: str, event_type: str = "INFO"):
    """Appends to in-memory logs and writes to database progress events."""
    timestamp = time.strftime("%H:%M:%S")
    formatted_msg = f"[{timestamp}] {msg}"
    
    if job_id in active_jobs_progress:
        active_jobs_progress[job_id]["logs"].append(formatted_msg)

    try:
        db = SessionLocal()
        event = JobProgressEvent(
            job_id=job_id,
            log_message=formatted_msg,
            event_type=event_type,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(event)
        db.commit()
        db.close()
    except Exception as e:
        logger.error(f"Failed to persist job progress event: {e}")

def persist_lead_to_db(job_id: str, lead_dict: Dict[str, Any], project_id: Optional[str] = None):
    """Saves lead to database if not already existing, computing deduplication key."""
    firm_name = lead_dict.get("Firm Name", "").strip()
    if not firm_name:
        return

    city = lead_dict.get("city", "")
    website = lead_dict.get("Website URL", "")
    dedup_key = generate_lead_dedup_key(firm_name, city, website)

    try:
        db = SessionLocal()
        existing = db.query(LeadRecord).filter(LeadRecord.dedup_key == dedup_key).first()
        score_info = AIService.calculate_lead_score(lead_dict)

        if not existing:
            new_lead = LeadRecord(
                id=str(uuid.uuid4()),
                dedup_key=dedup_key,
                project_id=project_id,
                job_id=job_id,
                firm_name=firm_name,
                contact_number=lead_dict.get("Contact Number", ""),
                contact_email=lead_dict.get("Contact Email", ""),
                contact_person_name=lead_dict.get("Contact Person Name", ""),
                address=lead_dict.get("Address", ""),
                website_url=website,
                confidence_score=score_info["score"],
                verification_status=score_info["verification_status"],
                created_at=datetime.datetime.utcnow()
            )
            db.add(new_lead)
            db.commit()
        db.close()
    except Exception as e:
        logger.error(f"Database error persisting lead record: {e}")

def run_async_scraper_pipeline(job_id: str, payload: ScrapingRequest):
    """
    Core worker routine executing the search and enrichment pipeline.
    Maintains compatibility with GoogleMapsScraper while enforcing safety & persistence.
    """
    if job_id not in active_jobs_progress:
        active_jobs_progress[job_id] = {
            "status": "Running",
            "logs": [],
            "records": []
        }
    else:
        active_jobs_progress[job_id]["status"] = "Running"

    geo_suffix = f"{payload.city}, {payload.state}, {payload.country}".replace(", ,", ",")
    log_event(job_id, f"Initiating Scoutly AI research runner for {geo_suffix}")

    # Update DB job status
    try:
        db = SessionLocal()
        db_job = db.query(ResearchJob).filter(ResearchJob.id == job_id).first()
        if db_job:
            db_job.status = "Running"
            db.commit()
        db.close()
    except Exception as e:
        logger.error(f"Failed to update job status: {e}")

    try:
        provider = SeleniumGoogleMapsProvider(headless=payload.headless)
        cumulative_records = []

        for sub_cat in payload.selected_subcategories:
            constructed_query = f"{sub_cat} in {geo_suffix}"
            
            def scraper_log_callback(msg):
                log_event(job_id, msg)

            records = provider.search_and_extract(
                query=constructed_query,
                limit=payload.limit or 20,
                log_callback=scraper_log_callback
            )

            if job_id in active_jobs_progress:
                for rec in records:
                    rec["city"] = payload.city
                    rec["category"] = sub_cat
                    # Calculate explainable score
                    score_info = AIService.calculate_lead_score(rec)
                    rec["confidence_score"] = score_info["score"]
                    rec["verification_status"] = score_info["verification_status"]

                    if rec not in cumulative_records:
                        cumulative_records.append(rec)
                        persist_lead_to_db(job_id, rec, payload.project_id)

                active_jobs_progress[job_id]["records"] = list(cumulative_records)

        provider.shutdown()

        if job_id in active_jobs_progress:
            active_jobs_progress[job_id]["status"] = "Completed"
            log_event(job_id, "Batch sequence targets compiled successfully.")

        try:
            db = SessionLocal()
            db_job = db.query(ResearchJob).filter(ResearchJob.id == job_id).first()
            if db_job:
                db_job.status = "Completed"
                db_job.completed_at = datetime.datetime.utcnow()
                db.commit()
            db.close()
        except Exception:
            pass

    except Exception as e:
        logger.error(f"Pipeline error for job {job_id}: {e}", exc_info=True)
        if job_id in active_jobs_progress:
            active_jobs_progress[job_id]["status"] = "Failed"
            log_event(job_id, f"[ERROR] Engine system loop alert: {str(e)}", "ERROR")

        try:
            db = SessionLocal()
            db_job = db.query(ResearchJob).filter(ResearchJob.id == job_id).first()
            if db_job:
                db_job.status = "Failed"
                db_job.completed_at = datetime.datetime.utcnow()
                db.commit()
            db.close()
        except Exception:
            pass

