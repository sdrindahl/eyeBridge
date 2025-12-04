# Playwright Test Automation

This directory contains end-to-end tests for the Eye Bridges platform using Playwright.

## Test Structure

```
tests/
├── auth.setup.js           # Authentication setup for tests
├── password-gate.spec.js   # Password gate tests
├── home.spec.js            # Home page tests
├── vendors.spec.js         # Vendor directory tests
├── login.spec.js           # Login page tests
├── dashboard.spec.js       # Dashboard tests
└── mobile-responsive.spec.js # Mobile responsiveness tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in debug mode
```bash
npm run test:debug
```

### Run specific test file
```bash
npx playwright test tests/vendors.spec.js
```

### Run tests in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run tests on specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### View test report
```bash
npm run test:report
```

## Test Coverage

### Password Gate Tests
- ✅ Display password gate on first visit
- ✅ Reject incorrect password
- ✅ Accept correct password
- ✅ Remember authentication in session

### Home Page Tests
- ✅ Display branding and tagline
- ✅ Navigation links work
- ✅ Vendor statistics display
- ✅ Logo navigation
- ✅ Logged in vs logged out states

### Vendors Page Tests
- ✅ Display vendor directory
- ✅ Filter by category
- ✅ Search by name
- ✅ Clear filters
- ✅ Open vendor modal
- ✅ Add to favorites (when logged in)
- ✅ Compare vendors
- ✅ Product filtering after category selection

### Login Page Tests
- ✅ Display login form
- ✅ Validate empty fields
- ✅ Validate email format
- ✅ Validate password requirements
- ✅ Successful login
- ✅ Navigation elements

### Dashboard Tests
- ✅ Display dashboard after login
- ✅ Quick Stats cards
- ✅ Clickable stats navigation
- ✅ Search functionality
- ✅ Navigate to vendors with params
- ✅ Logout functionality
- ✅ All sections visible

### Mobile Responsiveness Tests
- ✅ Mobile-friendly headers on all pages
- ✅ Touch-friendly buttons
- ✅ Responsive layouts
- ✅ Mobile modals

## Configuration

The Playwright configuration is in `playwright.config.js`. Key settings:

- **Base URL**: http://localhost:5173
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Auto-start dev server**: Yes
- **Screenshots**: On failure
- **Videos**: On failure
- **Trace**: On first retry

## Writing New Tests

### Basic test structure:
```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Bypass password gate
    await page.goto('/');
    await page.fill('input[type="password"]', 'eyebridges2025');
    await page.click('button[type="submit"]');
  });

  test('should do something', async ({ page }) => {
    await page.goto('/some-page');
    await expect(page.locator('h1')).toContainText('Expected Text');
  });
});
```

### Tips:
1. Always bypass password gate in `beforeEach`
2. Use semantic locators (`getByRole`, `getByText`)
3. Add waits for dynamic content (`waitForTimeout`, `waitForSelector`)
4. Test both logged in and logged out states
5. Test mobile viewports for responsive features

## Continuous Integration

Tests are configured to run in CI with:
- Retries: 2 attempts
- Workers: 1 (sequential)
- Reporter: HTML

To run in CI mode locally:
```bash
CI=true npm test
```

## Troubleshooting

### Tests failing with "Password gate not found"
Make sure the dev server is running on port 5173.

### Timeout errors
Increase timeout in specific tests:
```javascript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Element not found
Add explicit waits:
```javascript
await page.waitForSelector('button:has-text("Click me")');
```

## Authentication

The `auth.setup.js` file handles authentication for tests that need a logged-in user. It saves the authenticated state to `playwright/.auth/user.json`.

## Best Practices

1. ✅ Keep tests independent (no shared state)
2. ✅ Use data-testid for complex selectors
3. ✅ Test user flows, not implementation
4. ✅ Mock external APIs when needed
5. ✅ Keep tests fast (< 30 seconds each)
6. ✅ Use meaningful test descriptions
7. ✅ Group related tests with `test.describe`
8. ✅ Clean up after tests (logout, clear storage)
