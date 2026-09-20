from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class QueueEvent(Base):
    __tablename__ = "queue_events"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    token_id: Mapped[int] = mapped_column(ForeignKey("queue_tokens.id", ondelete="CASCADE"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(60), index=True, nullable=False)  # REGISTERED, CALLED, IN_SERVICE, COMPLETED, SKIPPED, PRIORITY_FLAGGED
    performed_by: Mapped[str] = mapped_column(String(120), default="System", nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    metadata_json: Mapped[str] = mapped_column(Text, default="{}", nullable=True)

    # Relationships
    token = relationship("QueueToken", back_populates="events")
