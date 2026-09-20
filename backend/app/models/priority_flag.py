from datetime import datetime, timezone
from sqlalchemy import String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class PriorityFlag(Base):
    __tablename__ = "priority_flags"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    token_id: Mapped[int] = mapped_column(ForeignKey("queue_tokens.id", ondelete="CASCADE"), nullable=False)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    reason_category: Mapped[str] = mapped_column(String(150), nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.90, nullable=False)  # Heuristic / Staff confidence
    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        index=True,
        nullable=False
    )  # PENDING, REVIEWED, ACCEPTED, REJECTED
    created_by: Mapped[str] = mapped_column(String(120), default="Staff Nurse", nullable=False)
    reviewed_by: Mapped[str] = mapped_column(String(120), nullable=True)
    review_notes: Mapped[str] = mapped_column(Text, nullable=True)
    audit_history: Mapped[str] = mapped_column(Text, default="[]", nullable=False)  # JSON string of actions
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    reviewed_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

    # Relationships
    token = relationship("QueueToken", back_populates="priority_flags")
    patient = relationship("Patient", back_populates="priority_flags")
