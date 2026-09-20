from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class WaitRange(BaseModel):
    minimum: int
    maximum: int


class WaitingTimePredictionResponse(BaseModel):
    department_id: int
    department_name: str
    department_code: str
    active_counters: int
    waiting_count: int
    estimated_wait_minutes: int
    range: WaitRange
    uncertainty: str = "LOW"  # LOW, MEDIUM, HIGH
    factors: List[str]
    method: str = "Transparent baseline heuristic flow model"
    confidence_score: int = 90
    congestion_level: str = "Low"
    congestion_badge: str = "Smooth Flow"
    operational_advice: str
    timestamp: str


class HourlyTrendItem(BaseModel):
    hour: str
    patients_arrived: int
    patients_served: int
    avg_wait_minutes: float
    skipped_tokens: int
    congestion_index: int


class DepartmentAnalyticsItem(BaseModel):
    department: str
    code: str
    active_counters: int
    total_tokens: int
    waiting_count: int
    completed_today: int
    avg_wait_minutes: float
    congestion: str


class AnalyticsSummary(BaseModel):
    total_registered: int
    waiting_count: int
    in_service_count: int
    completed_today: int
    avg_wait_overall_minutes: float
    avg_service_duration_minutes: float
    peak_congestion_hour: str
    retention_rate: str


class AnalyticsOverviewResponse(BaseModel):
    summary: AnalyticsSummary
    hourly_trend: List[HourlyTrendItem]
    department_breakdown: List[DepartmentAnalyticsItem]
    timestamp: str


class CongestionResponse(BaseModel):
    overall_congestion_level: str  # Low, Moderate, High, Severe
    waiting_total: int
    active_counters_total: int
    peak_department: str
    operational_recommendation: str
    timestamp: str
