import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass password gate
    await page.goto('/');
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
    await page.goto('/login');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Login');
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    // Should show error messages
    await expect(page.getByText(/required/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalidemail');
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    // Should show email validation error
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('should validate password requirements', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'weak');
    await page.click('button[type="submit"]');
    
    // Should show password requirements
    await expect(page.locator('text=/6.*characters/i')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should have Home button that navigates back', async ({ page }) => {
    const homeButton = page.getByRole('button', { name: /Home/i });
    await expect(homeButton).toBeVisible();
    await homeButton.click();
    
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$/);
  });

  test('should have clickable logo that goes to home', async ({ page }) => {
    await page.locator('img[alt*="Eye Bridges"]').click();
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$/);
  });
});
