from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.financial_data import FinancialDataResponse
from app.schemas.ratio import RatioResponse
from app.schemas.anomaly import AnomalyResponse, ExplanationResponse
from app.schemas.risk_score import RiskScoreResponse

class CompanyBase(BaseModel):
    name: str

class CompanyCreate(CompanyBase):
    pass

class CompanyListItem(BaseModel):
    id: int
    name: str
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    years_count: Optional[int] = 0
    created_at: datetime

    class Config:
        from_attributes = True

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    years: List[int] = []
    financial_data: List[FinancialDataResponse] = []
    ratios: List[RatioResponse] = []

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    success: bool
    company_id: int
    company_name: str
    message: str
    years_found: int
    data_points: int

class AnalysisResponse(BaseModel):
    company_id: int
    company_name: str
    risk_score: int
    risk_level: str
    anomalies: List[AnomalyResponse]
    explanations: List[ExplanationResponse]
    ratios: List[RatioResponse]
    financial_data: List[FinancialDataResponse]
