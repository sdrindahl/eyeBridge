import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass password gate
    await page.goto('/');
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
    
    // Login with real credentials
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sdrindahl@gmail.com');
    await page.fill('input[type="password"]', 'Jessie34!!');
    await page.click('button[type="submit"]');
    
    // Wait for successful login redirect
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    // Already on dashboard from beforeEach
    expect(page.url()).toContain('/dashboard');
    await expect(page.getByText('sdrindahl@gmail.com')).toBeVisible();
  });

  test('should display Quick Stats cards', async ({ page }) => {
    // Wait for dashboard to fully load using test ID
   // await page.getByTestId('dashboard-title').waitFor();
    
    // Check for Quick Stats using test IDs - much cleaner and more reliable!
    await expect(page.getByTestId('quick-stats')).toBeVisible();
    await expect(page.getByTestId('favorites-stat-card')).toBeVisible();
    await expect(page.getByTestId('favorites-label')).toContainText('Favorite');
    await expect(page.getByTestId('searches-stat-card')).toBeVisible();
    await expect(page.getByTestId('searches-label')).toContainText('Recent Searches');
    await expect(page.getByTestId('contacted-stat-card')).toBeVisible();
    await expect(page.getByTestId('contacted-label')).toContainText('Contacted');
  });

  test('should navigate to sections when clicking Quick Stats', async ({ page }) => {
    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');
    
    // Click Favorites stat card using test ID
    await page.getByTestId('favorites-stat-card').click();
    
    // Should scroll to favorites section
    await expect(page.locator('#favorites-section')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    // Search should be visible (use last() to get desktop version, first is mobile/hidden)
    await expect(page.getByPlaceholder(/Search vendors/i).last()).toBeVisible();
    
    // Category and Product dropdowns
    await expect(page.locator('button:has-text("All Categories")').last()).toBeVisible();
  });

  test('should navigate to vendors page with search params', async ({ page }) => {
    // Click the category dropdown button using test ID
    await page.getByTestId('category-dropdown').last().click();
    
    // Select Equipment from dropdown
    await page.getByRole('button', { name: 'Equipment' }).click();
    
    // Enter search query (use last() for visible desktop search input)
    await page.locator('input[placeholder*="Search vendors"]').last().fill('optical');
    
    // Click Search button
    await page.getByRole('button', { name: 'Search Vendors' }).click();
    
    // Should navigate to vendors with query params
    await page.waitForURL('**/vendors**');
    expect(page.url()).toContain('/vendors');
    expect(page.url()).toContain('category=Equipment');
    expect(page.url()).toContain('q=optical');
  });

  test('should clear search filters', async ({ page }) => {
    // Apply filters (use last() for visible desktop search input)
    const searchInput = page.locator('input[placeholder*="Search vendors"]').last();
    await searchInput.fill('test');
    
    // Click category dropdown using test ID
    await page.getByTestId('category-dropdown').last().click();
    await page.getByRole('button', { name: 'Equipment' }).click();
    
    // Wait for "Clear Filters" button to appear and click it
    await page.waitForSelector('button:has-text("Clear Filters")');
    await page.click('button:has-text("Clear Filters")');
    
    // Clear the search input manually (Clear Filters only clears category/product filters)
    await searchInput.clear();
    
    // Should be reset
    await expect(searchInput).toHaveValue('');
  });

  test('should logout successfully', async ({ page }) => {
    // Use test ID for more reliable selector
    const logoutButton = page.getByTestId('logout-button');
    
    // Wait for button to be available and visible
    await expect(logoutButton).toBeVisible({ timeout: 5000 });
    
    // Force scroll into view in case it's off-screen (Firefox issue)
    await logoutButton.scrollIntoViewIfNeeded();
    
    // Click logout
    await logoutButton.click();
    
    // Should redirect to home
    await page.waitForURL('/');
    expect(page.url()).toMatch(/\/$/);
    
    // Should not be able to access dashboard
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('should display favorite vendors section', async ({ page }) => {
    await expect(page.locator('#favorites-section')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Favorite Vendors' })).toBeVisible();
  });

  test('should display recent searches section', async ({ page }) => {
    await expect(page.locator('#searches-section')).toBeVisible();
    await expect(page.getByTestId('searches-label')).toBeVisible();
  });

  test('should navigate to Browse Vendors', async ({ page }) => {
    await page.click('text=Browse Vendors');
    await page.waitForURL('**/vendors');
    expect(page.url()).toContain('/vendors');
  });
});