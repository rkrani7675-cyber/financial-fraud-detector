from typing import List, Dict, Any, Tuple

def calculate_risk_score(anomalies: List[Dict[str, Any]]) -> Tuple[int, str]:
    """
    Calculate Financial Risk Score (0-100) and assign 1 of 3 Risk Levels.
    Levels:
      0 - 30:  Low
      31 - 60: Moderate
      61 - 100: High
    """
    total_points = sum(item.get("risk_points", 0) for item in anomalies)
    capped_score = min(total_points, 100)

    if capped_score <= 30:
        level = "Low"
    elif capped_score <= 60:
        level = "Moderate"
    else:
        level = "High"

    return capped_score, level
