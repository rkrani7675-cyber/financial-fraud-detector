import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Company, FinancialData, Ratio, RiskScore
from app.schemas import CompanyResponse, CompanyListItem

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/companies", response_model=List[CompanyListItem])
def list_companies(db: Session = Depends(get_db)):
    """Retrieve list of all registered companies with risk scores."""
    companies = db.query(Company).order_by(Company.created_at.desc()).all()
    results = []
    for c in companies:
        latest_score_obj = db.query(RiskScore).filter(RiskScore.company_id == c.id).order_by(RiskScore.created_at.desc()).first()
        fin_years = db.query(FinancialData.year).filter(FinancialData.company_id == c.id).distinct().all()
        
        results.append(CompanyListItem(
            id=c.id,
            name=c.name,
            risk_score=latest_score_obj.score if latest_score_obj else 0,
            risk_level=latest_score_obj.risk_level if latest_score_obj else "Low",
            years_count=len(fin_years),
            created_at=c.created_at
        ))
    return results

@router.get("/company/{company_id}", response_model=CompanyResponse)
def get_company_details(company_id: int, db: Session = Depends(get_db)):
    """Retrieve details, financial statements, and ratios for a specific company."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        logger.warning(f"Company details query failed: ID {company_id} not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )

    fin_data = db.query(FinancialData).filter(FinancialData.company_id == company_id).order_by(FinancialData.year.asc()).all()
    ratios = db.query(Ratio).filter(Ratio.company_id == company_id).order_by(Ratio.year.asc()).all()
    years = [f.year for f in fin_data]

    return CompanyResponse(
        id=company.id,
        name=company.name,
        created_at=company.created_at,
        updated_at=company.updated_at,
        years=years,
        financial_data=fin_data,
        ratios=ratios
    )

@router.delete("/company/{company_id}")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Delete a company and all associated records."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        logger.warning(f"Deletion failed: Company ID {company_id} not found.")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    name = company.name
    db.delete(company)
    db.commit()
    logger.info(f"Deleted company '{name}' (ID: {company_id}) and all associated records.")
    return {"success": True, "message": f"Company '{name}' deleted successfully."}
