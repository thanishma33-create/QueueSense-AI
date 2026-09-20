from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.token import QueueToken
from app.models.department import Department
from app.schemas.token import (
    TokenResponse,
    TokenStatusUpdate,
    CallNextRequest,
    PublicTokenDisplay
)
from app.services.queue_service import (
    call_next_token,
    update_token_status,
    format_token_response
)
from app.routers.websocket import manager

router = APIRouter(prefix="/queue", tags=["Queue Management"])


@router.get("", response_model=List[TokenResponse])
def get_all_tokens(
    department_id: Optional[str] = Query("all", description="Department ID or 'all'"),
    status: Optional[str] = Query(None, description="Filter by status (WAITING, CALLED, etc.)"),
    db: Session = Depends(get_db)
):
    """Retrieve queue tokens with department and patient details."""
    query = db.query(QueueToken).join(QueueToken.department).join(QueueToken.patient)

    if department_id and department_id.lower() != "all":
        try:
            dept_int = int(department_id)
            query = query.filter(QueueToken.department_id == dept_int)
        except ValueError:
            pass

    if status and status.lower() != "all":
        query = query.filter(QueueToken.status == status.upper())

    tokens = query.order_by(QueueToken.registration_time.desc()).all()
    return [format_token_response(t) for t in tokens]


@router.get("/{department_id}", response_model=List[TokenResponse])
def get_department_queue(
    department_id: int,
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieve queue tokens for a specific department."""
    return get_all_tokens(department_id=str(department_id), status=status, db=db)


@router.get("/{department_id}/current", response_model=Optional[TokenResponse])
def get_current_serving_token(
    department_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve currently called or in-service token for a department."""
    token = db.query(QueueToken).filter(
        QueueToken.department_id == department_id,
        QueueToken.status.in_(["CALLED", "IN_SERVICE"])
    ).order_by(QueueToken.called_time.desc()).first()

    if not token:
        return None
    return format_token_response(token)


@router.post("/{department_id}/call-next", response_model=TokenResponse)
async def call_next_patient(
    department_id: int,
    body: Optional[CallNextRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Call the next eligible waiting token to the specified consultation counter.
    Automatically prioritizes staff-verified clinical priority tokens before standard sequential queue.
    """
    counter_num = body.counter_number if body else 1
    staff_name = body.staff_name if body else "Doctor / Counter Staff"

    try:
        called_token = call_next_token(
            db=db,
            department_id=department_id,
            counter_number=counter_num,
            staff_name=staff_name
        )

        if not called_token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No waiting patients currently available in this department queue."
            )

        # Broadcast real-time call event via WebSockets
        await manager.broadcast_to_department(
            department_id=str(department_id),
            message={
                "event": "TOKEN_CALLED",
                "department_id": department_id,
                "data": {
                    "token_number": called_token.token_number,
                    "counter_number": called_token.counter_number,
                    "is_priority": called_token.is_priority,
                    "called_time": called_token.called_time.strftime("%I:%M %p") if called_token.called_time else ""
                }
            }
        )

        return format_token_response(called_token)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.patch("/tokens/{token_id}/status", response_model=TokenResponse)
async def update_status(
    token_id: int,
    update_data: TokenStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update token lifecycle status (WAITING, CALLED, IN_SERVICE, COMPLETED, CANCELLED, NO_SHOW).
    """
    try:
        updated_token = update_token_status(
            db=db,
            token_id=token_id,
            update_data=update_data,
            performed_by="Medical Staff"
        )

        # Broadcast status update event
        await manager.broadcast_to_department(
            department_id=str(updated_token.department_id),
            message={
                "event": "TOKEN_STATUS_UPDATED",
                "department_id": updated_token.department_id,
                "data": {
                    "token_number": updated_token.token_number,
                    "status": updated_token.status,
                    "counter_number": updated_token.counter_number
                }
            }
        )

        return format_token_response(updated_token)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/tokens/{token_id}", response_model=TokenResponse)
def get_token_by_id(token_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a single queue token."""
    token = db.query(QueueToken).filter(QueueToken.id == token_id).first()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token with ID {token_id} not found."
        )
    return format_token_response(token)
