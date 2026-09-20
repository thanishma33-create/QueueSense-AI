import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base, get_db
from app.models.user import User
from app.models.department import Department
from app.utils.security import get_password_hash, create_access_token

# Test in-memory SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh in-memory database for each test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed base test department & users
    dept = Department(
        name="General Medicine",
        code="GM",
        malayalam_name="ജനറൽ മെഡിസിൻ",
        active_counters=2,
        total_counters=3,
        average_service_duration=8.0,
        is_active=True
    )
    db.add(dept)

    reception = User(
        name="Reception Nurse",
        email="reception@test.com",
        hashed_password=get_password_hash("password123"),
        role="reception",
        is_active=True
    )
    doctor = User(
        name="Dr. Test",
        email="doctor@test.com",
        hashed_password=get_password_hash("password123"),
        role="doctor",
        is_active=True
    )
    admin = User(
        name="Admin Test",
        email="admin@test.com",
        hashed_password=get_password_hash("password123"),
        role="admin",
        is_active=True
    )
    db.add_all([reception, doctor, admin])
    db.commit()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers_reception(db_session):
    user = db_session.query(User).filter(User.email == "reception@test.com").first()
    token = create_access_token(subject=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_doctor(db_session):
    user = db_session.query(User).filter(User.email == "doctor@test.com").first()
    token = create_access_token(subject=user.id, role=user.role)
    return {"Authorization": f"Bearer {token}"}
