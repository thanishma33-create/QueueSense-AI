import pytest


def test_register_patient_walkin(client):
    payload = {
        "department_id": 1,
        "anonymous_reference": "REF-TEST-01",
        "age_group": "Adult (18-59)",
        "visit_type": "Walk-in OPD",
        "accessibility_needs": ["Wheelchair Assistance"],
        "is_priority": False
    }
    response = client.post("/api/patients/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert "GM-" in data["token_number"]
    assert data["status"] == "WAITING"
    assert data["patient_reference"] == "REF-TEST-01"
    assert "Wheelchair Assistance" in data["accessibility_needs"]


def test_register_patient_auto_reference(client):
    payload = {
        "department_id": 1,
        "age_group": "Senior Citizen (60+)",
        "visit_type": "Scheduled Follow-up",
        "is_priority": True,
        "priority_reason": "Senior Citizen Assistance",
        "priority_staff_note": "Verified by Nurse"
    }
    response = client.post("/api/patients/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["patient_reference"].startswith("REF-")
    assert data["is_priority"] is True
    assert data["priority_reason"] == "Senior Citizen Assistance"


def test_register_patient_invalid_department(client):
    payload = {
        "department_id": 999,
        "age_group": "Adult (18-59)"
    }
    response = client.post("/api/patients/register", json=payload)
    assert response.status_code == 400
    assert "does not exist" in response.json()["error"]["message"]


def test_get_patient_by_id(client):
    # Register first
    res = client.post(
        "/api/patients/register",
        json={"department_id": 1, "anonymous_reference": "REF-GET-1", "age_group": "Adult (18-59)"}
    )
    patient_id = res.json()["patient_id"]

    # Get patient
    get_res = client.get(f"/api/patients/{patient_id}")
    assert get_res.status_code == 200
    p_data = get_res.json()
    assert p_data["id"] == patient_id
    assert p_data["anonymous_reference"] == "REF-GET-1"
