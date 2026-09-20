from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.department import Department
from app.models.token import QueueToken
from app.schemas.department import DepartmentResponse, DepartmentUpdate, CounterInfo

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.get("", response_model=List[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    """Retrieve all active hospital outpatient departments with queue counts."""
    depts = db.query(Department).filter(Department.is_active == True).all()
    results = []

    for d in depts:
        waiting_count = db.query(QueueToken).filter(
            QueueToken.department_id == d.id,
            QueueToken.status == "WAITING"
        ).count()

        in_service_count = db.query(QueueToken).filter(
            QueueToken.department_id == d.id,
            QueueToken.status.in_(["CALLED", "IN_SERVICE"])
        ).count()

        # Build dynamic counter info list
        counters = []
        for i in range(1, d.total_counters + 1):
            is_active_counter = i <= d.active_counters
            c_status = "available" if is_active_counter else "offline"
            
            # Check if this counter is currently serving a token
            active_token = db.query(QueueToken).filter(
                QueueToken.department_id == d.id,
                QueueToken.counter_number == i,
                QueueToken.status.in_(["CALLED", "IN_SERVICE"])
            ).first()

            if active_token:
                c_status = "busy"

            counters.append(CounterInfo(
                id=f"{d.code.lower()}-c{i}",
                number=i,
                doctor=f"Counter {i} Medical Staff",
                status=c_status,
                current_token=active_token.token_number if active_token else None
            ))

        results.append(DepartmentResponse(
            id=d.id,
            name=d.name,
            code=d.code,
            malayalam_name=d.malayalam_name,
            location=d.location,
            active_counters=d.active_counters,
            total_counters=d.total_counters,
            average_service_duration=d.average_service_duration,
            color=d.color,
            is_active=d.is_active,
            waiting_count=waiting_count,
            in_service_count=in_service_count,
            counters=counters,
            created_at=d.created_at
        ))

    return results


@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department_by_id(department_id: int, db: Session = Depends(get_db)):
    """Retrieve details for a specific OPD department."""
    d = db.query(Department).filter(Department.id == department_id).first()
    if not d:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found."
        )

    waiting_count = db.query(QueueToken).filter(
        QueueToken.department_id == d.id,
        QueueToken.status == "WAITING"
    ).count()

    in_service_count = db.query(QueueToken).filter(
        QueueToken.department_id == d.id,
        QueueToken.status.in_(["CALLED", "IN_SERVICE"])
    ).count()

    counters = []
    for i in range(1, d.total_counters + 1):
        is_active_counter = i <= d.active_counters
        c_status = "available" if is_active_counter else "offline"
        
        active_token = db.query(QueueToken).filter(
            QueueToken.department_id == d.id,
            QueueToken.counter_number == i,
            QueueToken.status.in_(["CALLED", "IN_SERVICE"])
        ).first()

        if active_token:
            c_status = "busy"

        counters.append(CounterInfo(
            id=f"{d.code.lower()}-c{i}",
            number=i,
            doctor=f"Counter {i} Medical Staff",
            status=c_status,
            current_token=active_token.token_number if active_token else None
        ))

    return DepartmentResponse(
        id=d.id,
        name=d.name,
        code=d.code,
        malayalam_name=d.malayalam_name,
        location=d.location,
        active_counters=d.active_counters,
        total_counters=d.total_counters,
        average_service_duration=d.average_service_duration,
        color=d.color,
        is_active=d.is_active,
        waiting_count=waiting_count,
        in_service_count=in_service_count,
        counters=counters,
        created_at=d.created_at
    )


@router.patch("/{department_id}", response_model=DepartmentResponse)
def update_department_config(
    department_id: int,
    update_data: DepartmentUpdate,
    db: Session = Depends(get_db)
):
    """Update department active counters or service duration configuration."""
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Department with ID {department_id} not found."
        )

    if update_data.name is not None:
        dept.name = update_data.name
    if update_data.active_counters is not None:
        dept.active_counters = max(1, min(update_data.active_counters, dept.total_counters))
    if update_data.total_counters is not None:
        dept.total_counters = max(1, update_data.total_counters)
    if update_data.average_service_duration is not None:
        dept.average_service_duration = max(2.0, update_data.average_service_duration)
    if update_data.is_active is not None:
        dept.is_active = update_data.is_active

    db.commit()
    db.refresh(dept)
    return get_department_by_id(department_id, db)
