from datetime import datetime, timezone
import math
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.department import Department
from app.models.token import QueueToken


def calculate_department_wait_time(
    db: Session,
    department_id: int
) -> Dict[str, Any]:
    """
    Transparent baseline waiting-time estimation algorithm for hospital OPDs.
    
    Clinical Governance & Safety Note:
    This model provides mathematical approximations of queue flow duration for
    operational staffing and patient communication. It does NOT make clinical
    triage decisions or guarantee exact consult times.
    """
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        return {
            "department_id": department_id,
            "department_name": "Unknown",
            "department_code": "UNK",
            "active_counters": 1,
            "waiting_count": 0,
            "estimated_wait_minutes": 0,
            "range": {"minimum": 0, "maximum": 0},
            "uncertainty": "HIGH",
            "factors": ["Department not found"],
            "method": "Transparent baseline estimation",
            "confidence_score": 50,
            "congestion_level": "Clear",
            "congestion_badge": "No Queue",
            "operational_advice": "No active department records found.",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # Count waiting tokens
    waiting_tokens = db.query(QueueToken).filter(
        QueueToken.department_id == department_id,
        QueueToken.status == "WAITING"
    ).all()
    waiting_count = len(waiting_tokens)

    # Priority tokens in queue
    priority_count = sum(1 for t in waiting_tokens if t.is_priority)

    # In service tokens
    in_service_count = db.query(QueueToken).filter(
        QueueToken.department_id == department_id,
        QueueToken.status.in_(["CALLED", "IN_SERVICE"])
    ).count()

    active_counters = max(1, dept.active_counters)
    avg_service_time = max(3.0, dept.average_service_duration)

    # Peak-hour surge coefficient based on typical OPD rush (9 AM - 12 PM)
    current_hour = datetime.now().hour
    surge_multiplier = 1.0
    surge_label = "Normal Inflow"
    if 9 <= current_hour <= 11:
        surge_multiplier = 1.25
        surge_label = "Morning Peak Rush (+25%)"
    elif current_hour == 12:
        surge_multiplier = 1.15
        surge_label = "Midday Surge (+15%)"
    elif current_hour < 9:
        surge_multiplier = 0.95
        surge_label = "Early Morning Startup"

    # Specialty complexity factor
    specialty_factors = {
        "GM": (1.0, "Standard General Medical Consult"),
        "PED": (1.15, "Pediatric Examination & Calming Buffer"),
        "ORTHO": (1.30, "Orthopedic Dressing/X-ray Review Buffer"),
        "ENT": (0.95, "Focused ENT Endoscopy & Exam"),
    }
    specialty_factor, specialty_label = specialty_factors.get(
        dept.code.upper(), (1.0, "Standard Outpatient Protocol")
    )

    # Weighted queue count: priority tokens slightly weight duration
    weighted_queue = waiting_count + (priority_count * 0.4)

    # Baseline mathematical formula:
    # (Waiting patients * Avg Service Duration / Active Counters) * Surge * Specialty
    raw_estimate = (weighted_queue * avg_service_time / active_counters) * surge_multiplier * specialty_factor
    estimated_wait_minutes = max(2, int(round(raw_estimate))) if waiting_count > 0 else 0

    # Variance margin (±22% or min 3 minutes)
    margin = max(3, int(round(estimated_wait_minutes * 0.22)))
    min_wait = max(1, estimated_wait_minutes - margin) if waiting_count > 0 else 0
    max_wait = estimated_wait_minutes + margin if waiting_count > 0 else 0

    # Uncertainty classification
    if waiting_count > 15 or active_counters == 1:
        uncertainty = "HIGH"
        confidence_score = 80
    elif waiting_count > 6:
        uncertainty = "MEDIUM"
        confidence_score = 88
    else:
        uncertainty = "LOW"
        confidence_score = 94

    # Congestion Level
    if waiting_count == 0:
        congestion_level = "Clear"
        congestion_badge = "No Waiting Queue"
        operational_advice = "No patients currently waiting in this department."
    elif estimated_wait_minutes > 40 or waiting_count > 14:
        congestion_level = "High"
        congestion_badge = "Elevated Wait Time"
        operational_advice = "Queue congestion is elevated. Consider activating auxiliary counter capacity."
    elif estimated_wait_minutes > 20 or waiting_count > 6:
        congestion_level = "Moderate"
        congestion_badge = "Moderate Load"
        operational_advice = "Patient flow is steady and within standard outpatient clearance schedules."
    else:
        congestion_level = "Low"
        congestion_badge = "Smooth Flow"
        operational_advice = "Department flow is optimal. Current counter capacity matches patient arrivals."

    factors = [
        f"Waiting patients ahead: {waiting_count} tokens",
        f"Active service counters: {active_counters} online",
        f"Average consult duration: {avg_service_time} mins/patient",
        f"Time-of-day surge: {surge_label}",
        f"Specialty factor: {specialty_label} ({specialty_factor}x)",
    ]

    return {
        "department_id": dept.id,
        "department_name": dept.name,
        "department_code": dept.code,
        "active_counters": active_counters,
        "waiting_count": waiting_count,
        "estimated_wait_minutes": estimated_wait_minutes,
        "range": {"minimum": min_wait, "maximum": max_wait},
        "uncertainty": uncertainty,
        "factors": factors,
        "method": "Transparent baseline heuristic flow model",
        "confidence_score": confidence_score,
        "congestion_level": congestion_level,
        "congestion_badge": congestion_badge,
        "operational_advice": operational_advice,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def calculate_token_wait_time(
    db: Session,
    token_id: int
) -> Dict[str, Any]:
    """Calculate personalized wait time for a specific waiting token."""
    token = db.query(QueueToken).filter(QueueToken.id == token_id).first()
    if not token:
        return {
            "token_id": token_id,
            "status": "NOT_FOUND",
            "estimated_wait_minutes": 0,
            "patients_ahead": 0
        }

    if token.status != "WAITING":
        return {
            "token_id": token.id,
            "token_number": token.token_number,
            "status": token.status,
            "estimated_wait_minutes": 0,
            "patients_ahead": 0,
            "message": f"Token is currently {token.status}."
        }

    # Count patients ahead with earlier registration time in the same department
    patients_ahead = db.query(QueueToken).filter(
        QueueToken.department_id == token.department_id,
        QueueToken.status == "WAITING",
        QueueToken.registration_time <= token.registration_time,
        QueueToken.id != token.id
    ).count()

    dept = db.query(Department).filter(Department.id == token.department_id).first()
    active_counters = max(1, dept.active_counters if dept else 1)
    avg_service = dept.average_service_duration if dept else 8.0

    raw_wait = (patients_ahead * avg_service) / active_counters
    estimated_mins = max(2, int(round(raw_wait)))

    return {
        "token_id": token.id,
        "token_number": token.token_number,
        "department_id": token.department_id,
        "status": token.status,
        "patients_ahead": patients_ahead,
        "estimated_wait_minutes": estimated_mins,
        "range": {
            "minimum": max(1, estimated_mins - 3),
            "maximum": estimated_mins + 4
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
