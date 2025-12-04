import { test, expect } from '@playwright/test';

test.describe('Vendors Page', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass password gate and go to vendors
    await page.goto('/');
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
    await page.goto('/vendors');
  });

  test('should display vendor directory', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Vendor Directory');
    await expect(page.getByText(/312 verified vendors/i)).toBeVisible();
  });

  test('should filter vendors by category', async ({ page }) => {
    // Open category dropdown
    await page.click('button:has-text("All Categories")');
    
    // Select Equipment category
    await page.click('text=Equipment');
    
    // Wait for results to update
    await page.waitForTimeout(500);
    
    // Should show filtered results
    const vendorCards = page.locator('[class*="motion"]').first();
    await expect(vendorCards).toBeVisible();
  });

  test('should search vendors by name', async ({ page }) => {
    // Type in search box
    await page.fill('input[placeholder*="Search vendors"]', 'optical');
    
    // Wait for debounce
    await page.waitForTimeout(500);
    
    // Should show matching results
    const results = page.locator('text=optical').first();
    await expect(results).toBeVisible();
  });

  test('should clear search filters', async ({ page }) => {
    // Apply filters
    await page.fill('input[placeholder*="Search vendors"]', 'test');
    await page.click('button:has-text("All Categories")');
    await page.click('text=Equipment');
    
    // Click Clear Search
    await page.click('button:has-text("Clear Search")');
    
    // Filters should be reset
    await expect(page.locator('input[placeholder*="Search vendors"]')).toHaveValue('');
    await expect(page.locator('button:has-text("All Categories")')).toBeVisible();
  });

  test('should open vendor modal on card click', async ({ page }) => {
    // Click first vendor card
    await page.locator('[class*="motion"]').first().click();
    
    // Modal should appear
    await expect(page.locator('[class*="fixed inset-0"]')).toBeVisible();
    
    // Should show vendor details
    await expect(page.locator('h2')).toBeVisible();
  });

  test('should add vendor to favorites when logged in', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    // Go to vendors
    await page.goto('/vendors');
    
    // Click heart icon on first vendor
    const firstHeartButton = page.locator('button[title*="favorite"]').first();
    await firstHeartButton.click();
    
    // Heart should be filled
    await expect(firstHeartButton.locator('svg')).toHaveClass(/fill-red-500/);
  });

  test('should add vendors to comparison', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    await page.goto('/vendors');
    
    // Add two vendors to comparison
    const compareButtons = page.locator('button:has-text("Compare")');
    await compareButtons.first().click();
    await page.waitForTimeout(300);
    await compareButtons.nth(1).click();
    await page.waitForTimeout(300);
    
    // Comparison bar should appear
    await expect(page.locator('text=Comparing 2 vendor')).toBeVisible();
    
    // Click View Comparison
    await page.click('button:has-text("View Comparison")');
    
    // Modal should show comparison
    await expect(page.locator('h2:has-text("Vendor Comparison")')).toBeVisible();
  });

  test('should filter by product type after selecting category', async ({ page }) => {
    // Select category first
    await page.click('button:has-text("All Categories")');
    await page.click('text=Equipment');
    await page.waitForTimeout(500);
    
    // Product dropdown should be enabled
    const productDropdown = page.locator('button:has-text("All Products")');
    await expect(productDropdown).toBeEnabled();
    
    // Select a product
    await productDropdown.click();
    const firstProduct = page.locator('[class*="dropdown"] button').nth(1);
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
    }
  });
});
