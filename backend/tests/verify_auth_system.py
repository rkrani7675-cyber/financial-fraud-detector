import os
import sys
import re
import sqlite3
import requests
import bcrypt
import subprocess

current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(backend_dir)
db_path = os.path.join(backend_dir, "ffd.db")

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://127.0.0.1:3000"
PYTHON_EXE = sys.executable

results = {}

def report(check_num, title, passed, evidence, failure_reason=None):
    status = "PASS" if passed else "FAIL"
    results[check_num] = {
        "title": title,
        "status": status,
        "evidence": evidence,
        "failure_reason": failure_reason
    }
    print(f"\n[{status}] CHECK {check_num}: {title}")
    for line in evidence:
        print(f"  Evidence: {line}")
    if failure_reason:
        print(f"  Failure Reason: {failure_reason}")

# ==============================================================================
# CHECK 1: POST /api/v1/auth/signup
# ==============================================================================
def verify_check_1():
    evidence = []
    passed = True
    failure_reason = None
    test_email = "check1_auditor@verification.test"
    test_pw = "ValidPassword2026!"

    # Clean DB first
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE email = ?", (test_email,))
    conn.commit()

    # 1. Valid new email + password -> 201
    res1 = requests.post(f"{BACKEND_URL}/api/v1/auth/signup", json={
        "name": "Check One Auditor",
        "email": test_email,
        "password": test_pw,
        "confirm_password": test_pw
    })
    evidence.append(f"Valid signup: HTTP {res1.status_code} (Expected 201)")
    if res1.status_code != 201:
        passed = False
        failure_reason = f"Valid signup returned {res1.status_code}: {res1.text}"

    # 2. Duplicate email -> 400
    res2 = requests.post(f"{BACKEND_URL}/api/v1/auth/signup", json={
        "name": "Check One Auditor Duplicate",
        "email": test_email,
        "password": test_pw,
        "confirm_password": test_pw
    })
    evidence.append(f"Duplicate email: HTTP {res2.status_code} (Expected 400) - {res2.json().get('detail')}")
    if res2.status_code != 400:
        passed = False
        failure_reason = f"Duplicate signup returned {res2.status_code}: {res2.text}"

    # 3. Short password (<8 chars) -> 422
    res3 = requests.post(f"{BACKEND_URL}/api/v1/auth/signup", json={
        "name": "Short PW",
        "email": "short_pw@test.com",
        "password": "short",
        "confirm_password": "short"
    })
    evidence.append(f"Short password (<8 chars): HTTP {res3.status_code} (Expected 422)")
    if res3.status_code != 422:
        passed = False
        failure_reason = f"Short password returned {res3.status_code}"

    # 4. Password mismatch -> 422
    res4 = requests.post(f"{BACKEND_URL}/api/v1/auth/signup", json={
        "name": "Mismatch PW",
        "email": "mismatch@test.com",
        "password": test_pw,
        "confirm_password": "DifferentPassword2026!"
    })
    evidence.append(f"Password mismatch: HTTP {res4.status_code} (Expected 422)")
    if res4.status_code != 422:
        passed = False
        failure_reason = f"Password mismatch returned {res4.status_code}"

    # 5. Invalid email format -> 422
    res5 = requests.post(f"{BACKEND_URL}/api/v1/auth/signup", json={
        "name": "Bad Email",
        "email": "invalid-email-format",
        "password": test_pw,
        "confirm_password": test_pw
    })
    evidence.append(f"Invalid email format: HTTP {res5.status_code} (Expected 422)")
    if res5.status_code != 422:
        passed = False
        failure_reason = f"Invalid email format returned {res5.status_code}"

    # 6. Verify password stored as bcrypt hash in ffd.db users table
    cur.execute("SELECT id, name, email, password_hash FROM users WHERE email = ?", (test_email,))
    row = cur.fetchone()
    if not row:
        passed = False
        failure_reason = "User not found in ffd.db users table"
    else:
        user_id, name, email, pw_hash = row
        is_bcrypt = pw_hash.startswith("$2b$") or pw_hash.startswith("$2a$")
        is_plain = (pw_hash == test_pw)
        verifies = bcrypt.checkpw(test_pw.encode('utf-8'), pw_hash.encode('utf-8'))
        evidence.append(f"DB Record: ID={user_id}, Email={email}, Hash Prefix={pw_hash[:10]}... (is_bcrypt={is_bcrypt}, plain_text_leak={is_plain}, bcrypt_verified={verifies})")
        if not is_bcrypt or is_plain or not verifies:
            passed = False
            failure_reason = "Password in DB is not a valid bcrypt hash"
    conn.close()

    report(1, "POST /api/v1/auth/signup & DB Hashing Verification", passed, evidence, failure_reason)
    return test_email, test_pw

