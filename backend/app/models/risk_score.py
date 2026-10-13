from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, nullable=False)  # 0 to 100
    risk_level = Column(String(50), nullable=False)  # "Low", "Moderate", "High"
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company", back_populates="risk_scores")
