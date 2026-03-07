import uuid

from sqlalchemy import Column, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID

from models import Base


class PositionMarker(Base):
    __tablename__ = "position_markers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    airport_id = Column(
        UUID(as_uuid=True), ForeignKey("airports.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(Text, nullable=False)
    x_m = Column(Float, nullable=False)
    y_m = Column(Float, nullable=False)
