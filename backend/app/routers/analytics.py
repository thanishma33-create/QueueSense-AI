from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    CongestionResponse,
    DepartmentAnalyticsItem,
    HourlyTrendItem
)
from app.services.analytics_service import (
    get_analytics_overview,
    get_congestion_metrics
)

router = APIRouter(prefix="/analytics", tags=["Hospital Analytics & Flow"])


@router.get("/overview", response_model=AnalyticsOverviewResponse)
def get_hospital_analytics_overview(
    range: Optional[str] = Query("today", description="Time range (today, week, month)"),
    db: Session = Depends(get_db)
):
    """Retrieve comprehensive hospital OPD performance metrics and hourly rush trends."""
    return get_analytics_overview(db, date_filter=range)


@router.get("/departments", response_model=List[DepartmentAnalyticsItem])
def get_department_analytics(
    range: Optional[str] = Query("today"),
    db: Session = Depends(get_db)
):
    """Retrieve department-level capacity and throughput comparisons without ranking staff."""
    overview = get_analytics_overview(db, date_filter=range)
    return overview["department_breakdown"]


@router.get("/waiting-time", response_model=List[HourlyTrendItem])
def get_hourly_waiting_time_trends(
    range: Optional[str] = Query("today"),
    db: Session = Depends(get_db)
):
    """Retrieve hourly average waiting-time trend curve and rush hour distribution."""
    overview = get_analytics_overview(db, date_filter=range)
    return overview["hourly_trend"]


@router.get("/congestion", response_model=CongestionResponse)
def get_hospital_congestion(db: Session = Depends(get_db)):
    """Retrieve real-time hospital OPD congestion ratio and actionable staffing recommendations."""
    return get_congestion_metrics(db)
