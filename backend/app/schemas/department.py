from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class CounterInfo(BaseModel):
    id: str
    number: int
    doctor: str
    status: str = "available"  # available, busy, offline
    current_token: Optional[str] = None


class DepartmentBase(BaseModel):
    name: str
    code: str
    malayalam_name: Optional[str] = None
    location: Optional[str] = "Block A, Ground Floor"
    active_counters: int = Field(default=2, ge=1)
    total_counters: int = Field(default=3, ge=1)
    average_service_duration: float = Field(default=8.0, gt=0)
    color: Optional[str] = "#0d9488"
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    pass


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    active_counters: Optional[int] = None
    total_counters: Optional[int] = None
    average_service_duration: Optional[float] = None
    is_active: Optional[bool] = None


class DepartmentResponse(DepartmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    waiting_count: Optional[int] = 0
    in_service_count: Optional[int] = 0
    counters: Optional[List[CounterInfo]] = []
    created_at: datetime
