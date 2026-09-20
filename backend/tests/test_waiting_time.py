import pytest


def test_get_department_waiting_time(client):
    # Register 2 patients
    client.post("/api/patients/register", json={"department_id": 1, "anonymous_reference": "WAIT-1"})
    client.post("/api/patients/register", json={"department_id": 1, "anonymous_reference": "WAIT-2"})

    response = client.get("/api/waiting-time/1")
    assert response.status_code == 200
    data = response.json()
    assert data["department_id"] == 1
    assert data["waiting_count"] == 2
    assert data["estimated_wait_minutes"] > 0
    assert "minimum" in data["range"]
    assert "maximum" in data["range"]
    assert data["range"]["minimum"] <= data["range"]["maximum"]
    assert len(data["factors"]) >= 3
    assert data["method"] == "Transparent baseline heuristic flow model"
    assert "operational_advice" in data


def test_get_waiting_time_invalid_department(client):
    response = client.get("/api/waiting-time/999")
    assert response.status_code == 404


def test_get_individual_token_waiting_time(client):
    reg = client.post("/api/patients/register", json={"department_id": 1, "anonymous_reference": "TOK-WAIT-1"})
    token_id = reg.json()["token_id"]

    response = client.get(f"/api/waiting-time/token/{token_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["token_id"] == token_id
    assert data["status"] == "WAITING"
    assert "estimated_wait_minutes" in data
