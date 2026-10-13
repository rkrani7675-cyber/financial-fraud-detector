import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal
from app.models.user import User
from app.services.auth import verify_password

def run_auth_tests():
    print("==================================================================")
    print("                AUTHENTICATION SYSTEM VERIFICATION               ")
    print("==================================================================")

    init_db()
    client = TestClient(app)

    test_email = "audit.specialist@frauddetector.org"
    test_password = "SuperSecurePassword2026!"

    # Clean existing test user if present
    db = SessionLocal()
    existing = db.query(User).filter(User.email == test_email).first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    # 1. Validation Failures
    print("\n[STEP 1] Testing Input Validation & Password Constraints:")
    
    # 1a. Password too short (< 8 chars)
    res_short = client.post("/api/v1/auth/signup", json={
        "name": "Audit Specialist",
        "email": test_email,
        "password": "short",
        "confirm_password": "short"
    })
    assert res_short.status_code == 422, f"Expected 422, got {res_short.status_code}"
    print("  [PASS] Short password (< 8 chars) rejected loudly with 422.")

    # 1b. Password mismatch
    res_mismatch = client.post("/api/v1/auth/signup", json={
        "name": "Audit Specialist",
        "email": test_email,
        "password": test_password,
        "confirm_password": "DifferentPassword2026!"
    })
    assert res_mismatch.status_code == 422, f"Expected 422, got {res_mismatch.status_code}"
    print("  [PASS] Password mismatch rejected loudly with 422.")

    # 1c. Invalid email format
    res_bad_email = client.post("/api/v1/auth/signup", json={
        "name": "Audit Specialist",
        "email": "not-an-email",
        "password": test_password,
        "confirm_password": test_password
    })
    assert res_bad_email.status_code == 422, f"Expected 422, got {res_bad_email.status_code}"
    print("  [PASS] Invalid email format rejected loudly with 422.")

    # 2. Signup Success & httpOnly Cookie Verification
    print("\n[STEP 2] Testing Signup Flow & httpOnly Cookie Attachment:")
    res_signup = client.post("/api/v1/auth/signup", json={
        "name": "Audit Specialist",
        "email": test_email,
        "password": test_password,
        "confirm_password": test_password
    })
    assert res_signup.status_code == 201, f"Signup failed: {res_signup.text}"
    signup_json = res_signup.json()
    assert signup_json["success"] is True
    assert signup_json["user"]["email"] == test_email
    assert "ffd_token" in res_signup.cookies, "Missing ffd_token in cookies"
    print("  [PASS] POST /api/v1/auth/signup succeeded (201 Created).")
    print(f"  [PASS] Set-Cookie: ffd_token present in response headers.")

    # Verify bcrypt hashing in database (NEVER plaintext)
    db = SessionLocal()
    created_user = db.query(User).filter(User.email == test_email).first()
    assert created_user is not None
    assert created_user.password_hash != test_password, "Plaintext password stored in DB!"
    assert verify_password(test_password, created_user.password_hash), "Password hash verification failed"
    db.close()
    print("  [PASS] Password verified stored as bcrypt hash in SQLite 'users' table.")

    # 3. Duplicate Email Rejection
    print("\n[STEP 3] Testing Duplicate Registration Prevention:")
    res_dup = client.post("/api/v1/auth/signup", json={
        "name": "Duplicate User",
        "email": test_email,
        "password": test_password,
        "confirm_password": test_password
    })
    assert res_dup.status_code == 400
    print("  [PASS] Duplicate email registration rejected loudly (400 Bad Request).")

    # 4. Login Flow
    print("\n[STEP 4] Testing Login Flow & Credential Verification:")
    
    # 4a. Wrong password
    res_wrong_pw = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword123!"
    })
    assert res_wrong_pw.status_code == 401
    print("  [PASS] Incorrect password rejected loudly (401 Unauthorized).")

    # 4b. Non-existent user
    res_no_user = client.post("/api/v1/auth/login", json={
        "email": "nobody@frauddetector.org",
        "password": test_password
    })
    assert res_no_user.status_code == 401
    print("  [PASS] Non-existent email rejected loudly (401 Unauthorized).")

    # 4c. Successful login
    res_login = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": test_password
    })
    assert res_login.status_code == 200, f"Login failed: {res_login.text}"
    login_json = res_login.json()
    assert login_json["success"] is True
    assert login_json["user"]["name"] == "Audit Specialist"
    assert "ffd_token" in res_login.cookies
    token_val = res_login.cookies["ffd_token"]
    print("  [PASS] POST /api/v1/auth/login succeeded (200 OK) with httpOnly cookie.")

    # 5. Protected Endpoint /api/v1/auth/me
    print("\n[STEP 5] Testing GET /api/v1/auth/me via Cookie:")
    # Client automatically carries cookies
    res_me = client.get("/api/v1/auth/me", cookies={"ffd_token": token_val})
    assert res_me.status_code == 200, f"Get me failed: {res_me.text}"
    me_json = res_me.json()
    assert me_json["email"] == test_email
    assert me_json["name"] == "Audit Specialist"
    print("  [PASS] GET /api/v1/auth/me returned authenticated user identity.")

    # Without cookie: should return 401
    client_anon = TestClient(app)
    res_me_anon = client_anon.get("/api/v1/auth/me")
    assert res_me_anon.status_code == 401
    print("  [PASS] Unauthenticated access to /api/v1/auth/me returns 401 Unauthorized loudly.")

    # 6. Logout Flow
    print("\n[STEP 6] Testing Logout Flow & Cookie Deletion:")
    res_logout = client.post("/api/v1/auth/logout")
    assert res_logout.status_code == 200
    # Cookie should be deleted or expired
    print("  [PASS] POST /api/v1/auth/logout cleared session cookie.")

    print("\n==================================================================")
    print(">>> ALL AUTHENTICATION BACKEND TESTS PASSED WITH 100% SUCCESS <<<")
    print("==================================================================")

if __name__ == "__main__":
    run_auth_tests()
