from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.priority_flag import PriorityFlag
from app.schemas.priority import PriorityFlagResponse, PriorityFlagUpdate
from app.services.priority_service import (
    get_all_priority_flags,
    review_priority_flag
)

router = APIRouter(prefix="/priority", tags=["Clinical Priority Review"])


@router.get("/flags", response_model=List[PriorityFlagResponse])
def get_priority_flags(
    status: Optional[str] = Query("all", description="Filter by status (PENDING, ACCEPTED, REJECTED, etc.)"),
    db: Session = Depends(get_db)
):
    """
    Retrieve clinical priority review cases with staff audit trails.
    Clinical Guardrail: Priority flags require medical review before workflow modification.
    """
    return get_all_priority_flags(db, status_filter=status)


@router.get("/flags/{flag_id}", response_model=PriorityFlagResponse)
def get_priority_flag_by_id(
    flag_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve details and audit history for a single priority case."""
    flags = get_all_priority_flags(db, status_filter=None)
    match = next((f for f in flags if f["id"] == flag_id), None)
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Priority flag with ID {flag_id} not found."
        )
    return match


@router.patch("/flags/{flag_id}", response_model=PriorityFlagResponse)
def update_priority_flag_status(
    flag_id: int,
    update_data: PriorityFlagUpdate,
    db: Session = Depends(get_db)
):
    """
    Review and update priority flag status (PENDING, REVIEWED, ACCEPTED, REJECTED).
    Appends review notes and reviewer metadata to the permanent audit ledger.
    """
    try:
        updated = review_priority_flag(
            db=db,
            flag_id=flag_id,
            update_data=update_data,
            reviewer_name=update_data.reviewer_name or "Authorized Medical Officer"
        )
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
