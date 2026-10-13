from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class AnomalyBase(BaseModel):
    anomaly_type: str
    name: str
    year: int
    description: str
    risk_points: int

class AnomalyCreate(AnomalyBase):
    pass

class ExplanationBase(BaseModel):
    anomaly_id: int
    detected: str
    why_it_matters: str
    recommended_investigation: str

class ExplanationResponse(ExplanationBase):
    id: int
    company_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AnomalyResponse(AnomalyBase):
    id: int
    company_id: int
    created_at: datetime
    explanations: Optional[List[ExplanationResponse]] = []

    class Config:
        from_attributes = True
