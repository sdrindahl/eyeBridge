import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass password gate
    await page.goto('/');
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
    
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123');
    await page.click('button[type="submit"]');
  });

  test('should display dashboard after login', async ({ page }) => {
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.getByText('test@example.com')).toBeVisible();
  });

  test('should display Quick Stats cards', async ({ page }) => {
    // Wait for dashboard to fully load using test ID
    await page.getByTestId('dashboard-title').waitFor();
    
    // Check for Quick Stats using test IDs - much cleaner and more reliable!
    await expect(page.getByTestId('quick-stats')).toBeVisible();
    await expect(page.getByTestId('favorites-stat-card')).toBeVisible();
    await expect(page.getByTestId('favorites-label')).toContainText('Favorites');
    await expect(page.getByTestId('searches-stat-card')).toBeVisible();
    await expect(page.getByTestId('searches-label')).toContainText('Recent Searches');
    await expect(page.getByTestId('contacted-stat-card')).toBeVisible();
    await expect(page.getByTestId('contacted-label')).toContainText('Contacted');
    await expect(page.getByTestId('comparisons-stat-card')).toBeVisible();
    await expect(page.getByTestId('comparisons-label')).toContainText('Comparisons');
  });

  test('should navigate to sections when clicking Quick Stats', async ({ page }) => {
    // Click Favorites stat
    await page.getByText('Favorites', { exact: true }).click;
    //await page.locator('text=Favorites').click();
    
    // Should scroll to favorites section
    await expect(page.locator('#favorites-section')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    // Search should be visible
    await expect(page.getByPlaceholder(/Search vendors/i)).toBeVisible();
    
    // Category and Product dropdowns
    await expect(page.locator('button:has-text("All Categories")')).toBeVisible();
  });

  test('should navigate to vendors page with search params', async ({ page }) => {
    // Select category
    await page.click('button:has-text("All Categories")');
    await page.click('text=Equipment');
    
    // Enter search query
    await page.fill('input[placeholder*="Search vendors"]', 'optical');
    
    // Click Search button
    await page.click('button:has-text("Search Vendors")');
    
    // Should navigate to vendors with query params
    await page.waitForURL('**/vendors**');
    expect(page.url()).toContain('/vendors');
    expect(page.url()).toContain('category=Equipment');
    expect(page.url()).toContain('q=optical');
  });

  test('should clear search filters', async ({ page }) => {
    // Apply filters
    await page.fill('input[placeholder*="Search vendors"]', 'test');
    await page.click('button:has-text("All Categories")');
    await page.click('text=Equipment');
    
    // Clear
    await page.click('button:has-text("Clear")');
    
    // Should reset
    await expect(page.locator('input[placeholder*="Search vendors"]')).toHaveValue('');
  });

  test('should logout successfully', async ({ page }) => {
    await page.click('button:has-text("Logout")');
    
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
    await expect(page.locator('text=Favorite Vendors')).toBeVisible();
  });

  test('should display recent searches section', async ({ page }) => {
    await expect(page.locator('#searches-section')).toBeVisible();
    await expect(page.getByTestId('searches-label')).toBeVisible();
  });

  test('should display contact history section', async ({ page }) => {
    await expect(page.locator('#contacts-section')).toBeVisible();
    await expect(page.locator('text=Contact History')).toBeVisible();
  });

  test('should display saved comparisons section', async ({ page }) => {
    await expect(page.locator('#comparisons-section')).toBeVisible();
    await expect(page.locator('h3:has-text("Saved Comparisons")')).toBeVisible();
  });

  test('should navigate to Browse Vendors', async ({ page }) => {
    await page.click('text=Browse Vendors');
    await page.waitForURL('**/vendors');
    expect(page.url()).toContain('/vendors');
  });
});
