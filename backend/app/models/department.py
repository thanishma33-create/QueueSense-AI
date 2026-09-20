from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)  # GM, PED, ORTHO, ENT
    malayalam_name: Mapped[str] = mapped_column(String(200), nullable=True)
    location: Mapped[str] = mapped_column(String(150), default="Block A, Ground Floor")
    active_counters: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    total_counters: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    average_service_duration: Mapped[float] = mapped_column(Float, default=8.0, nullable=False)  # in minutes
    color: Mapped[str] = mapped_column(String(30), default="#0d9488")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    patients = relationship("Patient", back_populates="department", cascade="all, delete-orphan")
    tokens = relationship("QueueToken", back_populates="department", cascade="all, delete-orphan")
