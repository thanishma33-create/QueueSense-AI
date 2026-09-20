from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class AuditLogEntry(BaseModel):
    action: str
    user: str
    time: str
    note: Optional[str] = None


class PriorityFlagCreate(BaseModel):
    token_id: int
    patient_id: int
    reason_category: str
    confidence: float = Field(default=0.90, ge=0.0, le=1.0)
    staff_note: Optional[str] = None
    created_by: Optional[str] = "Staff Nurse"


class PriorityFlagUpdate(BaseModel):
    status: str = Field(..., description="PENDING, REVIEWED, ACCEPTED, REJECTED")
    action: Optional[str] = "Status Updated"
    review_notes: Optional[str] = None
    reviewer_name: Optional[str] = None


class PriorityFlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    token_id: int
    token_number: str
    patient_id: int
    patient_ref: str
    age_group: str
    department_id: int
    department_name: str
    reason: str
    confidence: float
    status: str
    created_by: str
    reviewer: Optional[str] = None
    staff_note: Optional[str] = None
    timestamp: str
    reviewed_at: Optional[str] = None
    audit_log: List[AuditLogEntry] = []
