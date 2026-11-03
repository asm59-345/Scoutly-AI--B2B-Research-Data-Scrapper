"""
Analytics service for Scoutly AI.
Aggregates lead discovery statistics, industry distributions,
geographic coverage, and pipeline metrics strictly using the persistent SQLite database.
"""

from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from database.models import LeadRecord, ResearchJob

class AnalyticsService:
    @staticmethod
    def get_overview_metrics(db: Session) -> Dict[str, Any]:
        """Calculates headline summary metrics across all saved and processed leads."""
        total_leads = db.query(func.count(LeadRecord.id)).scalar() or 0
        total_jobs = db.query(func.count(ResearchJob.id)).scalar() or 0
        completed_jobs = db.query(func.count(ResearchJob.id)).filter(ResearchJob.status == "Completed").scalar() or 0
        
        leads_with_email = db.query(func.count(LeadRecord.id)).filter(
            LeadRecord.contact_email != "", LeadRecord.contact_email != None
        ).scalar() or 0

        leads_with_phone = db.query(func.count(LeadRecord.id)).filter(
            LeadRecord.contact_number != "", LeadRecord.contact_number != None
        ).scalar() or 0

        leads_with_exec = db.query(func.count(LeadRecord.id)).filter(
            LeadRecord.contact_person_name != "", LeadRecord.contact_person_name != None
        ).scalar() or 0

        verified_leads = db.query(func.count(LeadRecord.id)).filter(
            LeadRecord.confidence_score >= 75
        ).scalar() or 0

        return {
            "total_leads_discovered": total_leads,
            "total_searches_executed": total_jobs,
            "successful_searches": completed_jobs,
            "verified_leads": verified_leads,
            "leads_with_email": leads_with_email,
            "leads_with_phone": leads_with_phone,
            "leads_with_decision_maker": leads_with_exec,
            "email_penetration_rate": f"{round((leads_with_email / total_leads * 100), 1)}%" if total_leads > 0 else "0.0%",
            "decision_maker_rate": f"{round((leads_with_exec / total_leads * 100), 1)}%" if total_leads > 0 else "0.0%"
        }

    @staticmethod
    def get_leads_by_category(db: Session) -> List[Dict[str, Any]]:
        """Aggregates leads grouped by category vertical."""
        results = (
            db.query(LeadRecord.category, func.count(LeadRecord.id).label("count"))
            .group_by(LeadRecord.category)
            .order_by(func.count(LeadRecord.id).desc())
            .limit(10)
            .all()
        )
        return [{"category": (r[0] or "General B2B"), "count": r[1]} for r in results]

    @staticmethod
    def get_leads_by_city(db: Session) -> List[Dict[str, Any]]:
        """Aggregates leads grouped by city location."""
        results = (
            db.query(LeadRecord.city, func.count(LeadRecord.id).label("count"))
            .group_by(LeadRecord.city)
            .order_by(func.count(LeadRecord.id).desc())
            .limit(10)
            .all()
        )
        return [{"city": (r[0] or "Local Market"), "count": r[1]} for r in results]

    @staticmethod
    def get_search_history(db: Session, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieves past research queries and execution states."""
        jobs = db.query(ResearchJob).order_by(ResearchJob.created_at.desc()).limit(limit).all()
        history = []
        for j in jobs:
            history.append({
                "job_id": j.id,
                "city": j.city,
                "state": j.state,
                "country": j.country,
                "status": j.status,
                "subcategories": j.selected_subcategories,
                "created_at": j.created_at.isoformat() if j.created_at else None,
                "completed_at": j.completed_at.isoformat() if j.completed_at else None
            })
        return history

