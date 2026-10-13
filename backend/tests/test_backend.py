import os
import sys

# Ensure backend path is loaded
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.database import init_db
from app.main import app

def test_full_pipeline():
    init_db()
    client = TestClient(app)

    # 1. Health check
    res = client.get("/health")
    assert res.status_code == 200
    print("[OK] Health check OK:", res.json())

    # 2. Upload CSV
    csv_path = os.path.join(backend_dir, "..", "sample_data", "sample_financial_data.csv")
    with open(csv_path, "rb") as f:
        res = client.post(
            "/api/v1/upload",
            files={"file": ("sample_financial_data.csv", f, "text/csv")},
            data={"company_name": "Example Industries Ltd."}
        )
    assert res.status_code == 200, res.text
    upload_res = res.json()
    print("[OK] Upload OK:", upload_res)
    company_id = upload_res["company_id"]

    # 3. Companies list
    res = client.get("/api/v1/companies")
    assert res.status_code == 200
    companies = res.json()
    print(f"[OK] Companies list OK ({len(companies)} companies registered)")

    # 4. Analyze endpoint
    res = client.get(f"/api/v1/analyze/{company_id}")
    assert res.status_code == 200
    data = res.json()
    print(f"[OK] Analysis OK for {data['company_name']}")
    print(f"  Risk Score: {data['risk_score']} / 100")
    print(f"  Risk Level: {data['risk_level']} (3-Tier Mode: Low, Moderate, High)")
    print(f"  Anomalies detected: {len(data['anomalies'])}")
    for a in data["anomalies"]:
        print(f"    - [{a['anomaly_type']}] {a['name']} ({a['year']}): {a['description']} (+{a['risk_points']} pts)")
    print(f"  Ratios calculated: {len(data['ratios'])}")
    print(f"  Explanations generated: {len(data['explanations'])}")
    if data["explanations"]:
        first = data["explanations"][0]
        print(f"  Sample Explanation: {first['why_it_matters'][:80]}...")

if __name__ == "__main__":
    test_full_pipeline()
