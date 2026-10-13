from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class FinancialData(Base):
    __tablename__ = "financial_data"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)

    # Income Statement
    revenue = Column(Float, nullable=False)
    cogs = Column(Float, nullable=False)
    operating_expenses = Column(Float, nullable=True, default=0.0)
    net_profit = Column(Float, nullable=False)

    # Balance Sheet
    receivables = Column(Float, nullable=False)
    inventory = Column(Float, nullable=False)
    total_assets = Column(Float, nullable=False)
    total_debt = Column(Float, nullable=False)
    equity = Column(Float, nullable=False)
    current_assets = Column(Float, nullable=True, default=0.0)
    current_liabilities = Column(Float, nullable=True, default=0.0)

    # Cash Flow Statement
    operating_cash_flow = Column(Float, nullable=False)
    capex = Column(Float, nullable=False)
    depreciation = Column(Float, nullable=False)

    # Notes & Other
    related_party_transactions = Column(Float, nullable=True, default=0.0)
    interest_expense = Column(Float, nullable=True, default=0.0)

    company = relationship("Company", back_populates="financial_data")
