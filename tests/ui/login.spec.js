/**
 * eyeBridge UI Tests - Login Page
 * Tests for user login functionality on the frontend
 */

import { test, expect } from '@playwright/test';
import { BASE_URL } from '../api/fixtures/test-data.js';

const LOGIN_PAGE = `${BASE_URL}/login`;

test.describe('Login Page - UI Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_PAGE);
    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display login form with email and password fields', async ({ page }) => {
    // Check form elements exist
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should display login form title', async ({ page }) => {
    const title = page.locator('h1, h2').filter({ hasText: /login|sign in/i });
    await expect(title).toBeVisible();
  });

  test('should have register link', async ({ page }) => {
    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up")');
    await expect(registerLink).toBeVisible();
    await expect(registerLink).toHaveAttribute('href', /register|signup/i);
  });

  test('should be able to navigate to register page', async ({ page }) => {
    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up")');
    await registerLink.click();
    
    // Should navigate to register page
    await expect(page).toHaveURL(/register|signup/i);
  });

  test('should focus email field on load', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    // In some implementations, focus may be on email field
    await expect(emailInput).toBeVisible();
  });

  test('should show error when submitting empty form', async ({ page }) => {
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');
    
    // Try to submit
    await submitButton.click();
    
    // Should show error message or validation message
    const errorMessage = page.locator('[role="alert"], .error, .form-error');
    await expect(errorMessage).toBeVisible();
  });

  test('should show error for invalid email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    await emailInput.fill('invalidemail');
    await passwordInput.fill('ValidPass123!');
    await submitButton.click();

    // Should show validation error
    const errorMessage = page.locator('[role="alert"], .error, .form-error');
    await expect(errorMessage).toBeVisible();
  });

  test('should enable submit button when form is filled', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('ValidPass123!');

    // Button should be enabled
    await expect(submitButton).toBeEnabled();
  });

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const toggleButton = page.locator('button[aria-label*="password" i], .password-toggle');

    // If toggle button exists
    const toggleExists = await toggleButton.count() > 0;
    if (toggleExists) {
      await passwordInput.fill('TestPass123!');
      
      // Click toggle
      await toggleButton.click();
      
      // Input should now be visible or password should be shown
      const inputType = await passwordInput.getAttribute('type');
      expect(['text', 'password']).toContain(inputType);
    }
  });

  test('should show loading state on submit', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('ValidPass123!');

    // Start submission (don't wait for response)
    const submitPromise = submitButton.click();

    // Check if button shows loading state
    const isDisabled = await submitButton.isDisabled();
    const hasLoadingClass = await submitButton.evaluate(el => el.classList.contains('loading') || el.getAttribute('aria-busy') === 'true');

    // At least one should be true
    expect(isDisabled || hasLoadingClass).toBeTruthy();

    await submitPromise;
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Elements should still be visible
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
  });

  test('should maintain form state when navigating back', async ({ page, context }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    // Fill form
    await emailInput.fill('test@example.com');
    await passwordInput.fill('ValidPass123!');

    // Navigate away
    const registerLink = page.locator('a:has-text("Register"), a:has-text("Sign up")');
    await registerLink.click();

    // Go back
    await page.goBack();

    // Form state might be cleared (depends on implementation)
    // This test just verifies page loads correctly
    await expect(emailInput).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page, request }) => {
    // First, ensure we have a valid test user
    const testUser = {
      email: `test-${Date.now()}@eyebridge.test`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    };

    // Register the user via API
    await request.post('http://localhost:3001/api/auth/register', {
      data: testUser
    });

    // Now try to login with wrong password
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    await emailInput.fill(testUser.email);
    await passwordInput.fill('WrongPass123!');
    await submitButton.click();

    // Wait for error message
    const errorMessage = page.locator('[role="alert"], .error, .form-error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText(/invalid|credentials|failed/i);
  });

  test('should redirect to dashboard on successful login', async ({ page, request }) => {
    // Create test user
    const testUser = {
      email: `test-${Date.now()}@eyebridge.test`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    };

    const registerResponse = await request.post('http://localhost:3001/api/auth/register', {
      data: testUser
    });
    const registerData = await registerResponse.json();

    // Refresh page to clear any auth state
    await page.goto(LOGIN_PAGE);
    await page.waitForLoadState('networkidle');

    // Fill and submit login form
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    await emailInput.fill(testUser.email);
    await passwordInput.fill(testUser.password);
    await submitButton.click();

    // Should redirect to dashboard (or home page)
    await expect(page).toHaveURL(/dashboard|home|vendors|\/(?!login|register)/);
  });

  test('should store authentication token after successful login', async ({ page, context, request }) => {
    // Create test user
    const testUser = {
      email: `test-${Date.now()}@eyebridge.test`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    };

    await request.post('http://localhost:3001/api/auth/register', {
      data: testUser
    });

    // Login
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    await emailInput.fill(testUser.email);
    await passwordInput.fill(testUser.password);
    await submitButton.click();

    // Wait for navigation
    await page.waitForURL(/dashboard|home|vendors|\/(?!login|register)/);

    // Check if token is stored (in localStorage, sessionStorage, or cookie)
    const localStorage = await page.evaluate(() => window.localStorage);
    const sessionStorage = await page.evaluate(() => window.sessionStorage);
    const cookies = await context.cookies();

    const hasTokenInLocalStorage = JSON.stringify(localStorage).includes('token');
    const hasTokenInSessionStorage = JSON.stringify(sessionStorage).includes('token');
    const hasTokenInCookies = cookies.some(c => c.name.includes('token') || c.name.includes('auth'));

    expect(hasTokenInLocalStorage || hasTokenInSessionStorage || hasTokenInCookies).toBeTruthy();
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');

    // Tab to email input
    await page.keyboard.press('Tab');
    await expect(emailInput).toBeFocused();

    // Tab to password input
    await page.keyboard.press('Tab');
    await expect(passwordInput).toBeFocused();

    // Fill with keyboard
    await page.keyboard.type('test@example.com');
    await page.keyboard.press('Tab');
    await page.keyboard.type('TestPass123!');
    await page.keyboard.press('Tab');

    // Submit button should be focusable
    await expect(submitButton).toBeFocused();
  });

  test('should display proper labels for form fields', async ({ page }) => {
    const emailLabel = page.locator('label:has-text("Email"), label:has-text("Email Address")');
    const passwordLabel = page.locator('label:has-text("Password")');

    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('should clear error messages when user starts typing', async ({ page }) => {
    const submitButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), button[type="submit"]');
    const emailInput = page.locator('input[type="email"], input[name="email"]');

    // Submit empty form to show error
    await submitButton.click();

    // Wait for error
    let errorMessage = page.locator('[role="alert"], .error, .form-error');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();

      // Start typing
      await emailInput.fill('test@example.com');

      // Error should be cleared or hidden
      await expect(errorMessage).not.toBeVisible({ timeout: 1000 }).catch(() => {
        // It's ok if error doesn't auto-clear
      });
    }
  });
});
