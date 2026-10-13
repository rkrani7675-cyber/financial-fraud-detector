import logging
import os
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

EXPERT_HEURISTIC_TEMPLATES = {
    "A": {
        "why_it_matters": (
            "Receivables growing substantially faster than revenue may indicate slower collections "
            "or potentially aggressive revenue recognition. When a company books sales faster than it collects cash, "
            "it could suggest that revenues are being recognized prematurely before cash realization."
        ),
        "recommended_investigation": (
            "- Examine customer accounts receivable aging schedules and overdue balances.\n"
            "- Review credit terms and discount policies extended to major customers.\n"
            "- Test subsequent cash collections and verify revenue recognition timing."
        )
    },
    "B": {
        "why_it_matters": (
            "When reported accounting profit rises but actual operating cash flow falls, it may indicate "
            "poor earnings quality. Operating cash flow represents tangible liquidity, whereas net profit "
            "is influenced by non-cash accruals. A persistent divergence could suggest earnings manipulation."
        ),
        "recommended_investigation": (
            "- Review changes in working capital accounts (receivables, payables, inventories).\n"
            "- Inspect one-off accounting gains or deferred expense adjustments.\n"
            "- Compare multi-year operating cash flows against net profit trends."
        )
    },
    "C": {
        "why_it_matters": (
            "Inventory expanding significantly faster than revenue growth can indicate unsold inventory buildup, "
            "slowing customer demand, or delayed write-downs of obsolete goods. It could also reflect capitalized "
            "costs that should have been expensed in cost of goods sold."
        ),
        "recommended_investigation": (
            "- Audit inventory turnover rates and slow-moving inventory reserves.\n"
            "- Check for potential obsolescence and inspect physical inventory count reports.\n"
            "- Review gross margin sustainability relative to inventory holding periods."
        )
    },
    "D": {
        "why_it_matters": (
            "A sudden jump in net profit margin compared to historical baseline averages could suggest "
            "aggressive accounting choices, under-accrued operating expenses, or unsustainable non-operating income."
        ),
        "recommended_investigation": (
            "- Reconcile gross margin versus operating margin to isolate source of expansion.\n"
            "- Check for changes in depreciation methods, useful life estimates, or tax provision reversals.\n"
            "- Verify whether cost deferrals occurred in the current reporting period."
        )
    },
    "E": {
        "why_it_matters": (
            "A rapid increase in related-party transactions can indicate circular trading, non-arm's-length "
            "dealings, or artificial volume generation. While legally permissible, sharp increases warrant "
            "scrutiny to ensure commercial substance."
        ),
        "recommended_investigation": (
            "- Inspect transfer pricing documentation and arm's-length transaction benchmarks.\n"
            "- Verify corporate ownership and governance relationships with counterparty entities.\n"
            "- Scrutinize the business purpose, settlement schedules, and cash receipts for related-party trades."
        )
    },
    "F": {
        "why_it_matters": (
            "Capital expenditures growing rapidly while depreciation expense remains flat or grows slowly "
            "may indicate that management is capitalizing operational costs to avoid expensing them on the income statement."
        ),
        "recommended_investigation": (
            "- Review fixed asset additions, capitalization criteria, and construction-in-progress balances.\n"
            "- Verify asset useful life assumptions and depreciation schedules.\n"
            "- Test whether ordinary maintenance expenses are being erroneously capitalized."
        )
    },
    "G": {
        "why_it_matters": (
            "Total debt rising rapidly without a commensurate increase in interest expense may indicate "
            "capitalization of financing charges, off-market subsidized loans, or incomplete debt disclosures."
        ),
        "recommended_investigation": (
            "- Review debt covenant agreements and effective interest rate schedules.\n"
            "- Inspect notes on capitalized borrowing costs under asset construction.\n"
            "- Confirm debt balances directly with lending financial institutions."
        )
    }
}
FALLBACK_TEMPLATES = EXPERT_HEURISTIC_TEMPLATES  # Backward compatibility alias

def generate_explanation(
    anomaly_type: str,
    name: str,
    description: str,
    year: int,
    company_name: str,
    risk_points: int,
    user_api_key: Optional[str] = None
) -> Dict[str, str]:
    """
    Generate structured 3-part forensic explanation for an anomaly.
    Uses user-provided OpenAI LLM API key if passed, or system key if configured;
    falls back safely to audited deterministic expert heuristic rules.
    NEVER logs or exposes any API key value.
    """
    detected_text = f"{name} detected in {year}: {description} (+{risk_points} risk points)."

    # Key resolution: User floating key > System key > None
    api_key: Optional[str] = None
    if user_api_key and user_api_key.strip():
        api_key = user_api_key.strip()
        logger.info("Generating AI explanation using user key.")
    else:
        system_key = os.getenv("OPENAI_API_KEY") or settings.OPENAI_API_KEY
        if system_key and system_key.strip():
            api_key = system_key.strip()
            logger.info("Generating AI explanation using system key.")

    if api_key:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=api_key)
            prompt = f"""You are a senior financial analyst explaining anomalies to an auditor or executive.
Company: {company_name}
Year: {year}
Anomaly Type: {name} ({anomaly_type})
Description: {description}
Risk Points: {risk_points}

Generate an analysis with EXACTLY these three sections:
DETECTED ANOMALY: (1 concise factual sentence describing what happened)
WHY IT MATTERS: (2-3 sentences explaining accounting risks. Never claim fraud, use words like 'may indicate' or 'could suggest')
RECOMMENDED INVESTIGATION: (2-3 bullet points of concrete audit/investigation checks)
"""
            completion = client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=300
            )
            raw_text = completion.choices[0].message.content or ""
            
            # Parse sections if present
            why_it_matters = ""
            recommended = ""
            if "WHY IT MATTERS:" in raw_text and "RECOMMENDED INVESTIGATION:" in raw_text:
                parts = raw_text.split("RECOMMENDED INVESTIGATION:")
                recommended = parts[1].strip()
                det_and_why = parts[0].split("WHY IT MATTERS:")
                why_it_matters = det_and_why[1].strip()
                if "DETECTED ANOMALY:" in det_and_why[0]:
                    detected_text = det_and_why[0].replace("DETECTED ANOMALY:", "").strip()
            
            if why_it_matters and recommended:
                return {
                    "detected": detected_text,
                    "why_it_matters": why_it_matters,
                    "recommended_investigation": recommended
                }
            else:
                logger.warning(
                    f"OpenAI completion for {company_name} ({anomaly_type}) returned non-standard format; using expert heuristic rules."
                )
        except Exception as exc:
            # Fail loud in logs with full traceback so the operator/developer knows the API failed
            logger.error(
                f"OpenAI API explanation generation failed for {company_name} [{anomaly_type}] year {year}: {exc}",
                exc_info=True
            )

    # Audited deterministic forensic heuristic templates
    template = EXPERT_HEURISTIC_TEMPLATES.get(anomaly_type, {
        "why_it_matters": (
            f"This metric deviation for {company_name} in {year} is statistically unusual compared to baseline expectations. "
            "It may indicate atypical operating performance or changes in reporting estimates."
        ),
        "recommended_investigation": (
            "- Review underlying general ledger journal entries for the period.\n"
            "- Inquire with management regarding the economic rationale for the deviation.\n"
            "- Perform substantive testing on affected financial statement line items."
        )
    })

    return {
        "detected": detected_text,
        "why_it_matters": template["why_it_matters"],
        "recommended_investigation": template["recommended_investigation"]
    }