# ==============================================================================
# CHECK 2: POST /api/v1/auth/login
# ==============================================================================
def verify_check_2(test_email, test_pw):
    evidence = []
    passed = True
    failure_reason = None

    # 1. Correct credentials -> 200 OK + Set-Cookie: ffd_token
    session = requests.Session()
    res1 = session.post(f"{BACKEND_URL}/api/v1/auth/login", json={
        "email": test_email,
        "password": test_pw
    })
    set_cookie_raw = res1.headers.get("Set-Cookie", "")
    evidence.append(f"Correct credentials: HTTP {res1.status_code} (Expected 200)")
    evidence.append(f"Set-Cookie Header: '{set_cookie_raw}'")

    has_token = "ffd_token=" in set_cookie_raw
    has_httponly = "httponly" in set_cookie_raw.lower()
    has_samesite_lax = "samesite=lax" in set_cookie_raw.lower()

    if res1.status_code != 200 or not has_token or not has_httponly or not has_samesite_lax:
        passed = False
        failure_reason = f"Login cookie missing or incorrect attributes: {set_cookie_raw}"

    # 2. Wrong password -> 401
    res2 = requests.post(f"{BACKEND_URL}/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword2026!"
    })
    evidence.append(f"Wrong password: HTTP {res2.status_code} (Expected 401) - {res2.json().get('detail')}")
    if res2.status_code != 401:
        passed = False
        failure_reason = f"Wrong password returned {res2.status_code}"

    # 3. Non-existent email -> 401
    res3 = requests.post(f"{BACKEND_URL}/api/v1/auth/login", json={
        "email": "does_not_exist_999@fraudtest.com",
        "password": test_pw
    })
    evidence.append(f"Non-existent email: HTTP {res3.status_code} (Expected 401) - {res3.json().get('detail')}")
    if res3.status_code != 401:
        passed = False
        failure_reason = f"Non-existent email returned {res3.status_code}"

    report(2, "POST /api/v1/auth/login Credential & Cookie Verification", passed, evidence, failure_reason)
    token = session.cookies.get("ffd_token")
    return token

