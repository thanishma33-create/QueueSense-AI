import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.priority_flag import PriorityFlag
from app.models.token import QueueToken
from app.models.queue_event import QueueEvent
from app.schemas.priority import PriorityFlagUpdate


def get_all_priority_flags(
    db: Session,
    status_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieve priority flags with parsed audit histories."""
    query = db.query(PriorityFlag).join(QueueToken)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(PriorityFlag.status == status_filter.upper())
    
    flags = query.order_by(PriorityFlag.created_at.desc()).all()
    results = []

    for f in flags:
        audit_entries = []
        if f.audit_history:
            try:
                audit_entries = json.loads(f.audit_history)
            except Exception:
                audit_entries = []

        patient_ref = f.patient.anonymous_reference if f.patient else "Patient"
        age_group = f.patient.age_group if f.patient else "Adult"
        dept_name = f.token.department.name if (f.token and f.token.department) else "General"
        dept_id = f.token.department_id if f.token else 1

        results.append({
            "id": f.id,
            "token_id": f.token_id,
            "token_number": f.token.token_number if f.token else f"TOK-{f.token_id}",
            "patient_id": f.patient_id,
            "patient_ref": patient_ref,
            "age_group": age_group,
            "department_id": dept_id,
            "department_name": dept_name,
            "reason": f.reason_category,
            "confidence": f.confidence,
            "status": f.status,
            "created_by": f.created_by,
            "reviewer": f.reviewed_by,
            "staff_note": f.review_notes,
            "timestamp": f.created_at.strftime("%I:%M %p") if f.created_at else "",
            "reviewed_at": f.reviewed_at.strftime("%I:%M %p") if f.reviewed_at else None,
            "audit_log": audit_entries,
        })

    return results


def review_priority_flag(
    db: Session,
    flag_id: int,
    update_data: PriorityFlagUpdate,
    reviewer_name: str = "Authorized Medical Officer"
) -> Dict[str, Any]:
    """
    Update clinical priority flag status with required staff audit logging.
    Clinical Governance: Status change requires human healthcare staff validation.
    """
    flag = db.query(PriorityFlag).filter(PriorityFlag.id == flag_id).first()
    if not flag:
        raise ValueError(f"Priority flag ID {flag_id} not found.")

    valid_statuses = ["PENDING", "REVIEWED", "ACCEPTED", "REJECTED"]
    new_status = update_data.status.upper()
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid status '{new_status}'. Allowed: {', '.join(valid_statuses)}")

    now_utc = datetime.now(timezone.utc)
    reviewer = update_data.reviewer_name or reviewer_name
    flag.status = new_status
    flag.reviewed_by = reviewer
    flag.reviewed_at = now_utc
    if update_data.review_notes:
        flag.review_notes = update_data.review_notes

    # Append new entry to audit log
    existing_audit = []
    if flag.audit_history:
        try:
            existing_audit = json.loads(flag.audit_history)
        except Exception:
            existing_audit = []

    new_entry = {
        "action": update_data.action or f"Status changed to {new_status}",
        "user": reviewer,
        "time": datetime.now().strftime("%I:%M %p"),
        "note": update_data.review_notes or f"Clinical review status marked as {new_status}."
    }
    existing_audit.insert(0, new_entry)
    flag.audit_history = json.dumps(existing_audit)

    # Also record in QueueEvent
    event = QueueEvent(
        token_id=flag.token_id,
        event_type="PRIORITY_REVIEWED",
        performed_by=reviewer,
        timestamp=now_utc,
        metadata_json=json.dumps({
            "flag_id": flag.id,
            "status": new_status,
            "notes": update_data.review_notes
        })
    )
    db.add(event)

    db.commit()
    db.refresh(flag)

    return {
        "id": flag.id,
        "token_id": flag.token_id,
        "token_number": flag.token.token_number if flag.token else f"TOK-{flag.token_id}",
        "patient_id": flag.patient_id,
        "patient_ref": flag.patient.anonymous_reference if flag.patient else "Patient",
        "age_group": flag.patient.age_group if flag.patient else "Adult",
        "department_id": flag.token.department_id if flag.token else 1,
        "department_name": flag.token.department.name if (flag.token and flag.token.department) else "General",
        "reason": flag.reason_category,
        "confidence": flag.confidence,
        "status": flag.status,
        "created_by": flag.created_by,
        "reviewer": flag.reviewed_by,
        "staff_note": flag.review_notes,
        "timestamp": flag.created_at.strftime("%I:%M %p") if flag.created_at else "",
        "reviewed_at": flag.reviewed_at.strftime("%I:%M %p") if flag.reviewed_at else None,
        "audit_log": existing_audit,
    }
