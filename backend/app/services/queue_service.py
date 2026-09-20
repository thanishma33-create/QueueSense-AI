import json
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, select

from app.models.department import Department
from app.models.patient import Patient
from app.models.token import QueueToken
from app.models.priority_flag import PriorityFlag
from app.models.queue_event import QueueEvent
from app.schemas.patient import PatientRegisterRequest
from app.schemas.token import TokenStatusUpdate
from app.services.waiting_time_service import calculate_department_wait_time
from app.utils.logging_config import logger


def register_patient_and_token(
    db: Session,
    request: PatientRegisterRequest,
    performed_by: str = "Reception Staff"
) -> Tuple[QueueToken, Patient]:
    """
    Transaction-safe patient registration and sequential token generation.
    """
    dept = db.query(Department).filter(Department.id == request.department_id).first()
    if not dept:
        raise ValueError(f"Department ID {request.department_id} does not exist.")

    # Generate sequential token number for this department today
    today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    count_today = db.query(QueueToken).filter(
        QueueToken.department_id == dept.id,
        QueueToken.registration_time >= today_start
    ).count()

    token_number = f"{dept.code}-{count_today + 101:03d}"

    # Generate anonymous patient reference if not provided
    anonymous_ref = request.anonymous_reference
    if not anonymous_ref or anonymous_ref.strip() == "":
        random_suffix = f"{count_today + 8200}"
        anonymous_ref = f"REF-{random_suffix} ({request.age_group.split(' ')[0]})"

    anonymized_name = request.anonymized_name or f"Patient #{count_today + 101}"

    # Calculate initial wait time estimate
    wait_info = calculate_department_wait_time(db, dept.id)
    estimated_wait_minutes = wait_info.get("estimated_wait_minutes", 15)

    # 1. Create Patient Record
    patient = Patient(
        anonymous_reference=anonymous_ref,
        anonymized_name=anonymized_name,
        age_group=request.age_group,
        department_id=dept.id,
        visit_type=request.visit_type,
        accessibility_needs=json.dumps(request.accessibility_needs or []),
        registration_time=datetime.now(timezone.utc)
    )
    db.add(patient)
    db.flush()  # to obtain patient.id

    # 2. Create Queue Token
    token = QueueToken(
        token_number=token_number,
        patient_id=patient.id,
        department_id=dept.id,
        status="WAITING",
        is_priority=request.is_priority,
        priority_reason=request.priority_reason if request.is_priority else None,
        estimated_wait_minutes=estimated_wait_minutes,
        registration_time=datetime.now(timezone.utc)
    )
    db.add(token)
    db.flush()  # to obtain token.id

    # 3. If staff-verified priority is flagged, create PriorityFlag entry with audit history
    if request.is_priority:
        audit_entry = {
            "action": "Priority Flag Created",
            "user": request.priority_verified_by or performed_by,
            "time": datetime.now().strftime("%I:%M %p"),
            "note": request.priority_staff_note or "Marked as priority during registration desk intake."
        }
        flag = PriorityFlag(
            token_id=token.id,
            patient_id=patient.id,
            reason_category=request.priority_reason or "Staff Verified Assistance",
            confidence=0.95,
            status="PENDING",
            created_by=request.priority_verified_by or performed_by,
            review_notes=request.priority_staff_note or "Registration desk triage verification.",
            audit_history=json.dumps([audit_entry]),
            created_at=datetime.now(timezone.utc)
        )
        db.add(flag)

    # 4. Record Queue Event Log
    event = QueueEvent(
        token_id=token.id,
        event_type="REGISTERED",
        performed_by=performed_by,
        timestamp=datetime.now(timezone.utc),
        metadata_json=json.dumps({
            "token_number": token_number,
            "department": dept.name,
            "is_priority": request.is_priority
        })
    )
    db.add(event)

    db.commit()
    db.refresh(token)
    db.refresh(patient)

    logger.info(f"Registered patient token {token_number} for {dept.name} (Priority: {request.is_priority})")
    return token, patient


