import { test, expect } from '@playwright/test';

test.describe('Password Gate', () => {
  test('should display password gate on first visit', async ({ page }) => {
    await page.goto('/');
    
    // Check for password gate elements
    await expect(page.locator('h1')).toContainText('Eye Bridges');
    await expect(page.getByText('This site is currently in development')).toBeVisible();
    await expect(page.getByLabel('Access Password')).toBeVisible();
  });

  test('should reject incorrect password', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.getByText('Incorrect password')).toBeVisible();
    
    // Should clear password field
    await expect(page.locator('input[type="password"]')).toHaveValue('');
  });

  test('should accept correct password and show home page', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
    
    // Should redirect to home page
    await expect(page.locator('text=Eye Bridges')).toBeVisible();
    await expect(page.getByRole('link', { name: /Browse Vendors/i })).toBeVisible();
  });

  test('should remember authentication in session', async ({ page }) => {
    await page.goto('/');
    
    // Authenticate
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
    
    // Navigate away and back
    await page.goto('/vendors');
    await page.goto('/');
    
    // Should not show password gate again
    await expect(page.locator('input[type="password"]')).not.toBeVisible();
  });
});
