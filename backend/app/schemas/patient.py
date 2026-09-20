from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class PatientRegisterRequest(BaseModel):
    department_id: int
    anonymous_reference: Optional[str] = None  # Auto-generated if omitted
    anonymized_name: Optional[str] = None
    age_group: str = "Adult (18-59)"
    visit_type: str = "Walk-in OPD"
    accessibility_needs: Optional[List[str]] = []
    
    # Staff-verified priority flag (optional)
    is_priority: bool = False
    priority_reason: Optional[str] = None
    priority_staff_note: Optional[str] = None
    priority_verified_by: Optional[str] = None


class PatientRegistrationResponse(BaseModel):
    success: bool = True
    token_number: str
    token_id: int
    patient_id: int
    department_id: int
    department_name: str
    department_code: str
    status: str
    estimated_wait_minutes: int
    patient_reference: str
    registration_time: str
    is_priority: bool = False
    priority_reason: Optional[str] = None
    accessibility_needs: List[str] = []


class PatientResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    anonymous_reference: str
    anonymized_name: str
    age_group: str
    department_id: int
    visit_type: str
    accessibility_needs: List[str] = []
    registration_time: datetime
    created_at: datetime
