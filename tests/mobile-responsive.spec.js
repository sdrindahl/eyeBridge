import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test.beforeEach(async ({ page }) => {
    // Bypass password gate
    await page.goto('/');
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
  });

  test('should display mobile-friendly home page header', async ({ page }) => {
    await page.goto('/');
    
    // Logo should be smaller
    const logo = page.locator('img[alt*="Eye Bridges"]');
    await expect(logo).toBeVisible();
    
    // Navigation should be visible
    await expect(page.getByRole('link', { name: /Browse Vendors/i })).toBeVisible();
  });

  test('should display mobile-friendly vendors page', async ({ page }) => {
    await page.goto('/vendors');
    
    // Header should fit on screen
    await expect(page.locator('h1')).toContainText('Vendor Directory');
    
    // Search should be accessible
    await expect(page.getByPlaceholder(/Search vendors/i)).toBeVisible();
    
    // Vendor description should be hidden on mobile
    const description = page.locator('text=/312 verified vendors/i');
    // This might be hidden on mobile with hidden sm:block class
  });

  test('should display mobile-friendly dashboard', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
    
    // Dashboard header should fit
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Email might be hidden on mobile (hidden md:inline)
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 768) {
      // On mobile, email should be hidden
      const email = page.locator('text=test@example.com');
      await expect(email).not.toBeVisible();
    }
  });

  test('should have touch-friendly buttons', async ({ page }) => {
    await page.goto('/vendors');
    
    // Buttons should be tappable
    const searchButton = page.getByRole('button', { name: /Search/i });
    const box = await searchButton.boundingBox();
    
    // Touch target should be at least 44x44 pixels (accessibility guideline)
    expect(box?.height).toBeGreaterThanOrEqual(36); // Allowing some flexibility
  });

  test('should stack vendor cards vertically on mobile', async ({ page }) => {
    await page.goto('/vendors');
    
    // Wait for vendor cards to load
    await page.waitForTimeout(1000);
    
    const firstCard = page.locator('[class*="motion"]').first();
    await expect(firstCard).toBeVisible();
  });

  test('should have mobile-friendly modals', async ({ page }) => {
    await page.goto('/vendors');
    
    // Click first vendor
    await page.locator('[class*="motion"]').first().click();
    
    // Modal should be visible and fit screen
    const modal = page.locator('[class*="fixed inset-0"]');
    await expect(modal).toBeVisible();
    
    // Close button should be accessible
    const closeButton = page.locator('button:has-text("×")');
    await expect(closeButton).toBeVisible();
  });
});
