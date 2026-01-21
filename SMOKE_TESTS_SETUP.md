# Post-Deployment Smoke Tests Setup Guide

## Overview
This automated workflow runs critical smoke tests immediately after deployment to production. If tests fail, you'll be notified via:
1. **GitHub Issue** (automatically created)
2. **Email notification** (optional)
3. **GitHub Actions summary** (always visible)

---

## Files Created

### 1. **playwright/smoke.spec.ts**
- 7 critical smoke tests covering:
  - API health check
  - Homepage loads
  - Login page accessible
  - Vendor search API responds
  - Dashboard auth wall working
  - Vendor page loads
  - No critical JavaScript errors
- Runtime: ~30-45 seconds
- Tests run against production URL

### 2. **.github/workflows/post-deploy-smoke-tests.yml**
- Triggers automatically after Vercel deployment completes
- Can also be triggered manually
- Runs smoke tests against production
- Creates GitHub issue on failure
- Sends email notification (if configured)
- Uploads test report as artifact

---

## Setup Instructions

### Step 1: GitHub Repository Secrets (Email Notifications - Optional)

If you want **email notifications on failure**, add these secrets to your GitHub repo:

**Go to:** Settings → Secrets and variables → Actions → New repository secret

Add these 3 secrets:

1. **`EMAIL_USERNAME`**
   - Value: Your Gmail address (e.g., `scott@gmail.com`)
   - NOTE: Use a Gmail app password, not your regular password
   - [Create Gmail app password here](https://myaccount.google.com/apppasswords)

2. **`EMAIL_PASSWORD`**
   - Value: The app password from above

3. **`ALERT_EMAIL`**
   - Value: Email address where you want alerts (can be same as USERNAME)

**If you skip this:** GitHub Issues will still be created on failure. You just won't get email notifications.

### Step 1B: GitHub Repository Secrets (Authenticated Smoke Tests - Optional but Recommended)

To enable authenticated smoke tests (login + search + vendor view), add these secrets:

**Go to:** Settings → Secrets and variables → Actions → New repository secret

Add these 2 secrets:

1. **`SMOKE_TEST_EMAIL`**
   - Value: A test user email (e.g., `qa-test@eyebridge.com`)
   - **Important:** This account must exist in production and be valid for testing

2. **`SMOKE_TEST_PASSWORD`**
   - Value: Password for that test user

**What this enables:**
- ✅ Login smoke test (verify authentication works)
- ✅ Search smoke test (verify authenticated user can search)
- ✅ Vendor detail smoke test (verify data loading for authenticated users)
- ✅ Dashboard smoke test (verify dashboard loads correctly)

**If you skip this:** Authenticated tests will be skipped automatically. Core unauthenticated tests will still run.

### Step 2: Verify Workflow File

The workflow is at: `.github/workflows/post-deploy-smoke-tests.yml`

It will automatically trigger on:
- ✅ Successful Vercel deployments
- ✅ Manual workflow dispatch (can run anytime)

### Step 3: Test the Workflow (Optional)

To test without waiting for a real deployment:

1. Go to your GitHub repo
2. Click **Actions** tab
3. Find **"Post-Deployment Smoke Tests"**
4. Click **"Run workflow"** → Choose "production" → **Run**

---

## What Happens on Failure

### ❌ If Smoke Tests Fail:

**Automatically:**
1. GitHub creates an issue titled "🚨 Production Smoke Tests Failed"
2. Issue includes:
   - Links to failing tests
   - Instructions for investigation
   - Link to Playwright report
3. If email is configured: Notification sent to `ALERT_EMAIL`

**You should:**
1. Click the GitHub Issue link
2. Check the Playwright report in Actions artifacts
3. Review which tests failed
4. Investigate production environment
5. Consider rolling back if critical issues found

---

## Customizing Smoke Tests

**Location:** `playwright/smoke.spec.ts`

You can:
- Add more tests
- Remove tests you don't need
- Adjust timeouts
- Use authenticated tests or unauthenticated only

### Authenticated Tests

The smoke tests now include **5 optional authenticated tests**:

1. **User Login** — Verifies login flow works
2. **Authenticated Search** — Verifies user can search vendors after login
3. **Vendor Details** — Verifies user can view vendor details
4. **Dashboard Load** — Verifies dashboard loads for authenticated users
5. *(Unauthenticated tests)* — Always run regardless

**To enable authenticated tests:**

1. Create a test user account in production (e.g., `qa-test@eyebridge.com`)
2. Add GitHub secrets:
   - `SMOKE_TEST_EMAIL` = test user email
   - `SMOKE_TEST_PASSWORD` = test user password
3. Tests will automatically use these credentials

**If secrets are missing:** Authenticated tests are skipped, but unauthenticated tests still run.

### Example: Custom Authenticated Test

If you want to add a custom authenticated test (e.g., favorites):

```typescript
test('User can add vendor to favorites', async ({ page }) => {
  // Skip if no credentials
  if (!process.env.SMOKE_TEST_EMAIL) {
    test.skip();
  }

  await page.goto(`${BASE_URL}/login`);
  
  // Login
  await page.fill('input[type="email"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  
  // Wait for dashboard
  await page.waitForURL('**/dashboard');
  
  // Navigate to vendor
  await page.goto(`${BASE_URL}/vendors`);
  
  // Click heart/favorite icon on first vendor
  const favoriteButton = page.locator('button[aria-label*="favorite"], [class*="heart"]').first();
  await favoriteButton.click();
  
  // Verify it's favorited (heart filled, count updated, etc)
  await expect(favoriteButton).toHaveClass(/active|filled/);
});
```

---

## Monitoring Test Results

### View Test Report:
1. Go to **Actions** tab
2. Click latest run
3. Scroll to **"Artifacts"** section
4. Download `playwright-report`
5. Extract and open `index.html` in browser

### View GitHub Issues:
1. Go to **Issues** tab
2. Filter by label: `deployment`
3. Check for recent "Smoke Tests Failed" issues

### View Summary:
1. Go to **Actions** tab
2. Click the workflow run
3. Scroll to **"Summary"** at bottom
4. See quick status: ✅ PASSED or ❌ FAILED

---

## Manual Test Run (Without Deployment)

To run smoke tests locally or manually:

```bash
# Run against production
npm run test:prod

# Run against staging (if you set it up)
BASE_URL=https://staging.eye-bridge.com npm run test:prod

# Run with UI
npx playwright test --ui playwright/smoke.spec.ts

# Run with debugging
npx playwright test --debug playwright/smoke.spec.ts
```

---

## Troubleshooting

### "Workflow didn't trigger after deployment"
- Check Vercel deployment status (should say "Success")
- Go to Actions tab, manually run the workflow to test
- Verify repository secrets are set correctly

### "Email notifications not working"
- Verify `EMAIL_USERNAME` and `EMAIL_PASSWORD` are correct
- If using Gmail: Ensure app password was created (not regular password)
- Check GitHub Actions logs for SMTP errors

### "Playwright tests timing out"
- Increase timeout in `smoke.spec.ts` (change `{ timeout: 5000 }` to `10000`)
- Check if production site is actually up
- Verify network connectivity in Actions runner

### "Tests fail intermittently"
- Increase wait times in smoke tests
- Replace `waitUntil: 'networkidle'` with `waitUntil: 'domcontentloaded'`
- Reduce test scope (fewer assertions per test)

---

## Email Setup (Gmail Example)

**If you want email notifications:**

1. Go to: https://myaccount.google.com/apppasswords
2. Select Device: **Mail** → Device: **Windows Computer** (or other)
3. Generate password (16 characters)
4. Copy and paste as `EMAIL_PASSWORD` secret
5. Add your Gmail as `EMAIL_USERNAME` secret
6. Add alert email as `ALERT_EMAIL` secret

**Note:** This uses Gmail's app-specific password feature, which is more secure than storing your actual Gmail password.

---

## Next Steps

✅ Smoke tests are now configured!

**Optional Enhancements:**
- Add authenticated tests (login + vendor view)
- Add performance assertions (`expect(loadTime).toBeLessThan(3000)`)
- Add visual regression testing
- Create staging smoke tests (separate workflow)
- Add Slack notifications if you set up Slack later

---

## Test Scope Reference

| Test | Purpose | Timeout |
|------|---------|---------|
| API health check | Backend is responsive | 5s |
| Homepage loads | Frontend renders | 5s |
| Login page | Auth system working | 5s |
| Vendor search API | Core search API responds | 5s |
| Dashboard redirect | Auth wall active | 5s |
| Vendor page | Data loading works | 5s |
| No JS errors | No console errors | 2s |
| **LOGIN** | User authentication works | 10s |
| **AUTHENTICATED SEARCH** | Logged-in user can search | 10s |
| **VENDOR DETAILS** | Logged-in user can view details | 10s |
| **DASHBOARD LOAD** | Dashboard works when authenticated | 5s |

**Total runtime:** ~45-60 seconds (shorter if no authenticated credentials)

