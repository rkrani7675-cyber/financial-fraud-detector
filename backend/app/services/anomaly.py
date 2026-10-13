from typing import List, Dict, Any, Tuple

def calc_growth(current: float, previous: float) -> float:
    """Calculate percentage growth between two periods."""
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return ((current - previous) / abs(previous)) * 100.0

def detect_anomalies(financial_records: List[Dict[str, Any]], ratios: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Run the 7 PRD anomaly detection rules across historical years.
    Returns list of detected anomaly dictionaries.
    """
    if len(financial_records) < 2:
        return []

    anomalies: List[Dict[str, Any]] = []

    # Map records and ratios by year for quick lookup
    records_by_year = {r["year"]: r for r in financial_records}
    ratios_by_year = {r["year"]: r for r in ratios}
    years = sorted(records_by_year.keys())

    # --- Rule A: Receivables vs Revenue (+15 pts) ---
    for i in range(1, len(years)):
        y_prev, y_curr = years[i - 1], years[i]
        rec_prev = records_by_year[y_prev]
        rec_curr = records_by_year[y_curr]

        rev_growth = calc_growth(rec_curr["revenue"], rec_prev["revenue"])
        rec_growth = calc_growth(rec_curr["receivables"], rec_prev["receivables"])
        diff = rec_growth - rev_growth

        if diff > 20:
            anomalies.append({
                "anomaly_type": "A",
                "name": "Receivables vs Revenue",
                "year": y_curr,
                "description": f"Receivables grew {rec_growth:.1f}% vs Revenue {rev_growth:.1f}% (difference of {diff:.1f}%)",
                "risk_points": 15
            })

    # --- Rule B: Profit vs Operating Cash Flow (+20 pts) ---
    for i in range(1, len(years)):
        y_prev, y_curr = years[i - 1], years[i]
        rec_prev = records_by_year[y_prev]
        rec_curr = records_by_year[y_curr]

        profit_growth = calc_growth(rec_curr["net_profit"], rec_prev["net_profit"])
        ocf_growth = calc_growth(rec_curr["operating_cash_flow"], rec_prev["operating_cash_flow"])

        if profit_growth > 0 and ocf_growth < 0:
            anomalies.append({
                "anomaly_type": "B",
                "name": "Profit vs OCF Divergence",
                "year": y_curr,
                "description": f"Net profit grew {profit_growth:.1f}% but operating cash flow declined {abs(ocf_growth):.1f}%",
                "risk_points": 20
            })

    # --- Rule C: Inventory Anomaly (+10 pts) ---
    for i in range(1, len(years)):
        y_prev, y_curr = years[i - 1], years[i]
        rec_prev = records_by_year[y_prev]
        rec_curr = records_by_year[y_curr]

        rev_growth = calc_growth(rec_curr["revenue"], rec_prev["revenue"])
        inv_growth = calc_growth(rec_curr["inventory"], rec_prev["inventory"])
        diff = inv_growth - rev_growth

        if diff > 25:
            anomalies.append({
                "anomaly_type": "C",
                "name": "Inventory Anomaly",
                "year": y_curr,
                "description": f"Inventory grew {inv_growth:.1f}% vs Revenue {rev_growth:.1f}% (difference of {diff:.1f}%)",
                "risk_points": 10
            })

    # --- Rule D: Margin Anomalies (+8 pts) ---
    # Current net margin vs Historical average (years 1 to n-1)
    if len(years) >= 2:
        hist_margins = []
        for y in years[:-1]:
            nm = ratios_by_year.get(y, {}).get("net_margin")
            if nm is not None:
                hist_margins.append(nm * 100.0)

        latest_year = years[-1]
        latest_nm = ratios_by_year.get(latest_year, {}).get("net_margin")

        if hist_margins and latest_nm is not None:
            hist_avg = sum(hist_margins) / len(hist_margins)
            current_pct = latest_nm * 100.0
            if current_pct > (hist_avg + 5.0):
                anomalies.append({
                    "anomaly_type": "D",
                    "name": "Margin Spike Anomaly",
                    "year": latest_year,
                    "description": f"Net margin jumped from historical average of {hist_avg:.1f}% to {current_pct:.1f}%",
                    "risk_points": 8
                })

    # --- Rule E: Related-Party Transactions (+12 pts) ---
    for i in range(1, len(years)):
        y_prev, y_curr = years[i - 1], years[i]
        rpt_prev = records_by_year[y_prev].get("related_party_transactions", 0.0)
        rpt_curr = records_by_year[y_curr].get("related_party_transactions", 0.0)

        if rpt_prev > 0:
            rpt_growth = calc_growth(rpt_curr, rpt_prev)
            if rpt_growth > 50:
                anomalies.append({
                    "anomaly_type": "E",
                    "name": "Related-Party Transactions",
                    "year": y_curr,
                    "description": f"Related-party transactions grew {rpt_growth:.1f}% YoY",
                    "risk_points": 12
                })
        elif rpt_curr > 0 and rpt_prev == 0:
            # Appeared newly with substantial volume
            rev_curr = records_by_year[y_curr]["revenue"]
            if rev_curr > 0 and (rpt_curr / rev_curr) > 0.03:
                anomalies.append({
                    "anomaly_type": "E",
                    "name": "Related-Party Transactions",
                    "year": y_curr,
                    "description": f"Related-party transactions jumped to {rpt_curr} ({round(rpt_curr/rev_curr*100, 1)}% of revenue) from zero",
                    "risk_points": 12
                })

    # --- Rule F: Depreciation vs Capex (+10 pts) ---
    for i in range(1, len(years)):
        y_prev, y_curr = years[i - 1], years[i]
        rec_prev = records_by_year[y_prev]
        rec_curr = records_by_year[y_curr]

        capex_growth = calc_growth(rec_curr["capex"], rec_prev["capex"])
        dep_growth = calc_growth(rec_curr["depreciation"], rec_prev["depreciation"])

        if capex_growth > 30 and dep_growth < 5:
            anomalies.append({
                "anomaly_type": "F",
                "name": "Depreciation vs Capex",
                "year": y_curr,
                "description": f"Capex grew {capex_growth:.1f}% but depreciation only grew {dep_growth:.1f}%",
                "risk_points": 10
            })

    # --- Rule G: Debt & Interest Anomalies (+5 pts) ---
    for i in range(1, len(years)):
        y_prev, y_curr = years[i - 1], years[i]
        rec_prev = records_by_year[y_prev]
        rec_curr = records_by_year[y_curr]

        debt_growth = calc_growth(rec_curr["total_debt"], rec_prev["total_debt"])
        int_prev = rec_prev.get("interest_expense", 0.0)
        int_curr = rec_curr.get("interest_expense", 0.0)
        int_growth = calc_growth(int_curr, int_prev) if int_prev > 0 else 0.0

        if debt_growth > 30 and int_growth < 10:
            anomalies.append({
                "anomaly_type": "G",
                "name": "Debt & Interest Divergence",
                "year": y_curr,
                "description": f"Debt grew {debt_growth:.1f}% but interest expense only grew {int_growth:.1f}%",
                "risk_points": 5
            })

    return anomalies
