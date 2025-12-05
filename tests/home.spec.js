import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass password gate
    await page.goto('/');
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
  });

  test('should display home page with correct branding', async ({ page }) => {
    await expect(page.getByTestId('logo-link')).toBeVisible();
    await expect(page.getByText('Find Your Eye Care Vendors')).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Test Browse Vendors link
    await page.click('text=Browse Vendors');
    await page.waitForURL('**/vendors');
    expect(page.url()).toContain('/vendors');
    
    // Go back to home
    await page.goto('/');
    
    // Test Login link (if not logged in)
    const loginLink = page.getByRole('link', { name: /Login/i });
    if (await loginLink.isVisible()) {
      await loginLink.click();
      await page.waitForURL('**/login');
      expect(page.url()).toContain('/login');
    }
  });

  test('should display vendor statistics', async ({ page }) => {
    // Check for statistics
    await expect(page.locator('#root')).toContainText('312');
    await expect(page.locator('#root')).toContainText('Vendors');
    await expect(page.locator('#root')).toContainText('153');
    await expect(page.locator('#root')).toContainText('Categories');
    await expect(page.locator('#root')).toContainText('236');
    await expect(page.locator('#root')).toContainText('Products');
  });

  test('should navigate to Dashboard when logged in', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    // Go back to home
    await page.goto('/');
    
    // Should have Dashboard link
    const dashboardLink = page.getByRole('link', { name: /Dashboard/i });
    await expect(dashboardLink).toBeVisible();
    await dashboardLink.click();
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  test('should have logo that links to home', async ({ page }) => {
    await page.goto('/vendors');
    
    // Click logo to go home
    await page.locator('img[alt*="Eye Bridges"]').click();
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$/);
  });
});
