import os
import sys

# Ensure backend path is loaded
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.database import engine, SessionLocal, init_db
from app.models import Company, FinancialData, Ratio, Anomaly, RiskScore, Explanation
from app.services.ai_explanation import generate_explanation, FALLBACK_TEMPLATES
from app.main import app

def run_phase_4_validation():
    print("==================================================================")
    print("      PHASE 4: AI EXPLANATION ENGINE & REST API VERIFICATION      ")
    print("==================================================================")

    init_db()
    client = TestClient(app)

    # -------------------------------------------------------------
    # 1. AI EXPLANATION ENGINE UNIT TESTS (RULES A - G)
    # -------------------------------------------------------------
    print("\n[STEP 1] Testing AI Explanation Engine Across All 7 Anomaly Types:")
    test_cases = [
        ("A", "Receivables vs Revenue", "Receivables grew 45.2% vs Revenue 11.5% (gap: +33.7%)", 15),
        ("B", "Profit vs OCF Divergence", "Net profit grew 48.6% but operating cash flow declined 18.8%", 20),
        ("C", "Inventory Anomaly", "Inventory grew 44.7% vs Revenue 11.5% (gap: +33.1%)", 10),
        ("D", "Margin Spike Anomaly", "Net margin jumped from historical avg of 11.6% to 17.9%", 8),
        ("E", "Related-Party Transactions", "Related-party transactions grew 82.7% YoY", 12),
        ("F", "Depreciation vs Capex", "Capex grew 36.0% but depreciation only grew 3.7%", 10),
        ("G", "Debt & Interest Divergence", "Debt grew 32.6% but interest expense only grew 8.7%", 5),
    ]

    for rule_code, name, desc, pts in test_cases:
        res = generate_explanation(
            anomaly_type=rule_code,
            name=name,
            description=desc,
            year=2025,
            company_name="Apex Global Holdings Ltd.",
            risk_points=pts
        )
        assert "detected" in res and len(res["detected"]) > 10, f"Missing detected for rule {rule_code}"
        assert "why_it_matters" in res and len(res["why_it_matters"]) > 20, f"Missing why_it_matters for rule {rule_code}"
        assert "recommended_investigation" in res and len(res["recommended_investigation"]) > 20, f"Missing recommended for rule {rule_code}"
        # Ensure non-defamatory / non-conclusive phrasing
        lower_why = res["why_it_matters"].lower()
        assert "committed fraud" not in lower_why and "guilty of fraud" not in lower_why, "Unacceptable conclusive claim in explanation"
        print(f"  [PASS] Rule [{rule_code}] {name}: 3-part structured explanation validated.")

    # -------------------------------------------------------------
    # 2. REST API ENDPOINTS VALIDATION
    # -------------------------------------------------------------
    print("\n[STEP 2] Testing Full REST API Endpoints via HTTP TestClient:")

    # Endpoint 1: GET /health
    res_health = client.get("/health")
    assert res_health.status_code == 200
    print("  [PASS] GET /health -> Status 200 OK:", res_health.json())

    # Endpoint 2: POST /api/v1/upload (10-row dataset)
    xlsx_path = os.path.join(backend_dir, "..", "sample_data", "sample_financial_data.xlsx")
    with open(xlsx_path, "rb") as f:
        res_upload = client.post(
            "/api/v1/upload",
            files={"file": ("sample_financial_data.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"company_name": "Apex Global Holdings Ltd."}
        )
    assert res_upload.status_code == 200, f"Upload failed: {res_upload.text}"
    upload_data = res_upload.json()
    company_id = upload_data["company_id"]
    print(f"  [PASS] POST /api/v1/upload -> Status 200 OK (Company ID: {company_id}, Years: {upload_data['years_found']})")

    # Endpoint 3: GET /api/v1/companies
    res_comps = client.get("/api/v1/companies")
    assert res_comps.status_code == 200
    companies_list = res_comps.json()
    assert len(companies_list) > 0
    target_comp = next((c for c in companies_list if c["id"] == company_id), None)
    assert target_comp is not None
    print(f"  [PASS] GET /api/v1/companies -> Status 200 OK ({len(companies_list)} companies listed, Target Score: {target_comp['risk_score']}, Level: {target_comp['risk_level']})")

    # Endpoint 4: GET /api/v1/company/{id}
    res_detail = client.get(f"/api/v1/company/{company_id}")
    assert res_detail.status_code == 200
    detail_data = res_detail.json()
    assert len(detail_data["financial_data"]) == 10
    assert len(detail_data["ratios"]) == 10
    print(f"  [PASS] GET /api/v1/company/{company_id} -> Status 200 OK (10 financial rows, 10 ratio rows)")

    # Endpoint 5: GET /api/v1/anomalies/{id}
    res_anoms = client.get(f"/api/v1/anomalies/{company_id}")
    assert res_anoms.status_code == 200
    anoms_list = res_anoms.json()
    assert len(anoms_list) > 0
    print(f"  [PASS] GET /api/v1/anomalies/{company_id} -> Status 200 OK ({len(anoms_list)} anomalies retrieved)")

    # Endpoint 6: GET /api/v1/explanations/{id}
    res_expls = client.get(f"/api/v1/explanations/{company_id}")
    assert res_expls.status_code == 200
    expls_list = res_expls.json()
    assert len(expls_list) == len(anoms_list), f"Expected {len(anoms_list)} explanations, got {len(expls_list)}"
    print(f"  [PASS] GET /api/v1/explanations/{company_id} -> Status 200 OK ({len(expls_list)} AI explanations linked)")

    # Endpoint 7: GET /api/v1/analyze/{id}
    res_analyze = client.get(f"/api/v1/analyze/{company_id}")
    assert res_analyze.status_code == 200
    analyze_data = res_analyze.json()
    assert analyze_data["risk_score"] == 100
    assert analyze_data["risk_level"] == "High"
    print(f"  [PASS] GET /api/v1/analyze/{company_id} -> Status 200 OK (Score: {analyze_data['risk_score']}/100, Level: {analyze_data['risk_level']})")

    # Endpoint 8: DELETE /api/v1/company/{id} (Test on temporary company)
    # Upload temporary company to delete
    with open(xlsx_path, "rb") as f:
        res_temp = client.post(
            "/api/v1/upload",
            files={"file": ("sample_financial_data.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"company_name": "Temporary Test Corp"}
        )
    temp_id = res_temp.json()["company_id"]
    res_del = client.delete(f"/api/v1/company/{temp_id}")
    assert res_del.status_code == 200
    res_verify_del = client.get(f"/api/v1/company/{temp_id}")
    assert res_verify_del.status_code == 404
    print(f"  [PASS] DELETE /api/v1/company/{temp_id} -> Status 200 OK (Cascade deletion verified, subsequent GET returns 404)")

    # -------------------------------------------------------------
    # 3. SQLITE DATABASE PERSISTENCE VERIFICATION
    # -------------------------------------------------------------
    print("\n[STEP 3] SQLite Database Explanations Table Persistence:")
    db = SessionLocal()
    db_expls = db.query(Explanation).filter(Explanation.company_id == company_id).all()
    print(f"  [PASS] Persisted Explanations Count in SQLite: {len(db_expls)}")
    assert len(db_expls) == len(anoms_list)
    db.close()

    # -------------------------------------------------------------
    # 4. SAMPLE AI EXPLANATION CARDS (STRUCTURED DISPLAY)
    # -------------------------------------------------------------
    print("\n[STEP 4] Representative AI Explanation Cards Generated:")
    sample_expls_to_show = expls_list[:3]
    for i, exp in enumerate(sample_expls_to_show, 1):
        print(f"\n--- AI Explanation Card #{i} ---")
        print(f"DETECTED ANOMALY:")
        print(f"  {exp['detected']}")
        print(f"WHY IT MATTERS:")
        print(f"  {exp['why_it_matters']}")
        print(f"RECOMMENDED INVESTIGATION:")
        for line in exp['recommended_investigation'].split('\n'):
            if line.strip():
                print(f"  {line.strip()}")

    print("\n==================================================================")
    print(">>> PHASE 4 AI ENGINE & REST API COMPLETED WITH 100% SUCCESS <<<")
    print("==================================================================")

if __name__ == "__main__":
    run_phase_4_validation()
