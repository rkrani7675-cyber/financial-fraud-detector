import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

def safe_div(numerator: Any, denominator: Any, default: Optional[float] = None) -> Optional[float]:
    """
    Safely divide two numbers.
    Returns default if denominator is 0. Explicitly handles and logs type errors.
    """
    if denominator is None or denominator == 0:
        return default
    try:
        val = float(numerator) / float(denominator)
        return round(val, 4)
    except ZeroDivisionError:
        return default
    except (TypeError, ValueError) as err:
        logger.warning(
            f"safe_div encountered non-numeric input: numerator={numerator!r}, denominator={denominator!r} ({err})"
        )
        return default

def calculate_company_ratios(financial_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Calculate all 18 PRD-specified financial ratios for each historical year.
    Records are assumed to be sorted by year.
    """
    results: List[Dict[str, Any]] = []

    for row in financial_records:
        year = row["year"]
        revenue = float(row.get("revenue", 0.0))
        cogs = float(row.get("cogs", 0.0))
        opex = float(row.get("operating_expenses", 0.0))
        net_profit = float(row.get("net_profit", 0.0))
        receivables = float(row.get("receivables", 0.0))
        inventory = float(row.get("inventory", 0.0))
        total_assets = float(row.get("total_assets", 0.0))
        total_debt = float(row.get("total_debt", 0.0))
        equity = float(row.get("equity", 0.0))
        ocf = float(row.get("operating_cash_flow", 0.0))
        capex = float(row.get("capex", 0.0))
        interest_exp = float(row.get("interest_expense", 0.0))
        curr_assets = float(row.get("current_assets", 0.0))
        curr_liab = float(row.get("current_liabilities", 0.0))

        gross_profit = revenue - cogs
        operating_profit = gross_profit - opex if opex > 0 else gross_profit

        # 1. Gross Margin
        gross_margin = safe_div(gross_profit, revenue)

        # 2. Operating Margin
        operating_margin = safe_div(operating_profit, revenue)

        # 3. Net Margin
        net_margin = safe_div(net_profit, revenue)

        # 4. ROE
        roe = safe_div(net_profit, equity)

        # 5. ROA
        roa = safe_div(net_profit, total_assets)

        # 6. ROCE (Operating Profit / (Total Debt + Equity))
        capital_employed = total_debt + equity if (total_debt + equity) > 0 else (total_assets - curr_liab)
        roce = safe_div(operating_profit, capital_employed)

        # 7. Current Ratio
        current_ratio = safe_div(curr_assets, curr_liab) if curr_liab > 0 else None

        # 8. Quick Ratio
        quick_ratio = safe_div(curr_assets - inventory, curr_liab) if curr_liab > 0 else None

        # 9. Operating Cash Flow Ratio
        ocf_ratio = safe_div(ocf, curr_liab) if curr_liab > 0 else None

        # 10. Debt-to-Equity
        debt_to_equity = safe_div(total_debt, equity)

        # 11. Debt-to-Assets
        debt_to_assets = safe_div(total_debt, total_assets)

        # 12. Interest Coverage
        interest_coverage = safe_div(operating_profit, interest_exp) if interest_exp > 0 else None

        # 13. Receivables Turnover
        receivables_turnover = safe_div(revenue, receivables)

        # 14. Inventory Turnover
        inventory_turnover = safe_div(cogs, inventory)

        # 15. Asset Turnover
        asset_turnover = safe_div(revenue, total_assets)

        # 16. Cash Conversion Cycle (Days Inventory + Days Receivables)
        days_sales_rec = (receivables / revenue * 365) if revenue > 0 else 0
        days_inv = (inventory / cogs * 365) if cogs > 0 else 0
        cash_conversion_cycle = round(days_sales_rec + days_inv, 2)

        # 17. OCF to Net Profit
        ocf_to_profit = safe_div(ocf, net_profit)

        # 18. Free Cash Flow
        free_cash_flow = round(ocf - capex, 2)

        ratio_entry = {
            "year": year,
            "gross_margin": gross_margin,
            "operating_margin": operating_margin,
            "net_margin": net_margin,
            "roe": roe,
            "roa": roa,
            "roce": roce,
            "current_ratio": current_ratio,
            "quick_ratio": quick_ratio,
            "ocf_ratio": ocf_ratio,
            "debt_to_equity": debt_to_equity,
            "debt_to_assets": debt_to_assets,
            "interest_coverage": interest_coverage,
            "receivables_turnover": receivables_turnover,
            "inventory_turnover": inventory_turnover,
            "asset_turnover": asset_turnover,
            "cash_conversion_cycle": cash_conversion_cycle,
            "ocf_to_profit": ocf_to_profit,
            "free_cash_flow": free_cash_flow,
        }
        results.append(ratio_entry)

    return results
