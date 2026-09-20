import pytest


def test_call_next_empty_queue(client):
    response = client.post("/api/queue/1/call-next", json={"counter_number": 1})
    assert response.status_code == 404
    assert "No waiting patients" in response.json()["error"]["message"]


def test_call_next_priority_precedence(client):
    # Register regular patient first
    client.post(
        "/api/patients/register",
        json={"department_id": 1, "anonymous_reference": "REGULAR-1", "is_priority": False}
    )
    # Register priority patient second
    client.post(
        "/api/patients/register",
        json={"department_id": 1, "anonymous_reference": "PRIORITY-1", "is_priority": True, "priority_reason": "Acute Pain"}
    )

    # Calling next should pick PRIORITY-1 despite being registered second!
    call_res = client.post("/api/queue/1/call-next", json={"counter_number": 1, "staff_name": "Dr. Test"})
    assert call_res.status_code == 200
    called_data = call_res.json()
    assert called_data["is_priority"] is True
    assert called_data["status"] == "CALLED"
    assert called_data["counter_number"] == 1


def test_update_token_lifecycle(client):
    reg = client.post(
        "/api/patients/register",
        json={"department_id": 1, "anonymous_reference": "LIFECYCLE-1"}
    )
    token_id = reg.json()["token_id"]

    # 1. Update to IN_SERVICE
    res1 = client.patch(f"/api/queue/tokens/{token_id}/status", json={"status": "IN_SERVICE", "counter_number": 2})
    assert res1.status_code == 200
    assert res1.json()["status"] == "IN_SERVICE"

    # 2. Update to COMPLETED
    res2 = client.patch(f"/api/queue/tokens/{token_id}/status", json={"status": "COMPLETED", "service_duration_minutes": 7.5})
    assert res2.status_code == 200
    assert res2.json()["status"] == "COMPLETED"
    assert res2.json()["service_duration_minutes"] == 7.5


def test_update_token_invalid_status(client):
    reg = client.post(
        "/api/patients/register",
        json={"department_id": 1, "anonymous_reference": "INVALID-1"}
    )
    token_id = reg.json()["token_id"]

    res = client.patch(f"/api/queue/tokens/{token_id}/status", json={"status": "INVALID_STATUS"})
    assert res.status_code == 400
    assert "Invalid status" in res.json()["error"]["message"]


def test_get_all_queue_tokens(client):
    client.post("/api/patients/register", json={"department_id": 1, "anonymous_reference": "ALL-1"})
    client.post("/api/patients/register", json={"department_id": 1, "anonymous_reference": "ALL-2"})

    res = client.get("/api/queue")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2
