import { test, expect } from '@playwright/test';

// Smoke tests for production deployment validation
// These critical path tests run after deployment to catch regressions immediately

const BASE_URL = process.env.BASE_URL || 'https://eye-bridge.vercel.app';
const TEST_EMAIL = process.env.SMOKE_TEST_EMAIL || 'test@eyebridge.com';
const TEST_PASSWORD = process.env.SMOKE_TEST_PASSWORD || 'TestPassword123!';

test.describe('Post-Deployment Smoke Tests', () => {
  // ===== UNAUTHENTICATED TESTS =====
  
  test('API health check', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`);
    expect(response.status()).toBe(200);
  });

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    
    // Check page title or key element
    const heading = page.locator('h1, [role="heading"]');
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('Login page accessible', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Check for login form
    const emailInput = page.locator('input[type="email"], input[name*="email"]');
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });

  test('Vendor search endpoint responds', async ({ request }) => {
    // Test core API functionality
    const response = await request.get(`${BASE_URL}/api/vendors?q=eye`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    expect(response.status()).toBe(200);
    const json = await response.json();
    expect(Array.isArray(json) || json.data).toBeTruthy();
  });

  test('Dashboard redirects unauthenticated users', async ({ page }) => {
    // Verify auth wall is working
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    
    // Should redirect to login or show password gate
    const url = page.url();
    const isProtected = url.includes('login') || url.includes('password') || url.includes('auth');
    
    expect(isProtected).toBeTruthy();
  });

  test('Vendor page loads with data', async ({ page }) => {
    await page.goto(`${BASE_URL}/vendors`, { waitUntil: 'networkidle' });
    
    // Check for vendor list or search functionality
    const vendorList = page.locator('[class*="vendor"], [class*="card"], [role="list"]');
    await expect(vendorList.first()).toBeVisible({ timeout: 5000 });
  });

  test('No critical JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      errors.push(err.message);
    });

    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (err) => !err.includes('404') && !err.includes('third-party') && err.length > 0
    );

    expect(criticalErrors).toHaveLength(0);
  });

  // ===== AUTHENTICATED TESTS =====
  
  test('User can login successfully', async ({ page }) => {
    // Skip if no test credentials provided
    if (!process.env.SMOKE_TEST_EMAIL) {
      test.skip();
    }

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Fill login form
    const emailInput = page.locator('input[type="email"], input[name*="email"]');
    const passwordInput = page.locator('input[type="password"], input[name*="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    await submitButton.click();

    // Wait for redirect to dashboard or home
    await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
      // Dashboard redirect might not happen; check for logout button instead
    });

    // Verify user is authenticated (logout button visible or dashboard content)
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign Out"), [aria-label*="logout"]');
    const dashboardContent = page.locator('[class*="dashboard"], [class*="welcome"]');

    const isAuthenticated = 
      await logoutButton.isVisible({ timeout: 3000 }).catch(() => false) ||
      await dashboardContent.isVisible({ timeout: 3000 }).catch(() => false);

    expect(isAuthenticated).toBeTruthy();
  });

  test('Authenticated user can search vendors', async ({ page }) => {
    // Skip if no test credentials provided
    if (!process.env.SMOKE_TEST_EMAIL) {
      test.skip();
    }

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Login
    const emailInput = page.locator('input[type="email"], input[name*="email"]');
    const passwordInput = page.locator('input[type="password"], input[name*="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    await submitButton.click();

    // Wait for dashboard to load
    await page.waitForURL(['**/dashboard', '**/vendors', '**/home'], { timeout: 10000 }).catch(() => {});

    // Navigate to vendors or search page
    const vendorsLink = page.locator('a:has-text("Vendors"), a[href*="vendors"], button:has-text("Search")');
    if (await vendorsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await vendorsLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Perform search
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"], input[name*="search"]');
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('eye');
      await page.keyboard.press('Enter');
      
      // Wait for results
      await page.waitForLoadState('networkidle');

      // Verify results appear
      const results = page.locator('[class*="vendor"], [class*="result"], [class*="card"]');
      const resultCount = await results.count();
      
      expect(resultCount).toBeGreaterThan(0);
    }
  });

  test('Authenticated user can view vendor details', async ({ page }) => {
    // Skip if no test credentials provided
    if (!process.env.SMOKE_TEST_EMAIL) {
      test.skip();
    }

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Login
    const emailInput = page.locator('input[type="email"], input[name*="email"]');
    const passwordInput = page.locator('input[type="password"], input[name*="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    await submitButton.click();

    // Wait for authentication
    await page.waitForLoadState('networkidle');

    // Navigate to vendors page
    const vendorsLink = page.locator('a:has-text("Vendors"), a[href*="vendors"], button:has-text("Browse")');
    if (await vendorsLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await vendorsLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Click first vendor card
    const vendorCard = page.locator('[class*="vendor-card"], [class*="vendor"], a[href*="/vendor"]').first();
    if (await vendorCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await vendorCard.click();
      await page.waitForLoadState('networkidle');

      // Verify detail page loads
      const vendorDetails = page.locator('[class*="detail"], [class*="info"], h1, h2');
      await expect(vendorDetails.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Dashboard loads for authenticated user', async ({ page }) => {
    // Skip if no test credentials provided
    if (!process.env.SMOKE_TEST_EMAIL) {
      test.skip();
    }

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    
    // Login
    const emailInput = page.locator('input[type="email"], input[name*="email"]');
    const passwordInput = page.locator('input[type="password"], input[name*="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    await submitButton.click();

    // Navigate to dashboard
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });

    // Verify dashboard content loads
    const dashboardContent = page.locator('[class*="dashboard"], [class*="stats"], [class*="widget"]');
    await expect(dashboardContent.first()).toBeVisible({ timeout: 5000 });
  });
});
