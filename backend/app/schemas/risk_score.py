from datetime import datetime
from pydantic import BaseModel

class RiskScoreBase(BaseModel):
    score: int
    risk_level: str  # "Low", "Moderate", "High"

class RiskScoreCreate(RiskScoreBase):
    pass

class RiskScoreResponse(RiskScoreBase):
    id: int
    company_id: int
    created_at: datetime

    class Config:
        from_attributes = True
