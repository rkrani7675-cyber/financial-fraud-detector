import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

import requests

def test_full_auth_lifecycle():
    print("==================================================================")
    print("   END-TO-END AUTHENTICATION, ROUTE PROTECTION & DASHBOARD TEST   ")
    print("==================================================================")

    backend_url = "http://127.0.0.1:8000/api/v1"
    frontend_url = "http://127.0.0.1:3000"

    session = requests.Session()

    test_user_payload = {
        "name": "Forensic Partner Alex Vance",
        "email": "alex.vance@forensic-investigations.com",
        "password": "SecureInvestigatorPassword2026!",
        "confirm_password": "SecureInvestigatorPassword2026!"
    }

    # 1. Cleanup user if exists from prior runs
    from app.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    existing = db.query(User).filter(User.email == test_user_payload["email"]).first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    # 2. Test Signup
    print("\n[STEP 1] Testing User Signup Endpoint (POST /api/v1/auth/signup):")
    res_signup = session.post(f"{backend_url}/auth/signup", json=test_user_payload)
    assert res_signup.status_code == 201, f"Signup failed: {res_signup.text}"
    signup_data = res_signup.json()
    assert signup_data["success"] is True
    user_id = signup_data["user"]["id"]
    print(f"  [PASS] User created: ID {user_id}, Name: {signup_data['user']['name']}")
    assert "ffd_token" in session.cookies, "httpOnly cookie 'ffd_token' was not set by server!"
    token_val = session.cookies["ffd_token"]
    print(f"  [PASS] Set-Cookie: ffd_token received in session (length: {len(token_val)}).")

    # 3. Test /auth/me
    print("\n[STEP 2] Testing Authenticated Session (/api/v1/auth/me):")
    res_me = session.get(f"{backend_url}/auth/me")
    assert res_me.status_code == 200, f"Me query failed: {res_me.text}"
    me_data = res_me.json()
    assert me_data["id"] == user_id
    assert me_data["email"] == test_user_payload["email"]
    print(f"  [PASS] Verified identity via httpOnly cookie: {me_data['name']} ({me_data['email']})")

    # 4. Test Frontend Route Protection
    print("\n[STEP 3] Testing Next.js Route Protection with and without Cookie:")
    # 4a. Without cookie -> Redirects to /login
    anon_res = requests.get(f"{frontend_url}/upload", allow_redirects=False)
    assert anon_res.status_code == 307
    assert "/login?redirect=" in anon_res.headers.get("Location", "")
    print(f"  [PASS] Unauthenticated access to /upload redirected to: {anon_res.headers.get('Location')}")

    # 4b. With cookie -> Access granted (200 OK)
    auth_res = requests.get(f"{frontend_url}/upload", cookies={"ffd_token": token_val}, allow_redirects=False)
    assert auth_res.status_code == 200
    print(f"  [PASS] Authenticated access to /upload accepted with HTTP 200 OK.")

    auth_comp_res = requests.get(f"{frontend_url}/companies", cookies={"ffd_token": token_val}, allow_redirects=False)
    assert auth_comp_res.status_code == 200
    print(f"  [PASS] Authenticated access to /companies accepted with HTTP 200 OK.")

    # 5. Test Authenticated Upload linking to user_id
    print("\n[STEP 4] Uploading Financial Statements as Authenticated User:")
    sample_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "sample_data", "sample_financial_data.xlsx"))
    with open(sample_file_path, "rb") as f:
        res_upload = session.post(
            f"{backend_url}/upload",
            files={"file": ("sample_financial_data.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"company_name": "Vance Forensic Verified Corp"}
        )
    assert res_upload.status_code == 200, f"Upload failed: {res_upload.text}"
    upload_data = res_upload.json()
    company_id = upload_data["company_id"]
    print(f"  [PASS] Upload processed: Company ID {company_id}, Name: '{upload_data['company_name']}'")

    # Verify database has user_id foreign key set
    from app.models.company import Company
    db = SessionLocal()
    created_comp = db.query(Company).filter(Company.id == company_id).first()
    assert created_comp is not None
    assert created_comp.user_id == user_id, f"Expected user_id {user_id}, got {created_comp.user_id}"
    db.close()
    print(f"  [PASS] Verified company linked to user_id: {created_comp.user_id} in SQLite 'companies' table.")

    # 6. Verify Full Forensic Analysis Dashboard Data
    print("\n[STEP 5] Verifying Full Analysis Dashboard & Anomaly Data:")
    res_analysis = session.get(f"{backend_url}/analyze/{company_id}")
    assert res_analysis.status_code == 200
    analysis_data = res_analysis.json()
    assert analysis_data["risk_score"] == 100
    assert analysis_data["risk_level"] == "High"
    assert len(analysis_data["anomalies"]) == 21
    assert len(analysis_data["ratios"]) == 10
    assert len(analysis_data["financial_data"]) == 10
    assert len(analysis_data["explanations"]) == 21
    print(f"  [PASS] Dashboard data intact: Score {analysis_data['risk_score']}/100, {len(analysis_data['anomalies'])} Anomalies, {len(analysis_data['ratios'])} Ratios, {len(analysis_data['explanations'])} AI Explanations.")

    # 7. Test Logout Flow
    print("\n[STEP 6] Testing Logout Flow (POST /api/v1/auth/logout):")
    res_logout = session.post(f"{backend_url}/auth/logout")
    assert res_logout.status_code == 200
    print("  [PASS] Logout endpoint cleared session cookie.")

    # Verify /auth/me returns 401 after logout
    res_me_after = session.get(f"{backend_url}/auth/me")
    assert res_me_after.status_code == 401
    print("  [PASS] Subsequent /api/v1/auth/me query rejected with 401 Unauthorized.")

    print("\n==================================================================")
    print(">>> COMPLETE END-TO-END AUTH & PIPELINE VERIFICATION PASSED <<<")
    print("==================================================================")

if __name__ == "__main__":
    test_full_auth_lifecycle()
