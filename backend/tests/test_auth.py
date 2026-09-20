import pytest


def test_login_success(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "reception@test.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "reception"
    assert data["email"] == "reception@test.com"


def test_login_invalid_password(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "reception@test.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["error"]["message"]


def test_login_user_not_found(client):
    response = client.post(
        "/api/auth/login",
        json={"email": "nonexistent@test.com", "password": "password123"}
    )
    assert response.status_code == 401


def test_get_me_authenticated(client, auth_headers_reception):
    response = client.get("/api/auth/me", headers=auth_headers_reception)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "reception@test.com"
    assert data["role"] == "reception"


def test_get_me_unauthorized(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
