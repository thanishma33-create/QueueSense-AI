import pytest


def test_priority_flag_flow_and_review(client):
    # Register priority patient
    reg = client.post(
        "/api/patients/register",
        json={
            "department_id": 1,
            "anonymous_reference": "PRI-REV-1",
            "is_priority": True,
            "priority_reason": "Senior Citizen Immobility",
            "priority_staff_note": "Triage verified wheelchair requirement",
            "priority_verified_by": "Sister Bindu"
        }
    )
    assert reg.status_code == 201

    # Get flags list
    flags_res = client.get("/api/priority/flags")
    assert flags_res.status_code == 200
    flags = flags_res.json()
    assert len(flags) >= 1
    flag = flags[0]
    assert flag["reason"] == "Senior Citizen Immobility"
    assert flag["status"] == "PENDING"
    assert len(flag["audit_log"]) >= 1

    # Review / Accept priority flag
    patch_res = client.patch(
        f"/api/priority/flags/{flag['id']}",
        json={
            "status": "ACCEPTED",
            "action": "Priority Confirmed by Medical Officer",
            "review_notes": "Clinical justification accepted for immediate counter consult.",
            "reviewer_name": "Dr. Radhakrishnan K."
        }
    )
    assert patch_res.status_code == 200
    updated_flag = patch_res.json()
    assert updated_flag["status"] == "ACCEPTED"
    assert updated_flag["reviewer"] == "Dr. Radhakrishnan K."
    assert len(updated_flag["audit_log"]) >= 2
    assert "Confirmed" in updated_flag["audit_log"][0]["action"]


def test_priority_flag_invalid_id(client):
    res = client.patch(
        "/api/priority/flags/9999",
        json={"status": "ACCEPTED"}
    )
    assert res.status_code == 400
