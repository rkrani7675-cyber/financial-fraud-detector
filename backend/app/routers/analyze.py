import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Company, FinancialData, Ratio, Anomaly, RiskScore, Explanation
from app.schemas import AnalysisResponse, AnomalyResponse, ExplanationResponse
from app.services.ai_explanation import generate_explanation

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/test-key")
def test_openai_key(user_api_key: Optional[str] = Header(None, alias="X-User-OpenAI-Key")):
    """
    Validate user-provided OpenAI API key without persisting or echoing it.
    Never logs the key or includes it in error details.
    """
    if not user_api_key or not user_api_key.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No API key provided in X-User-OpenAI-Key header."
        )

    clean_key = user_api_key.strip()
    try:
        from openai import OpenAI
        client = OpenAI(api_key=clean_key)
        client.models.list()
        logger.info("User-provided OpenAI API key tested and verified successfully.")
        return {"success": True, "message": "OpenAI API key verified successfully."}
    except Exception as exc:
        logger.error(f"User-provided OpenAI API key validation failed: {type(exc).__name__}")
        return {
            "success": False,
            "message": "Failed to validate OpenAI API key. Key is invalid, expired, or unauthorized."
        }

@router.get("/analyze/{company_id}", response_model=AnalysisResponse)
def analyze_company(
    company_id: int,
    db: Session = Depends(get_db),
    user_api_key: Optional[str] = Header(None, alias="X-User-OpenAI-Key")
):
    """
    Retrieve full anomaly detection analysis, score, and AI explanations for a company.
    If X-User-OpenAI-Key is passed, explanations are generated on the fly and NEVER persisted to DB.
    """
    logger.info(f"Fetching forensic analysis for company ID: {company_id}")
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        logger.warning(f"Analysis request failed: company ID {company_id} not found.")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found."
        )

    risk_obj = db.query(RiskScore).filter(RiskScore.company_id == company_id).order_by(RiskScore.created_at.desc()).first()
    score = risk_obj.score if risk_obj else 0
    risk_level = risk_obj.risk_level if risk_obj else "Low"

    anomalies = db.query(Anomaly).filter(Anomaly.company_id == company_id).order_by(Anomaly.year.desc()).all()

    # Dynamic generation with floating user key (PRIVACY: NEVER CACHED IN DB)
    if user_api_key and user_api_key.strip():
        logger.info(f"Generating un-cached dynamic explanations using user key for company ID: {company_id}")
        explanations = []
        for idx, anom in enumerate(anomalies, start=1):
            expl_data = generate_explanation(
                anomaly_type=anom.anomaly_type,
                name=anom.name,
                description=anom.description,
                year=anom.year,
                company_name=company.name,
                risk_points=anom.risk_points,
                user_api_key=user_api_key.strip()
            )
            explanations.append(Explanation(
                id=-idx,
                company_id=company.id,
                anomaly_id=anom.id,
                detected=expl_data["detected"],
                why_it_matters=expl_data["why_it_matters"],
                recommended_investigation=expl_data["recommended_investigation"],
                created_at=datetime.utcnow()
            ))
    else:
        # Standard system caching workflow
        explanations = db.query(Explanation).filter(Explanation.company_id == company_id).all()
        if anomalies and not explanations:
            logger.info(f"Self-healing trigger: generating explanations for {len(anomalies)} anomalies on company {company_id}")
            for anom in anomalies:
                expl_data = generate_explanation(
                    anomaly_type=anom.anomaly_type,
                    name=anom.name,
                    description=anom.description,
                    year=anom.year,
                    company_name=company.name,
                    risk_points=anom.risk_points
                )
                db.add(Explanation(
                    company_id=company.id,
                    anomaly_id=anom.id,
                    detected=expl_data["detected"],
                    why_it_matters=expl_data["why_it_matters"],
                    recommended_investigation=expl_data["recommended_investigation"]
                ))
            db.commit()
            explanations = db.query(Explanation).filter(Explanation.company_id == company_id).all()

    ratios = db.query(Ratio).filter(Ratio.company_id == company_id).order_by(Ratio.year.asc()).all()
    fin_data = db.query(FinancialData).filter(FinancialData.company_id == company_id).order_by(FinancialData.year.asc()).all()

    return AnalysisResponse(
        company_id=company.id,
        company_name=company.name,
        risk_score=score,
        risk_level=risk_level,
        anomalies=anomalies,
        explanations=explanations,
        ratios=ratios,
        financial_data=fin_data
    )

@router.get("/anomalies/{company_id}", response_model=List[AnomalyResponse])
def get_company_anomalies(company_id: int, db: Session = Depends(get_db)):
    """Retrieve detected anomalies for a company."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return db.query(Anomaly).filter(Anomaly.company_id == company_id).order_by(Anomaly.year.desc()).all()

@router.get("/explanations/{company_id}", response_model=List[ExplanationResponse])
def get_company_explanations(
    company_id: int,
    db: Session = Depends(get_db),
    user_api_key: Optional[str] = Header(None, alias="X-User-OpenAI-Key")
):
    """
    Retrieve AI-generated explanations for detected anomalies.
    If X-User-OpenAI-Key is passed, explanations are generated on the fly and NEVER persisted to DB.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    anomalies = db.query(Anomaly).filter(Anomaly.company_id == company_id).all()

    if user_api_key and user_api_key.strip():
        logger.info(f"Generating un-cached dynamic explanations using user key for company ID: {company_id}")
        explanations = []
        for idx, anom in enumerate(anomalies, start=1):
            expl_data = generate_explanation(
                anomaly_type=anom.anomaly_type,
                name=anom.name,
                description=anom.description,
                year=anom.year,
                company_name=company.name,
                risk_points=anom.risk_points,
                user_api_key=user_api_key.strip()
            )
            explanations.append(Explanation(
                id=-idx,
                company_id=company.id,
                anomaly_id=anom.id,
                detected=expl_data["detected"],
                why_it_matters=expl_data["why_it_matters"],
                recommended_investigation=expl_data["recommended_investigation"],
                created_at=datetime.utcnow()
            ))
        return explanations

    explanations = db.query(Explanation).filter(Explanation.company_id == company_id).all()
    if not explanations:
        if anomalies:
            for anom in anomalies:
                expl_data = generate_explanation(
                    anomaly_type=anom.anomaly_type,
                    name=anom.name,
                    description=anom.description,
                    year=anom.year,
                    company_name=company.name,
                    risk_points=anom.risk_points
                )
                db.add(Explanation(
                    company_id=company.id,
                    anomaly_id=anom.id,
                    detected=expl_data["detected"],
                    why_it_matters=expl_data["why_it_matters"],
                    recommended_investigation=expl_data["recommended_investigation"]
                ))
            db.commit()
            explanations = db.query(Explanation).filter(Explanation.company_id == company_id).all()

    return explanations
