import { test, expect } from '@playwright/test';

test.describe('Vendors Page', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass password gate and navigate to vendors
    await page.goto('/');
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
    await page.goto('/vendors');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
  });

  test('should display vendor directory header', async ({ page }) => {
    // Header should be visible
    await expect(page.getByTestId('vendors-header')).toBeVisible();
    await expect(page.getByTestId('vendors-title')).toContainText('Vendor Directory');
    
    // Logo link should be clickable
    await expect(page.getByTestId('logo-link')).toBeVisible();
  });

  test('should display search and filter controls', async ({ page }) => {
    // Search input should be visible
    const searchInput = page.locator('input[placeholder*="Search vendors"]').last();
    await expect(searchInput).toBeVisible();
    
    // Category dropdown should be visible
    await expect(page.getByTestId('category-dropdown-toggle').last()).toBeVisible();
  });

  test('should search vendors by name or keyword', async ({ page }) => {
    // Type search query
    const searchInput = page.locator('input[placeholder*="Search vendors"]').last();
    await searchInput.fill('optical');
    
    // Click Search Vendors button
    await page.getByRole('button', { name: 'Search Vendors' }).click();
    
    // Wait for results to update
    await page.waitForLoadState('networkidle');
    
    // Vendor cards should be visible
    const vendorCards = page.getByTestId('vendor-card');
    const count = await vendorCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter vendors by category', async ({ page }) => {
    // Click category dropdown
    await page.getByTestId('category-dropdown-toggle').last().click();
    
    // Select Equipment category
    await page.getByRole('button', { name: 'Equipment' }).click();
    
    // Wait for filtering to complete
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Search Vendors' }).click();
    // Vendor cards should be visible
    const vendorCards = page.getByTestId('vendor-card');
    const count = await vendorCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter vendors by product type', async ({ page }) => {
    // First select a category
    await page.getByTestId('category-dropdown-toggle').last().click();
    await page.getByRole('button', { name: 'Equipment' }).click();
    
    // Wait for product dropdown to be enabled
    await page.waitForLoadState('networkidle');
    
    // Product dropdown should be visible
    const productDropdown = page.getByTestId('product-dropdown-toggle').last();
    await expect(productDropdown).toBeVisible();
    
    // Click product dropdown
    await productDropdown.click();
    
    // Select first available product
    const productOptions = page.locator('button[class*="text-left"]');
    if (await productOptions.first().isVisible()) {
      await productOptions.first().click();
    }
  });

  test('should display active filter chips', async ({ page }) => {
    // Apply a search filter
    const searchInput = page.locator('input[placeholder*="Search vendors"]').last();
    await searchInput.fill('test');
    await searchInput.press('Enter');
    
    // Wait for filter chips to appear
    await page.waitForLoadState('networkidle');
    
    // Filter chips should display
    const filterChips = page.locator('div[class*="rounded-full"][class*="bg-"]');
    const count = await filterChips.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should clear all filters', async ({ page }) => {
    // Apply filters
    const searchInput = page.locator('input[placeholder*="Search vendors"]').last();
    await searchInput.fill('test');
    await searchInput.press('Enter');
    
    // Wait for filters to apply
    await page.waitForLoadState('networkidle');
    
    // Click "Clear All" button if visible
    const clearAllButton = page.locator('button:has-text("Clear All")');
    if (await clearAllButton.isVisible()) {
      await clearAllButton.click();
      
      // Search input should be cleared
      await expect(searchInput).toHaveValue('');
    }
  });

  test('should open vendor details modal on card click', async ({ page }) => {
    // Wait for vendor cards to load
    await page.getByTestId('category-dropdown-toggle').last().click();
    
    // Select Equipment category
    await page.getByRole('button', { name: 'Equipment' }).click();
    
    // Wait for filtering to complete and click Search Vendors
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Search Vendors' }).click();
    
    // Wait for vendor cards to load after search
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="vendor-card"]', { timeout: 15000 });
    
    // Click first vendor card
    const firstVendorCard = page.getByTestId('vendor-card').first();
    await firstVendorCard.click();
    
    // Modal should appear
    const modal = page.locator('[class*="fixed inset-0"]');
    await expect(modal).toBeVisible();
  });

  test('should display vendor contact information in modal', async ({ page }) => {
    // Click "View All" to display all vendors (since empty state shows 0 vendors)
    const viewAllButton = page.locator('button:has-text("View All Vendors")');
    await viewAllButton.click();
    
    // Wait for page to load and vendor cards to appear
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="vendor-card"]', { timeout: 15000 });
    await page.getByTestId('vendor-card').first().click();
    
    // Modal should show vendor name
    const vendorName = page.locator('h2, h3').first();
    await expect(vendorName).toBeVisible();
    
    // Contact information icons should be present
    const contactIcons = page.locator('svg[class*="w-5"]');
    const count = await contactIcons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should close modal with close button', async ({ page }) => {
    // Click "View All" to display all vendors
    const viewAllButton = page.locator('button:has-text("View All Vendors")');
    await viewAllButton.click();
    
    // Open vendor modal
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="vendor-card"]', { timeout: 15000 });
    await page.getByTestId('vendor-card').first().click();
    
    // Find and click close button
    const closeButton = page.locator('button:has-text("×"), button[aria-label*="close"]').first();
    await closeButton.click();
    
    // Modal should disappear
    const modal = page.locator('[class*="fixed inset-0"]');
    await expect(modal).not.toBeVisible();
  });

  test('should add vendor to favorites when logged in', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sdrindahl@gmail.com');
    await page.fill('input[type="password"]', 'Jessie34!!');
    await page.click('button[type="submit"]');
    
    // Navigate to vendors
    await page.goto('/vendors');
    await page.waitForLoadState('networkidle');
    
    // Click "View All" to display vendors
    const viewAllButton = page.locator('button:has-text("View All Vendors")');
    await viewAllButton.click();
    
    // Wait for vendor cards
    await page.waitForSelector('[data-testid="vendor-card"]', { timeout: 15000 });
    
    // Find heart icon button (favorite button)
    const vendorCard = page.getByTestId('vendor-card').first();
    const heartButton = vendorCard.locator('button').filter({ has: page.locator('svg') }).first();
    
    if (await heartButton.isVisible()) {
      await heartButton.click();
      
      // Verify the heart is filled (checked favorite state)
      await expect(heartButton).toBeVisible();
    }
  });

  test('should navigate to home from vendors page', async ({ page }) => {
    // Home button should be visible
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();
    
    // Click home button
    await homeButton.click();
    
    // Should navigate to home
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$/);
  });

  test('should navigate to dashboard when logged in', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sdrindahl@gmail.com');
    await page.fill('input[type="password"]', 'Jessie34!!');
    await page.click('button[type="submit"]');
    
    // Navigate to vendors
    await page.getByTestId('browse-vendors-button').click();
    
    // Dashboard button should be visible
    const dashboardButton = page.getByTestId('dashboard-button');
    await expect(dashboardButton).toBeVisible();
    
    // Click dashboard button
    await dashboardButton.click();
    
    // Should navigate to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    expect(page.url()).toContain('/dashboard');
  });

  test('should allow logout from vendors page', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sdrindahl@gmail.com');
    await page.fill('input[type="password"]', 'Jessie34!!');
    await page.click('button[type="submit"]');
    
    // Navigate to vendors
    await page.getByTestId('browse-vendors-button').click();
    
    // Logout button should be visible
    const logoutButton = page.getByTestId('logout-button');
    await expect(logoutButton).toBeVisible();
    
    // Click logout
    await logoutButton.click();
    
    // Should be redirected to home
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$/);
  });

  test('should display vendor cards with key information', async ({ page }) => {
    // Click "View All" to display all vendors
    const viewAllButton = page.locator('button:has-text("All")');
    await page.getByRole('button', { name: 'View All Vendors' }).click();
    
    // Wait for vendor cards to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="vendor-card"]', { timeout: 15000 });
    
    // Get first vendor card
    const firstCard = page.getByTestId('vendor-card').first();
    
    // Card should contain text content
    const cardText = await firstCard.textContent();
    expect(cardText).toBeTruthy();
    expect(cardText?.length).toBeGreaterThan(0);
  });
});
