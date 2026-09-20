from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.analytics import WaitingTimePredictionResponse
from app.services.waiting_time_service import (
    calculate_department_wait_time,
    calculate_token_wait_time
)

router = APIRouter(prefix="/waiting-time", tags=["Waiting Time Estimation AI"])


@router.get("/{department_id}", response_model=WaitingTimePredictionResponse)
def get_department_waiting_time(
    department_id: int,
    db: Session = Depends(get_db)
):
    """
    Compute explainable waiting-time estimation for a hospital department.
    Returns mathematical factors, confidence interval, uncertainty level, and operational advice.
    """
    result = calculate_department_wait_time(db, department_id)
    if result.get("department_name") == "Unknown":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department ID {department_id} not found."
        )
    return result


@router.get("/token/{token_id}")
def get_individual_token_waiting_time(
    token_id: int,
    db: Session = Depends(get_db)
):
    """Compute customized waiting-time estimate for a specific patient token."""
    result = calculate_token_wait_time(db, token_id)
    if result.get("status") == "NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token ID {token_id} not found."
        )
    return result