def call_next_token(
    db: Session,
    department_id: int,
    counter_number: int = 1,
    staff_name: str = "Doctor / Counter Staff"
) -> Optional[QueueToken]:
    """
    Transaction-safe call-next token assignment.
    Prioritizes verified priority WAITING tokens first, then oldest standard WAITING tokens.
    """
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise ValueError(f"Department ID {department_id} not found.")

    # 1. Look for waiting priority token first
    token = db.query(QueueToken).filter(
        QueueToken.department_id == department_id,
        QueueToken.status == "WAITING",
        QueueToken.is_priority == True
    ).order_by(QueueToken.registration_time.asc()).with_for_update(nowait=False).first()

    # 2. If no priority waiting tokens, look for earliest standard waiting token
    if not token:
        token = db.query(QueueToken).filter(
            QueueToken.department_id == department_id,
            QueueToken.status == "WAITING"
        ).order_by(QueueToken.registration_time.asc()).with_for_update(nowait=False).first()

    if not token:
        return None

    # Transition to CALLED
    now_utc = datetime.now(timezone.utc)
    token.status = "CALLED"
    token.counter_number = counter_number
    token.counter_served = f"Counter {counter_number} ({staff_name})"
    token.called_time = now_utc

    # Record event
    event = QueueEvent(
        token_id=token.id,
        event_type="CALLED",
        performed_by=staff_name,
        timestamp=now_utc,
        metadata_json=json.dumps({
            "counter_number": counter_number,
            "staff_name": staff_name
        })
    )
    db.add(event)

    db.commit()
    db.refresh(token)
    logger.info(f"Called token {token.token_number} to Counter {counter_number} in {dept.name}")
    return token


def update_token_status(
    db: Session,
    token_id: int,
    update_data: TokenStatusUpdate,
    performed_by: str = "Medical Staff"
) -> QueueToken:
    """
    Update token status with lifecycle validation and event audit tracking.
    """
    token = db.query(QueueToken).filter(QueueToken.id == token_id).first()
    if not token:
        raise ValueError(f"Token ID {token_id} not found.")

    valid_statuses = ["WAITING", "CALLED", "IN_SERVICE", "COMPLETED", "CANCELLED", "NO_SHOW"]
    new_status = update_data.status.upper()
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status '{new_status}'. Allowed statuses: {', '.join(valid_statuses)}")

    now_utc = datetime.now(timezone.utc)
    old_status = token.status
    token.status = new_status

    if update_data.counter_number is not None:
        token.counter_number = update_data.counter_number
    if update_data.counter_served:
        token.counter_served = update_data.counter_served

    if new_status == "IN_SERVICE":
        token.service_start_time = now_utc
    elif new_status == "COMPLETED":
        token.completion_time = now_utc
        # Calculate duration
        start = token.service_start_time or token.called_time or token.registration_time
        if start:
            if start.tzinfo is None and now_utc.tzinfo is not None:
                start = start.replace(tzinfo=timezone.utc)
            duration = (now_utc - start).total_seconds() / 60.0
            token.service_duration_minutes = update_data.service_duration_minutes or round(max(2.0, duration), 1)
        else:
            token.service_duration_minutes = update_data.service_duration_minutes or 8.0


    # Record audit event
    event = QueueEvent(
        token_id=token.id,
        event_type=new_status,
        performed_by=performed_by,
        timestamp=now_utc,
        metadata_json=json.dumps({
            "previous_status": old_status,
            "new_status": new_status,
            "note": update_data.note
        })
    )
    db.add(event)

    db.commit()
    db.refresh(token)
    logger.info(f"Updated token {token.token_number} status from {old_status} to {new_status}")
    return token


def format_token_response(token: QueueToken) -> Dict[str, Any]:
    """Helper to format a QueueToken model instance into a clean response dictionary."""
    acc_needs = []
    if token.patient and token.patient.accessibility_needs:
        try:
            acc_needs = json.loads(token.patient.accessibility_needs)
        except Exception:
            acc_needs = [token.patient.accessibility_needs]

    return {
        "id": token.id,
        "token_number": token.token_number,
        "patient_id": token.patient_id,
        "department_id": token.department_id,
        "department_name": token.department.name if token.department else "General",
        "department_code": token.department.code if token.department else "OPD",
        "status": token.status,
        "counter_number": token.counter_number,
        "counter_served": token.counter_served,
        "is_priority": token.is_priority,
        "priority_reason": token.priority_reason,
        "patient_ref": token.patient.anonymous_reference if token.patient else None,
        "anonymized_name": token.patient.anonymized_name if token.patient else None,
        "age_group": token.patient.age_group if token.patient else None,
        "visit_type": token.patient.visit_type if token.patient else None,
        "accessibility_needs": acc_needs,
        "registration_time": token.registration_time.strftime("%I:%M %p") if token.registration_time else "",
        "called_time": token.called_time.strftime("%I:%M %p") if token.called_time else None,
        "service_start_time": token.service_start_time.strftime("%I:%M %p") if token.service_start_time else None,
        "completion_time": token.completion_time.strftime("%I:%M %p") if token.completion_time else None,
        "service_duration_minutes": token.service_duration_minutes,
        "estimated_wait_minutes": token.estimated_wait_minutes,
    }