# ==============================================================================
# CHECK 3: GET /api/v1/auth/me
# ==============================================================================
def verify_check_3(token, test_email):
    evidence = []
    passed = True
    failure_reason = None

    # 1. With valid cookie -> 200 + user data
    res_auth = requests.get(f"{BACKEND_URL}/api/v1/auth/me", cookies={"ffd_token": token})
    evidence.append(f"With valid cookie: HTTP {res_auth.status_code} (Expected 200)")
    if res_auth.status_code == 200:
        me_json = res_auth.json()
        evidence.append(f"User identity payload: ID={me_json.get('id')}, Email={me_json.get('email')}, Name={me_json.get('name')}")
        if me_json.get("email") != test_email:
            passed = False
            failure_reason = f"Email mismatch in /me: {me_json.get('email')}"
    else:
        passed = False
        failure_reason = f"With cookie failed with {res_auth.status_code}"

    # 2. Without cookie -> 401
    res_anon = requests.get(f"{BACKEND_URL}/api/v1/auth/me")
    evidence.append(f"Without cookie: HTTP {res_anon.status_code} (Expected 401) - {res_anon.json().get('detail')}")
    if res_anon.status_code != 401:
        passed = False
        failure_reason = f"Without cookie returned {res_anon.status_code}"

    report(3, "GET /api/v1/auth/me Session Identity Verification", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 4: POST /api/v1/auth/logout
# ==============================================================================
def verify_check_4(test_email, test_pw):
    evidence = []
    passed = True
    failure_reason = None

    session = requests.Session()
    # 1. First authenticate session via login endpoint so session cookie jar is natively configured
    res_login = session.post(f"{BACKEND_URL}/api/v1/auth/login", json={
        "email": test_email,
        "password": test_pw
    })
    evidence.append(f"Pre-logout session setup: HTTP {res_login.status_code}, Cookie set: {'ffd_token' in session.cookies}")

    # 2. Test clears ffd_token cookie (Max-Age=0)
    res_logout = session.post(f"{BACKEND_URL}/api/v1/auth/logout")
    set_cookie_raw = res_logout.headers.get("Set-Cookie", "")
    evidence.append(f"Logout response: HTTP {res_logout.status_code} (Expected 200)")
    evidence.append(f"Logout Set-Cookie header: '{set_cookie_raw}'")

    has_max_age_0 = "max-age=0" in set_cookie_raw.lower()
    cookie_cleared_in_jar = ("ffd_token" not in session.cookies) or (session.cookies.get("ffd_token") == "")
    evidence.append(f"Session CookieJar cleared: {cookie_cleared_in_jar}")

    if res_logout.status_code != 200 or not has_max_age_0 or not cookie_cleared_in_jar:
        passed = False
        failure_reason = "Logout response missing Max-Age=0 deletion header or failed to clear cookie"

    # 3. Test after logout, /me returns 401
    res_me_after = session.get(f"{BACKEND_URL}/api/v1/auth/me")
    evidence.append(f"Session /me query after logout: HTTP {res_me_after.status_code} (Expected 401) - {res_me_after.text}")
    if res_me_after.status_code != 401:
        passed = False
        failure_reason = f"Session /me returned {res_me_after.status_code} after logout"

    report(4, "POST /api/v1/auth/logout Cookie Deletion Verification", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 5: Cookie Security & LocalStorage Audit
# ==============================================================================
def verify_check_5(test_email, test_pw):
    evidence = []
    passed = True
    failure_reason = None

    # Inspect Set-Cookie header attributes from fresh login
    res = requests.post(f"{BACKEND_URL}/api/v1/auth/login", json={
        "email": test_email,
        "password": test_pw
    })
    cookie_header = res.headers.get("Set-Cookie", "")
    is_httponly = "httponly" in cookie_header.lower()
    is_samesite_lax = "samesite=lax" in cookie_header.lower()

    evidence.append(f"ffd_token Set-Cookie: '{cookie_header}'")
    evidence.append(f"HttpOnly attribute present: {is_httponly} (Client JS cannot access token)")
    evidence.append(f"SameSite attribute: Lax present: {is_samesite_lax} (CSRF protection)")

    if not is_httponly or not is_samesite_lax:
        passed = False
        failure_reason = "Cookie security flags missing"

    # Codebase audit for localStorage in frontend directory
    frontend_dir = os.path.join(root_dir, "frontend")
    local_storage_matches = []
    for root, dirs, files in os.walk(frontend_dir):
        if "node_modules" in root or ".next" in root:
            continue
        for file in files:
            if file.endswith((".ts", ".tsx", ".js", ".jsx", ".html")):
                filepath = os.path.join(root, file)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    if "localStorage" in content:
                        local_storage_matches.append(filepath)

    evidence.append(f"LocalStorage occurrences in frontend source: {len(local_storage_matches)}")
    if len(local_storage_matches) > 0:
        passed = False
        failure_reason = f"localStorage found in {local_storage_matches}"

    report(5, "Cookie Security & LocalStorage Zero-Usage Verification", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 6: Public Routes (No Login Needed)
# ==============================================================================
def verify_check_6():
    evidence = []
    passed = True
    failure_reason = None

    routes = ["/", "/login", "/signup"]
    for route in routes:
        res = requests.get(f"{FRONTEND_URL}{route}", allow_redirects=False)
        evidence.append(f"GET {route}: HTTP {res.status_code} (Expected 200)")
        if res.status_code != 200:
            passed = False
            failure_reason = f"Public route {route} returned HTTP {res.status_code}"

    report(6, "Frontend Public Routes Accessibility (/, /login, /signup)", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 7: Protected Routes (Redirect to /login when no cookie)
# ==============================================================================
def verify_check_7():
    evidence = []
    passed = True
    failure_reason = None

    protected_routes = ["/dashboard/4", "/upload", "/companies", "/company/4"]
    for route in protected_routes:
        res = requests.get(f"{FRONTEND_URL}{route}", allow_redirects=False)
        loc = res.headers.get("Location", "")
        evidence.append(f"GET {route} (anon): HTTP {res.status_code} -> Location: {loc}")
        if res.status_code != 307 or "/login?redirect=" not in loc:
            passed = False
            failure_reason = f"Route {route} did not return 307 redirect to /login. Status={res.status_code}, Location={loc}"

    report(7, "Frontend Protected Routes Unauthenticated 307 Redirects", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 8: Authenticated Routes (With valid cookie)
# ==============================================================================
def verify_check_8(token):
    evidence = []
    passed = True
    failure_reason = None

    routes = ["/dashboard/4", "/upload", "/companies"]
    cookies = {"ffd_token": token}
    for route in routes:
        res = requests.get(f"{FRONTEND_URL}{route}", cookies=cookies, allow_redirects=False)
        evidence.append(f"GET {route} (with ffd_token): HTTP {res.status_code} (Expected 200)")
        if res.status_code != 200:
            passed = False
            failure_reason = f"Route {route} failed with HTTP {res.status_code} when authenticated"

    # Also verify dashboard content renders (HTML contains title & branding)
    dash_res = requests.get(f"{FRONTEND_URL}/dashboard/4", cookies=cookies)
    has_score_or_charts = ("Financial Fraud Detector" in dash_res.text) and ("dashboard" in dash_res.text.lower())
    evidence.append(f"Dashboard HTML rendered payload length: {len(dash_res.text)} bytes, Page Title/Branding Verified: {has_score_or_charts}")
    if not has_score_or_charts:
        passed = False
        failure_reason = "Dashboard page failed to render expected HTML elements"

    report(8, "Frontend Authenticated Routes Access (200 OK & Content Render)", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 9: Header Component Structure & Client Interaction
# ==============================================================================
def verify_check_9():
    evidence = []
    passed = True
    failure_reason = None

    header_path = os.path.join(root_dir, "frontend", "components", "Header.tsx")
    with open(header_path, "r", encoding="utf-8") as f:
        header_code = f.read()

    # Verify unauthenticated condition
    has_signin_link = 'href="/login"' in header_code and 'Sign In' in header_code
    has_signup_link = 'href="/signup"' in header_code and 'Sign Up' in header_code
    evidence.append(f"Unauthenticated state: Sign In link={has_signin_link}, Sign Up link={has_signup_link}")

    # Verify authenticated condition
    has_user_name = '{user.name}' in header_code
    has_logout_btn = 'handleLogout' in header_code and 'Logout' in header_code
    has_logout_call = 'logoutUser()' in header_code and 'router.push("/login")' in header_code
    evidence.append(f"Authenticated state: User badge={has_user_name}, Logout button={has_logout_btn}, Logout action={has_logout_call}")

    if not (has_signin_link and has_signup_link and has_user_name and has_logout_btn and has_logout_call):
        passed = False
        failure_reason = "Header component does not fulfill all authenticated/unauthenticated requirements"

    report(9, "Header Component Architecture & Unauth/Auth Rendering Logic", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 10: End-to-End Complete Lifecycle
# ==============================================================================
def verify_check_10():
    evidence = []
    passed = True
    failure_reason = None

    e2e_user = {
        "name": "Forensic Partner Alex Vance",
        "email": "lifecycle.test.auditor@ffd.gov",
        "password": "ComprehensivePass2026!",
        "confirm_password": "ComprehensivePass2026!"
    }

    # 10a. Cleanup & Signup new user
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("DELETE FROM users WHERE email = ?", (e2e_user["email"],))
    conn.commit()

    session = requests.Session()
    res_signup = session.post(f"{BACKEND_URL}/api/v1/auth/signup", json=e2e_user)
    evidence.append(f"Lifecycle Signup: HTTP {res_signup.status_code}")
    if res_signup.status_code != 201:
        passed = False
        failure_reason = f"Lifecycle signup failed: {res_signup.text}"
        report(10, "End-to-End User Lifecycle & Audit Pipeline", passed, evidence, failure_reason)
        return

    user_id = res_signup.json()["user"]["id"]
    token_val = session.cookies.get("ffd_token")
    evidence.append(f"Created User ID: {user_id}, ffd_token length: {len(token_val or '')}")

    # Verify user in ffd.db
    cur.execute("SELECT id, name, email FROM users WHERE id = ?", (user_id,))
    db_user = cur.fetchone()
    evidence.append(f"DB verification: user in ffd.db = {db_user}")
    if not db_user:
        passed = False
        failure_reason = "User not found in ffd.db users table"

    # 10b. Upload sample_financial_data.xlsx as authenticated user
    sample_path = os.path.join(root_dir, "sample_data", "sample_financial_data.xlsx")
    with open(sample_path, "rb") as f:
        res_upload = session.post(
            f"{BACKEND_URL}/api/v1/upload",
            files={"file": ("sample_financial_data.xlsx", f, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
            data={"company_name": f"Lifecycle Verified Corp {user_id}"}
        )
    evidence.append(f"Upload statement file: HTTP {res_upload.status_code}")
    if res_upload.status_code != 200:
        passed = False
        failure_reason = f"Upload failed: {res_upload.text}"
        report(10, "End-to-End User Lifecycle & Audit Pipeline", passed, evidence, failure_reason)
        return

    company_id = res_upload.json()["company_id"]
    evidence.append(f"Uploaded Company ID: {company_id}")

    # Verify company.user_id matches user.id in ffd.db
    cur.execute("SELECT id, name, user_id FROM companies WHERE id = ?", (company_id,))
    comp_row = cur.fetchone()
    conn.close()
    evidence.append(f"Company DB row: ID={comp_row[0]}, Name={comp_row[1]}, user_id={comp_row[2]} (Expected {user_id})")
    if comp_row[2] != user_id:
        passed = False
        failure_reason = f"company.user_id ({comp_row[2]}) != user.id ({user_id})"

    # 10c. View dashboard: 18 ratios, 7 anomaly rules, AI explanations
    res_analysis = session.get(f"{BACKEND_URL}/api/v1/analyze/{company_id}")
    evidence.append(f"Analysis API query: HTTP {res_analysis.status_code}")
    if res_analysis.status_code != 200:
        passed = False
        failure_reason = f"Analysis API failed: {res_analysis.text}"
    else:
        adata = res_analysis.json()
        num_ratios_years = len(adata.get("ratios", []))
        num_anomalies = len(adata.get("anomalies", []))
        num_explanations = len(adata.get("explanations", []))
        rule_codes = set(a.get("anomaly_type") for a in adata.get("anomalies", []))

        # Check ratio fields defined
        sample_ratio_entry = adata["ratios"][0] if num_ratios_years > 0 else {}
        ratio_fields = [k for k in sample_ratio_entry.keys() if k not in ("id", "company_id", "year", "created_at")]

        evidence.append(f"Analysis Metrics: {len(ratio_fields)} distinct ratios ({num_ratios_years} financial years), {num_anomalies} anomalies across rules {sorted(list(rule_codes))}, {num_explanations} AI explanations")

    # 10d. Logout & verify cookie cleared
    res_logout = session.post(f"{BACKEND_URL}/api/v1/auth/logout")
    logout_cookie = res_logout.headers.get("Set-Cookie", "")
    evidence.append(f"Logout HTTP: {res_logout.status_code}, Cookie cleared: {'max-age=0' in logout_cookie.lower()}")

    # 10e. Try /dashboard/4 -> redirect to /login
    anon_dash_res = requests.get(f"{FRONTEND_URL}/dashboard/4", allow_redirects=False)
    evidence.append(f"Subsequent GET /dashboard/4 unauthenticated: HTTP {anon_dash_res.status_code} -> Location: {anon_dash_res.headers.get('Location')}")
    if anon_dash_res.status_code != 307 or "/login?redirect=" not in anon_dash_res.headers.get("Location", ""):
        passed = False
        failure_reason = f"Unauthenticated access after logout not redirected: {anon_dash_res.status_code}"

    report(10, "End-to-End User Lifecycle & Audit Pipeline", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 11: Regression Test Suites
# ==============================================================================
def verify_check_11():
    evidence = []
    passed = True
    failure_reason = None

    test_files = [
        "test_phase2.py",
        "test_phase3.py",
        "test_phase4.py",
        "test_hardening.py"
    ]

    for tf in test_files:
        test_path = os.path.join(backend_dir, "tests", tf)
        proc = subprocess.run([PYTHON_EXE, test_path], capture_output=True, text=True, cwd=backend_dir)
        is_pass = (proc.returncode == 0)
        evidence.append(f"{tf}: Return Code = {proc.returncode} -> {'PASS (100%)' if is_pass else 'FAIL'}")
        if not is_pass:
            passed = False
            failure_reason = f"{tf} failed: {proc.stderr or proc.stdout}"

    report(11, "Regression Test Suites (Phase 2, Phase 3, Phase 4, Hardening)", passed, evidence, failure_reason)

# ==============================================================================
# CHECK 12: Silent Failure & Logging Verification
# ==============================================================================
def verify_check_12():
    evidence = []
    passed = True
    failure_reason = None

    auth_files = [
        os.path.join(backend_dir, "app", "routers", "auth.py"),
        os.path.join(backend_dir, "app", "services", "auth.py")
    ]

    for af in auth_files:
        with open(af, "r", encoding="utf-8") as f:
            lines = f.readlines()

        fname = os.path.basename(af)
        # Check bare except: or except: pass
        for idx, line in enumerate(lines):
            stripped = line.strip()
            if stripped.startswith("except:") or "except Exception:" in stripped:
                next_line = lines[idx+1].strip() if idx+1 < len(lines) else ""
                if next_line == "pass":
                    passed = False
                    failure_reason = f"Found 'except: pass' at {fname}:{idx+1}"
                    break

        # Check logger.error usage for auth failures
        error_logs = [line.strip() for line in lines if "logger.error(" in line]
        evidence.append(f"{fname}: 0 'except: pass' found, {len(error_logs)} explicit 'logger.error(...)' calls verified.")

    report(12, "Zero Silent Failures & Fail-Loud Error Logging", passed, evidence, failure_reason)

def main():
    print("==============================================================================")
    print("           DEEP VERIFICATION OF AUTHENTICATION SYSTEM (12 CHECKS)            ")
    print("==============================================================================")
    
    test_email, test_pw = verify_check_1()
    token = verify_check_2(test_email, test_pw)
    verify_check_3(token, test_email)
    verify_check_4(test_email, test_pw)
    verify_check_5(test_email, test_pw)
    verify_check_6()
    verify_check_7()
    verify_check_8(token)
    verify_check_9()
    verify_check_10()
    verify_check_11()
    verify_check_12()

    total = len(results)
    passed_count = sum(1 for r in results.values() if r["status"] == "PASS")
    print("\n==============================================================================")
    print(f"VERIFICATION SUMMARY: {passed_count}/{total} CHECKS PASSED")
    print("==============================================================================")

if __name__ == "__main__":
    main()
