"""
Test Case 1: Register → Logout → Login
========================================
Steps:
  1. Open /register and create a new dummy user
  2. Assert: Redirected to /dashboard (user is logged in)
  3. Click the logout button in the navbar
  4. Assert: Redirected to / (home page)
  5. Open /login and sign in with the same credentials
  6. Assert: Redirected to /dashboard (user is logged in again)

Prerequisites:
  - MindQuest app must be running locally (npm run dev)
  - Frontend: http://localhost:5173
  - Backend:  http://localhost:5000
  - pip install selenium
"""

import time
import random
import string
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# ── Config ────────────────────────────────────────────────────────────────────
BASE_URL = "http://localhost:5173"
WAIT_TIMEOUT = 15  # seconds


def generate_test_user():
    """Generate a unique dummy user for each test run."""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
    return {
        "name": "Test User",
        "email": f"testuser_{random_str}@example.com",
        "password": "TestPassword123!",
    }


def test_register_logout_login():
    user = generate_test_user()
    print("\n" + "=" * 55)
    print("  TEST CASE 1: Register → Logout → Login")
    print("=" * 55)
    print(f"  Test User Email : {user['email']}")
    print("=" * 55)

    driver = webdriver.Chrome()
    driver.maximize_window()
    wait = WebDriverWait(driver, WAIT_TIMEOUT)

    try:
        # ── STEP 1: Register ───────────────────────────────────────────────────
        print("\n[STEP 1] Navigating to /register ...")
        driver.get(f"{BASE_URL}/register")

        wait.until(EC.presence_of_element_located((By.ID, "name")))
        driver.find_element(By.ID, "name").send_keys(user["name"])
        driver.find_element(By.ID, "email").send_keys(user["email"])
        driver.find_element(By.ID, "password").send_keys(user["password"])
        driver.find_element(By.ID, "confirmPassword").send_keys(user["password"])

        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        print("  → Registration form submitted.")

        # ── ASSERT 1: Dashboard loaded ─────────────────────────────────────────
        wait.until(EC.url_contains("/dashboard"))
        print(f"  ✅ PASS: Registered and redirected to dashboard.")
        print(f"     Current URL: {driver.current_url}")

        time.sleep(1)  # Allow page to settle

        # ── STEP 2: Logout ─────────────────────────────────────────────────────
        print("\n[STEP 2] Clicking the logout button in the navbar ...")
        logout_btn = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, "button[aria-label='Sign out']")
        ))
        logout_btn.click()
        print("  → Logout button clicked.")

        # ── ASSERT 2: Redirected to home ───────────────────────────────────────
        wait.until(EC.url_to_be(f"{BASE_URL}/"))
        print(f"  ✅ PASS: Logged out and redirected to home page.")
        print(f"     Current URL: {driver.current_url}")

        time.sleep(1)

        # ── STEP 3: Login ──────────────────────────────────────────────────────
        print("\n[STEP 3] Navigating to /login ...")
        driver.get(f"{BASE_URL}/login")

        wait.until(EC.presence_of_element_located((By.ID, "email")))
        driver.find_element(By.ID, "email").send_keys(user["email"])
        driver.find_element(By.ID, "password").send_keys(user["password"])

        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        print("  → Login form submitted.")

        # ── ASSERT 3: Dashboard loaded again ───────────────────────────────────
        wait.until(EC.url_contains("/dashboard"))
        print(f"  ✅ PASS: Logged in and redirected to dashboard.")
        print(f"     Current URL: {driver.current_url}")

        print("\n" + "=" * 55)
        print("  🎉 TEST CASE 1 PASSED SUCCESSFULLY!")
        print("=" * 55 + "\n")

    except Exception as e:
        print(f"\n  ❌ TEST CASE 1 FAILED!")
        print(f"  Error: {e}\n")

    finally:
        time.sleep(3)  # Keep browser open briefly so you can see the result
        driver.quit()
        print("  Browser closed.")


if __name__ == "__main__":
    test_register_logout_login()
