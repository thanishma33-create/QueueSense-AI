from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean, Float, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class QueueToken(Base):
    __tablename__ = "queue_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    token_number: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # e.g. GM-042
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(
        String(40),
        default="WAITING",
        index=True,
        nullable=False
    )  # WAITING, CALLED, IN_SERVICE, COMPLETED, CANCELLED, NO_SHOW
    counter_number: Mapped[int] = mapped_column(Integer, nullable=True)
    counter_served: Mapped[str] = mapped_column(String(120), nullable=True)
    is_priority: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    priority_reason: Mapped[str] = mapped_column(String(200), nullable=True)
    
    # Timestamps
    registration_time: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    called_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    service_start_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    completion_time: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    service_duration_minutes: Mapped[float] = mapped_column(Float, nullable=True)
    estimated_wait_minutes: Mapped[int] = mapped_column(Integer, default=15, nullable=False)

    # Relationships
    patient = relationship("Patient", back_populates="tokens")
    department = relationship("Department", back_populates="tokens")
    priority_flags = relationship("PriorityFlag", back_populates="token", cascade="all, delete-orphan")
    events = relationship("QueueEvent", back_populates="token", cascade="all, delete-orphan")
