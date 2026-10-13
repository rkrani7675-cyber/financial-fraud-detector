import logging
import os
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Company, FinancialData, Ratio, Anomaly, RiskScore, Explanation
from app.schemas import UploadResponse
from app.utils.validators import MAX_FILE_SIZE_BYTES
from app.services.extraction import parse_financial_file, DataExtractionError
from app.services.ratios import calculate_company_ratios
from app.services.anomaly import detect_anomalies
from app.services.scoring import calculate_risk_score
from app.services.ai_explanation import generate_explanation
from app.models.user import User
from app.services.auth import get_optional_current_user

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_financial_data(
    file: UploadFile = File(...),
    company_name: Optional[str] = Form(None),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # 1. Validate file extension
    filename = file.filename or "unknown"
    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".xlsx", ".xls", ".csv"]:
        logger.warning(f"Rejected upload with unsupported extension '{ext}' for file '{filename}'")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload .xlsx, .xls, or .csv"
        )

    # 2. Read bytes and check size
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE_BYTES:
        size_mb = round(len(file_bytes) / (1024 * 1024), 2)
        logger.warning(f"Rejected file '{filename}' exceeding 10MB limit ({size_mb}MB)")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds 10MB limit (size: {size_mb}MB)"
        )

    # 3. Parse and extract records
    try:
        records, warnings = parse_financial_file(file_bytes, filename)
    except DataExtractionError as e:
        logger.warning(f"Data extraction error parsing '{filename}': {e.message}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except Exception as e:
        logger.error(f"Internal error processing upload '{filename}': {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process financial statement file: {str(e)}"
        )

    # 4. Resolve company name
    if not company_name or not company_name.strip():
        # Derive from filename without extension
        base_name = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ")
        company_name = base_name.strip().title()
    else:
        company_name = company_name.strip()

    # 5. Create or get Company
    company = db.query(Company).filter(Company.name == company_name).first()
    if not company:
        company = Company(
            name=company_name,
            user_id=current_user.id if current_user else None
        )
        db.add(company)
        db.commit()
        db.refresh(company)
    else:
        if current_user and not company.user_id:
            company.user_id = current_user.id
        # Clear previous analysis data for a fresh re-analysis
        db.query(FinancialData).filter(FinancialData.company_id == company.id).delete()
        db.query(Ratio).filter(Ratio.company_id == company.id).delete()
        db.query(Anomaly).filter(Anomaly.company_id == company.id).delete()
        db.query(RiskScore).filter(RiskScore.company_id == company.id).delete()
        db.query(Explanation).filter(Explanation.company_id == company.id).delete()
        db.commit()

    # 6. Insert FinancialData
    fin_models = []
    for r in records:
        fin_obj = FinancialData(company_id=company.id, **r)
        fin_models.append(fin_obj)
        db.add(fin_obj)
    db.commit()

    # 7. Calculate Ratios
    calculated_ratios = calculate_company_ratios(records)
    for r in calculated_ratios:
        db.add(Ratio(company_id=company.id, **r))
    db.commit()

    # 8. Detect Anomalies
    detected = detect_anomalies(records, calculated_ratios)
    created_anomalies = []
    for a in detected:
        anomaly_obj = Anomaly(company_id=company.id, **a)
        db.add(anomaly_obj)
        created_anomalies.append(anomaly_obj)
    db.commit()

    # 9. Calculate Risk Score (with 3 Risk Levels)
    score, risk_level = calculate_risk_score(detected)
    risk_obj = RiskScore(company_id=company.id, score=score, risk_level=risk_level)
    db.add(risk_obj)
    db.commit()

    # 10. Generate AI Explanations
    for anom in created_anomalies:
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

    years_found = len(records)
    data_points = years_found * len(records[0]) if years_found > 0 else 0

    logger.info(
        f"Successfully processed upload for '{company.name}' (ID: {company.id}): "
        f"{years_found} years, {len(detected)} anomalies, Risk Score: {score}/100 ({risk_level})"
    )

    return UploadResponse(
        success=True,
        company_id=company.id,
        company_name=company.name,
        message=f"Financial data for '{company.name}' processed successfully. {len(detected)} anomalies identified.",
        years_found=years_found,
        data_points=data_points
    )
