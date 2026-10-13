from typing import Optional
from pydantic import BaseModel

class RatioBase(BaseModel):
    year: int
    gross_margin: Optional[float] = None
    operating_margin: Optional[float] = None
    net_margin: Optional[float] = None
    roe: Optional[float] = None
    roa: Optional[float] = None
    roce: Optional[float] = None
    current_ratio: Optional[float] = None
    quick_ratio: Optional[float] = None
    ocf_ratio: Optional[float] = None
    debt_to_equity: Optional[float] = None
    debt_to_assets: Optional[float] = None
    interest_coverage: Optional[float] = None
    receivables_turnover: Optional[float] = None
    inventory_turnover: Optional[float] = None
    asset_turnover: Optional[float] = None
    cash_conversion_cycle: Optional[float] = None
    ocf_to_profit: Optional[float] = None
    free_cash_flow: Optional[float] = None

class RatioCreate(RatioBase):
    pass

class RatioResponse(RatioBase):
    id: int
    company_id: int

    class Config:
        from_attributes = True
