import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.patient import Patient
from app.schemas.patient import (
    PatientRegisterRequest,
    PatientRegistrationResponse,
    PatientResponse
)
from app.services.queue_service import register_patient_and_token
from app.routers.websocket import manager

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/register", response_model=PatientRegistrationResponse, status_code=status.HTTP_201_CREATED)
async def register_patient(
    request: PatientRegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a patient, generate sequential department token, and issue queue slip details.
    Uses anonymous references to safeguard patient confidentiality on public monitors.
    """
    try:
        token, patient = register_patient_and_token(
            db=db,
            request=request,
            performed_by=request.priority_verified_by or "Reception Desk"
        )

        acc_needs = []
        if patient.accessibility_needs:
            try:
                acc_needs = json.loads(patient.accessibility_needs)
            except Exception:
                acc_needs = [patient.accessibility_needs]

        # Broadcast live queue update via WebSockets
        await manager.broadcast_to_department(
            department_id=str(token.department_id),
            message={
                "event": "PATIENT_REGISTERED",
                "department_id": token.department_id,
                "data": {
                    "token_number": token.token_number,
                    "patient_ref": patient.anonymous_reference,
                    "is_priority": token.is_priority,
                    "estimated_wait_minutes": token.estimated_wait_minutes
                }
            }
        )

        return PatientRegistrationResponse(
            success=True,
            token_number=token.token_number,
            token_id=token.id,
            patient_id=patient.id,
            department_id=token.department_id,
            department_name=token.department.name if token.department else "General Medicine",
            department_code=token.department.code if token.department else "GM",
            status=token.status,
            estimated_wait_minutes=token.estimated_wait_minutes,
            patient_reference=patient.anonymous_reference,
            registration_time=token.registration_time.strftime("%I:%M %p"),
            is_priority=token.is_priority,
            priority_reason=token.priority_reason,
            accessibility_needs=acc_needs
        )

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_by_id(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve sanitized patient profile by ID."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    acc_needs = []
    if patient.accessibility_needs:
        try:
            acc_needs = json.loads(patient.accessibility_needs)
        except Exception:
            acc_needs = [patient.accessibility_needs]

    return PatientResponse(
        id=patient.id,
        anonymous_reference=patient.anonymous_reference,
        anonymized_name=patient.anonymized_name,
        age_group=patient.age_group,
        department_id=patient.department_id,
        visit_type=patient.visit_type,
        accessibility_needs=acc_needs,
        registration_time=patient.registration_time,
        created_at=patient.created_at
    )
