"""
SQLAlchemy ORM Data Models for Scoutly AI.
Includes models for users, projects, research jobs, leads, contact evidence, tags, exports, and audit logs.
"""

import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, Index, UniqueConstraint
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    account_tier = Column(String(50), default="standard", nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    projects = relationship("ResearchProject", back_populates="user", cascade="all, delete-orphan")
    jobs = relationship("ResearchJob", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class ResearchProject(Base):
    __tablename__ = "research_projects"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="projects")
    jobs = relationship("ResearchJob", back_populates="project")
    leads = relationship("LeadRecord", back_populates="project", cascade="all, delete-orphan")

class ResearchJob(Base):
    __tablename__ = "research_jobs"

    id = Column(String(64), primary_key=True)  # Format: JOB_<timestamp> for legacy compatibility
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True, index=True)
    project_id = Column(String(64), ForeignKey("research_projects.id"), nullable=True, index=True)
    
    category_group_id = Column(String(64), nullable=False)
    selected_subcategories = Column(Text, nullable=False)  # JSON-encoded array
    country = Column(String(100), nullable=False)
    state = Column(String(100), default="", nullable=False)
    city = Column(String(100), nullable=False)
    search_limit = Column(Integer, default=20, nullable=False)
    headless = Column(Boolean, default=True, nullable=False)
    
    status = Column(String(50), default="Queued", nullable=False, index=True)  # Queued, Running, Completed, Failed
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    
    user = relationship("User", back_populates="jobs")
    project = relationship("ResearchProject", back_populates="jobs")
    events = relationship("JobProgressEvent", back_populates="job", cascade="all, delete-orphan")
    leads = relationship("LeadRecord", back_populates="job")

class JobProgressEvent(Base):
    __tablename__ = "job_progress_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(String(64), ForeignKey("research_jobs.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    log_message = Column(Text, nullable=False)
    event_type = Column(String(50), default="INFO", nullable=False)  # INFO, ERROR, PROGRESS

    job = relationship("ResearchJob", back_populates="events")

class LeadRecord(Base):
    __tablename__ = "lead_records"

    id = Column(String(64), primary_key=True)
    dedup_key = Column(String(255), unique=True, nullable=False, index=True)  # normalized hash(name + city + website)
    
    project_id = Column(String(64), ForeignKey("research_projects.id"), nullable=True, index=True)
    job_id = Column(String(64), ForeignKey("research_jobs.id"), nullable=True, index=True)
    
    firm_name = Column(String(255), nullable=False, index=True)
    contact_number = Column(String(100), default="", nullable=False)
    contact_email = Column(String(255), default="", nullable=False, index=True)
    contact_person_name = Column(String(255), default="", nullable=False)
    address = Column(Text, default="", nullable=False)
    website_url = Column(String(500), default="", nullable=False)
    
    # Enrichment metadata
    category = Column(String(100), default="", nullable=False)
    city = Column(String(100), default="", nullable=False)
    state = Column(String(100), default="", nullable=False)
    country = Column(String(100), default="", nullable=False)
    
    confidence_score = Column(Float, default=0.0, nullable=False)
    verification_status = Column(String(50), default="unverified", nullable=False)  # unverified, found_on_source, syntax_valid
    notes = Column(Text, default="", nullable=False)
    tags = Column(String(255), default="", nullable=False)  # comma separated
    is_pinned = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("ResearchProject", back_populates="leads")
    job = relationship("ResearchJob", back_populates="leads")
    evidences = relationship("ContactEvidence", back_populates="lead", cascade="all, delete-orphan")

class ContactEvidence(Base):
    __tablename__ = "contact_evidence"

    id = Column(Integer, primary_key=True, autoincrement=True)
    lead_id = Column(String(64), ForeignKey("lead_records.id"), nullable=False, index=True)
    field_name = Column(String(50), nullable=False)  # email, phone, executive_name, address
    source_url = Column(String(500), nullable=False)
    raw_snippet = Column(Text, nullable=False)
    discovered_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    lead = relationship("LeadRecord", back_populates="evidences")

class SavedSearch(Base):
    __tablename__ = "saved_searches"

    id = Column(String(64), primary_key=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    prompt = Column(Text, nullable=True)
    search_parameters = Column(Text, nullable=False)  # JSON-encoded parameters
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class ExportArtifact(Base):
    __tablename__ = "export_artifacts"

    id = Column(String(64), primary_key=True)
    job_id = Column(String(64), nullable=True, index=True)
    file_format = Column(String(20), nullable=False)  # csv, xlsx
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    record_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(64), ForeignKey("users.id"), nullable=True, index=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=False)
    resource_id = Column(String(64), nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="audit_logs")

