from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class CallNextRequest(BaseModel):
    department_id: Optional[int] = None
    counter_number: int = Field(default=1, ge=1)
    staff_name: Optional[str] = "Doctor / Counter Staff"


class TokenStatusUpdate(BaseModel):
    status: str = Field(..., description="WAITING, CALLED, IN_SERVICE, COMPLETED, CANCELLED, NO_SHOW")
    counter_number: Optional[int] = None
    counter_served: Optional[str] = None
    service_duration_minutes: Optional[float] = None
    note: Optional[str] = None


class TokenResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    token_number: str
    patient_id: int
    department_id: int
    department_name: Optional[str] = None
    department_code: Optional[str] = None
    status: str
    counter_number: Optional[int] = None
    counter_served: Optional[str] = None
    is_priority: bool = False
    priority_reason: Optional[str] = None
    patient_ref: Optional[str] = None
    anonymized_name: Optional[str] = None
    age_group: Optional[str] = None
    visit_type: Optional[str] = None
    accessibility_needs: Optional[List[str]] = []
    registration_time: str
    called_time: Optional[str] = None
    service_start_time: Optional[str] = None
    completion_time: Optional[str] = None
    service_duration_minutes: Optional[float] = None
    estimated_wait_minutes: int


class PublicTokenDisplay(BaseModel):
    token_number: str
    department_code: str
    department_name: str
    status: str
    counter_number: Optional[int] = None
    is_priority: bool = False
    estimated_wait_minutes: int
