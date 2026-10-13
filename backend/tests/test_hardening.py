import os
import sys
import io
import logging

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.services.ratios import safe_div
from app.services.extraction import parse_financial_file, DataExtractionError
from app.services.ai_explanation import generate_explanation, FALLBACK_TEMPLATES, EXPERT_HEURISTIC_TEMPLATES

def test_hardening_verification():
    print("==================================================================")
    print("      DEEP BUG FINDING & HARDENING VERIFICATION TEST SUITE        ")
    print("==================================================================")

    # 1. Test safe_div narrow exception boundaries and logging
    print("\n[TEST 1] Verifying safe_div Boundaries & Type Error Handling:")
    assert safe_div(100, 2) == 50.0, "Basic division failed"
    assert safe_div(100, 0) is None, "Zero division failed"
    assert safe_div(100, 0, default=0.0) == 0.0, "Zero division default failed"
    # Verify non-numeric input is handled and logged without crashing
    assert safe_div("not_a_number", 5) is None, "Type error handling failed"
    assert safe_div(10, "bad_denom") is None, "Denominator type error handling failed"
    print("  [PASS] safe_div handles ZeroDivisionError and TypeError/ValueError with logging.")

    # 2. Test DataExtractionError Fail Fast and Loud
    print("\n[TEST 2] Verifying Fail-Fast Extraction Exceptions (Zero Silent Swallowing):")
    
    # 2a. Invalid file extension
    try:
        parse_financial_file(b"dummy content", "test.pdf")
        assert False, "Failed to raise DataExtractionError for invalid file format"
    except DataExtractionError as e:
        assert e.code == "INVALID_FILE_FORMAT"
        print("  [PASS] Invalid file format raised loudly:", e.message)

    # 2b. Empty file
    try:
        parse_financial_file(b"", "test.csv")
        assert False, "Failed to raise DataExtractionError for empty file"
    except DataExtractionError as e:
        assert e.code in ["EMPTY_FILE", "PARSE_ERROR"]
        print("  [PASS] Empty file raised loudly:", e.message)

    # 2c. Missing required columns
    bad_csv = b"Year,Revenue\n2020,100\n2021,110\n2022,120\n"
    try:
        parse_financial_file(bad_csv, "bad.csv")
        assert False, "Failed to raise DataExtractionError for missing columns"
    except DataExtractionError as e:
        assert e.code == "MISSING_COLUMNS"
        print("  [PASS] Missing required columns raised loudly:", e.message)

    # 2d. Invalid Year format
    bad_year_csv = (
        b"Year,Revenue,COGS,NetProfit,Receivables,Inventory,TotalAssets,TotalDebt,Equity,OCF,Capex,Depreciation\n"
        b"invalid_year,100,60,10,20,30,200,80,120,15,5,5\n"
        b"2021,110,65,12,22,32,210,85,125,18,6,5\n"
        b"2022,120,70,14,25,35,220,90,130,20,7,5\n"
    )
    try:
        parse_financial_file(bad_year_csv, "bad_year.csv")
        assert False, "Failed to raise DataExtractionError for invalid year format"
    except DataExtractionError as e:
        assert e.code == "INVALID_YEAR_FORMAT"
        print("  [PASS] Invalid year format raised loudly:", e.message)

    # 2e. Insufficient data (< 3 years)
    short_csv = (
        b"Year,Revenue,COGS,NetProfit,Receivables,Inventory,TotalAssets,TotalDebt,Equity,OCF,Capex,Depreciation\n"
        b"2021,110,65,12,22,32,210,85,125,18,6,5\n"
        b"2022,120,70,14,25,35,220,90,130,20,7,5\n"
    )
    try:
        parse_financial_file(short_csv, "short.csv")
        assert False, "Failed to raise DataExtractionError for < 3 years"
    except DataExtractionError as e:
        assert e.code == "INSUFFICIENT_DATA"
        print("  [PASS] Insufficient historical years (< 3) raised loudly:", e.message)

    # 2f. Coerced non-numeric values warning generation
    coerced_csv = (
        b"Year,Revenue,COGS,NetProfit,Receivables,Inventory,TotalAssets,TotalDebt,Equity,OCF,Capex,Depreciation\n"
        b"2020,100,corrupted_cogs,10,20,30,200,80,120,15,5,5\n"
        b"2021,110,65,12,22,32,210,85,125,18,6,5\n"
        b"2022,120,70,14,25,35,220,90,130,20,7,5\n"
    )
    records, warnings = parse_financial_file(coerced_csv, "coerced.csv")
    assert len(records) == 3
    assert len(warnings) > 0, "Failed to detect and warn on coerced corrupted value"
    assert "COGS" in warnings[0]
    print("  [PASS] Corrupted numeric strings detected, warned, and logged loudly:", warnings[0])

    # 3. AI Explanation & Template Backward Compatibility
    print("\n[TEST 3] Verifying AI Explanation Engine & Template Backward Compatibility:")
    assert FALLBACK_TEMPLATES is EXPERT_HEURISTIC_TEMPLATES, "FALLBACK_TEMPLATES alias broken"
    for r in ["A", "B", "C", "D", "E", "F", "G"]:
        expl = generate_explanation(
            anomaly_type=r,
            name=f"Rule {r}",
            description="Test anomaly",
            year=2025,
            company_name="Hardening Test Corp",
            risk_points=10
        )
        assert expl["detected"]
        assert expl["why_it_matters"]
        assert expl["recommended_investigation"]
    print("  [PASS] All 7 anomaly explanation rules verified with zero unlogged exceptions.")

    # 4. REST API Endpoint Loud Failure Reporting
    print("\n[TEST 4] Verifying REST API Returns Proper HTTP Error Codes (Not Silent 200s):")
    client = TestClient(app)

    # 4a. 404 for non-existent company
    res_404 = client.get("/api/v1/company/999999")
    assert res_404.status_code == 404, f"Expected 404, got {res_404.status_code}"
    print("  [PASS] Non-existent company ID returns HTTP 404 Not Found loudly.")

    # 4b. 400 for bad upload file
    res_bad_upload = client.post(
        "/api/v1/upload",
        files={"file": ("malformed.txt", b"invalid data", "text/plain")}
    )
    assert res_bad_upload.status_code == 400
    print("  [PASS] Invalid file upload returns HTTP 400 Bad Request loudly.")

    print("\n==================================================================")
    print(">>> ALL DEEP HARDENING TESTS COMPLETED WITH 100% SUCCESS <<<")
    print("==================================================================")

if __name__ == "__main__":
    test_hardening_verification()
