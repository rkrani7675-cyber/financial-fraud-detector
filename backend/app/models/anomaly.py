from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    anomaly_type = Column(String(10), nullable=False)  # A, B, C, D, E, F, G
    name = Column(String(100), nullable=False)          # e.g., "Receivables vs Revenue"
    year = Column(Integer, nullable=False)
    description = Column(String(500), nullable=False)
    risk_points = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="anomalies")
    explanations = relationship("Explanation", back_populates="anomaly", cascade="all, delete-orphan")
