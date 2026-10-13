from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Ratio(Base):
    __tablename__ = "ratios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)

    # Profitability Ratios
    gross_margin = Column(Float, nullable=True)
    operating_margin = Column(Float, nullable=True)
    net_margin = Column(Float, nullable=True)
    roe = Column(Float, nullable=True)
    roa = Column(Float, nullable=True)
    roce = Column(Float, nullable=True)

    # Liquidity Ratios
    current_ratio = Column(Float, nullable=True)
    quick_ratio = Column(Float, nullable=True)
    ocf_ratio = Column(Float, nullable=True)

    # Leverage Ratios
    debt_to_equity = Column(Float, nullable=True)
    debt_to_assets = Column(Float, nullable=True)
    interest_coverage = Column(Float, nullable=True)

    # Efficiency Ratios
    receivables_turnover = Column(Float, nullable=True)
    inventory_turnover = Column(Float, nullable=True)
    asset_turnover = Column(Float, nullable=True)
    cash_conversion_cycle = Column(Float, nullable=True)

    # Cash Flow Quality Ratios
    ocf_to_profit = Column(Float, nullable=True)
    free_cash_flow = Column(Float, nullable=True)

    company = relationship("Company", back_populates="ratios")
