from typing import Optional
from pydantic import BaseModel

class FinancialDataBase(BaseModel):
    year: int
    revenue: float
    cogs: float
    operating_expenses: Optional[float] = 0.0
    net_profit: float
    receivables: float
    inventory: float
    total_assets: float
    total_debt: float
    equity: float
    operating_cash_flow: float
    capex: float
    depreciation: float
    related_party_transactions: Optional[float] = 0.0
    interest_expense: Optional[float] = 0.0
    current_assets: Optional[float] = 0.0
    current_liabilities: Optional[float] = 0.0

class FinancialDataCreate(FinancialDataBase):
    pass

class FinancialDataResponse(FinancialDataBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True
