from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    anonymous_reference: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)  # PAT-XXXX or REF-8291
    anonymized_name: Mapped[str] = mapped_column(String(100), default="Patient")
    age_group: Mapped[str] = mapped_column(String(50), default="Adult (18-59)", nullable=False)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    visit_type: Mapped[str] = mapped_column(String(60), default="Walk-in OPD")
    accessibility_needs: Mapped[str] = mapped_column(Text, default="", nullable=True)  # Comma-separated or JSON string
    registration_time: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    department = relationship("Department", back_populates="patients")
    tokens = relationship("QueueToken", back_populates="patient", cascade="all, delete-orphan")
    priority_flags = relationship("PriorityFlag", back_populates="patient", cascade="all, delete-orphan")
