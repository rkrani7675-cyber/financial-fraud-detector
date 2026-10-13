import logging
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Company, FinancialData, Ratio, Anomaly, RiskScore, Explanation
from app.schemas import AnalysisResponse, AnomalyResponse, ExplanationResponse
from app.services.ai_explanation import generate_explanation

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/test-key")
def test_ai_key(
    user_ai_key: Optional[str] = Header(None, alias="X-User-AI-Key"),
    user_openai_key: Optional[str] = Header(None, alias="X-User-OpenAI-Key"),
    user_base_url: Optional[str] = Header(None, alias="X-User-AI-Base-URL"),
    user_model: Optional[str] = Header(None, alias="X-User-AI-Model"),
):
    """
    Validate user-provided AI API key & endpoint without persisting or echoing it.
    Supports ANY OpenAI-compatible provider (OpenAI, Groq, OpenRouter, DeepSeek, Ollama, etc.).
    Never logs the key or includes it in error details.
    """
    key = user_ai_key or user_openai_key
    if not key or not key.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No API key provided in X-User-AI-Key or X-User-OpenAI-Key header."
        )

    clean_key = key.strip()
    clean_base_url = user_base_url.strip() if user_base_url and user_base_url.strip() else None
    clean_model = user_model.strip() if user_model and user_model.strip() else None

    try:
        from openai import OpenAI
        client_kwargs = {"api_key": clean_key}
        if clean_base_url:
            client_kwargs["base_url"] = clean_base_url
        client = OpenAI(**client_kwargs)

        # Attempt models listing first
        try:
            client.models.list()
        except Exception:
            # If provider doesn't support models.list, send a minimal ping completion
            test_m = clean_model or settings.AI_MODEL or "gpt-4o-mini"
            client.chat.completions.create(
                model=test_m,
                messages=[{"role": "user", "content": "Ping"}],
                max_tokens=5
            )

        provider_label = "AI provider"
        if clean_base_url:
            if "groq" in clean_base_url.lower():
                provider_label = "Groq"
            elif "openrouter" in clean_base_url.lower():
                provider_label = "OpenRouter"
            elif "deepseek" in clean_base_url.lower():
                provider_label = "DeepSeek"
            elif "localhost" in clean_base_url or "127.0.0.1" in clean_base_url:
                provider_label = "Local Ollama"
        elif clean_key.startswith("sk-"):
            provider_label = "OpenAI"

        logger.info(f"User-provided {provider_label} connection verified successfully.")
        return {"success": True, "message": f"{provider_label} endpoint verified successfully."}
    except Exception as exc:
        logger.error(f"User-provided AI API key validation failed: {type(exc).__name__}")
        return {
            "success": False,
            "message": "Failed to validate AI connection. Please verify your API key, Base URL, or model."
        }

@router.get("/analyze/{company_id}", response_model=AnalysisResponse)
def analyze_company(
    company_id: int,
    db: Session = Depends(get_db),
    user_ai_key: Optional[str] = Header(None, alias="X-User-AI-Key"),
    user_openai_key: Optional[str] = Header(None, alias="X-User-OpenAI-Key"),
    user_base_url: Optional[str] = Header(None, alias="X-User-AI-Base-URL"),
    user_model: Optional[str] = Header(None, alias="X-User-AI-Model"),
):
    """
    Retrieve full anomaly detection analysis, score, and AI explanations for a company.
    If X-User-AI-Key or X-User-OpenAI-Key is passed, explanations are generated on the fly and NEVER persisted to DB.
    """
    effective_key = user_ai_key or user_openai_key
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
    if effective_key and effective_key.strip():
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
                user_api_key=effective_key.strip(),
                user_base_url=user_base_url.strip() if user_base_url else None,
                user_model=user_model.strip() if user_model else None,
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
    user_ai_key: Optional[str] = Header(None, alias="X-User-AI-Key"),
    user_openai_key: Optional[str] = Header(None, alias="X-User-OpenAI-Key"),
    user_base_url: Optional[str] = Header(None, alias="X-User-AI-Base-URL"),
    user_model: Optional[str] = Header(None, alias="X-User-AI-Model"),
):
    """
    Retrieve AI-generated explanations for detected anomalies.
    If X-User-AI-Key or X-User-OpenAI-Key is passed, explanations are generated on the fly and NEVER persisted to DB.
    """
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    anomalies = db.query(Anomaly).filter(Anomaly.company_id == company_id).all()
    effective_key = user_ai_key or user_openai_key

    if effective_key and effective_key.strip():
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
                user_api_key=effective_key.strip(),
                user_base_url=user_base_url.strip() if user_base_url else None,
                user_model=user_model.strip() if user_model else None,
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
