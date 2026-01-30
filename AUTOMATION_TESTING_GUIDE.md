# Automation Testing Guide: eyeBridge
## Structure, Order, Fixtures & Best Practices

---

## 1. TESTING FRAMEWORK & ARCHITECTURE

### Framework: Playwright (JavaScript/TypeScript)
- **Configuration**: `playwright.config.js` (root level)
- **Test Locations**: `/tests/` (UI tests) and `/playwright/` (smoke tests)
- **Run Locally**: `npm test` / `npm run test:ui`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retry Strategy**: 2 retries in CI, 0 locally
- **Screenshots/Videos**: Captured on failure automatically

### Secondary Framework: Cypress
- **Configuration**: `cypress.config.ts`
- **Location**: `/cypress/e2e/` 
- **Status**: Available but Playwright is primary

---

## 2. TEST DIRECTORY STRUCTURE

```
eyeBridge/
├── tests/                          # Primary UI tests (Playwright)
│   ├── README.md                   # Test documentation
│   ├── TEST_IDS.md                # Complete reference of all data-testid attributes
│   ├── auth.setup.js              # Authentication setup for all tests
│   ├── password-gate.spec.js      # Password gate tests
│   ├── home.spec.js               # Home page tests
│   ├── login.spec.js              # Login form & auth tests
│   ├── dashboard.spec.js          # Dashboard after login
│   ├── vendors.spec.js            # Vendor directory & filtering
│   ├── mobile-responsive.spec.js  # Mobile viewport testing (iPhone SE: 375x667)
│   │
│   ├── api/                        # API test helpers & fixtures
│   │   └── fixtures/
│   │       ├── test-data.js       # Test users, constants, data cleanup functions
│   │       └── auth-helpers.js    # registerUser(), loginUser(), API helpers
│   │
│   └── ui/
│       └── login.spec.js          # Additional UI login tests
│
├── playwright/
│   └── smoke.spec.ts              # Post-deployment smoke tests (production)
│
├── cypress/                        # Cypress tests (secondary)
│   ├── e2e/                       # End-to-end tests
│   ├── support/                   # Cypress helpers
│   └── examples/
│
└── playwright.config.js            # Main Playwright configuration
```

---

## 3. FIXTURE STRUCTURE & TEST DATA MANAGEMENT

### Location: `/tests/api/fixtures/`

#### **test-data.js** - Central Test Data Repository
Provides consistent test data across all tests via exports:

```javascript
// API Configuration
export const API_URL = 'http://localhost:3001/api'
export const BASE_URL = 'http://localhost:5173'

// Valid Test Users (5 scenarios)
export const TEST_USERS = {
  validUser,          // Standard user for happy path
  minimalUser,        // Minimal required fields
  specialCharUser,    // Special characters & accents
  internationalUser,  // Non-Latin characters (Chinese)
  longInputUser       // Maximum length inputs
}

// Invalid Test Data (8 scenarios)
export const INVALID_USERS = {
  noEmail,
  invalidEmailFormat,
  shortPassword,
  noUppercase,
  noLowercase,
  noNumber,
  noSpecialChar,
  tooLongPassword
}

// Test Credentials (Real accounts for smoke testing)
export const SMOKE_TEST_CREDENTIALS = {
  email: 'sdrindahl@gmail.com',
  password: 'Jessie34!!'  // 💡 Use env variables in production
}

// Password Gate
export const PASSWORD_GATE = {
  password: 'eyebridges2025'
}

// Utility Functions
export function testDataCleanup.generateTestUser()
```

#### **auth-helpers.js** - Reusable Authentication Functions
```javascript
// Core functions
registerUser(userData)     // Register + return token, userId, user
loginUser(email, password) // Login + return token, userId, user
bypassPasswordGate(page)   // Enter password & verify gate closed
```

### Usage Pattern
```javascript
// In any test file:
import { TEST_USERS, API_URL, loginUser } from './api/fixtures/test-data.js'
import { bypassPasswordGate } from './api/fixtures/auth-helpers.js'

test('example', async ({ page }) => {
  // Use pre-defined test data
  const { email, password } = TEST_USERS.validUser
  
  // Use helper functions
  const { token, user } = await loginUser(email, password)
})
```

---

## 4. TEST EXECUTION ORDER & LIFECYCLE

### **Phase 1: Setup (Before All Tests)**
1. ✅ Dev server starts automatically (`webServer` in playwright.config.js)
2. ✅ Base URL set to `http://localhost:5173`
3. ✅ Database initialized with test data

### **Phase 2: Pre-Test (beforeEach)**
Each test follows this pattern:
```javascript
test.beforeEach(async ({ page }) => {
  // 1. Navigate to base URL
  await page.goto('/')
  
  // 2. Bypass password gate (critical!)
  await bypassPasswordGate(page)
  
  // 3. Login if needed
  await loginUser(TEST_USERS.validUser.email, password)
  
  // 4. Wait for load
  await page.waitForLoadState('networkidle')
})
```

### **Phase 3: Test Execution**
Each test:
- Uses `data-testid` selectors (most reliable)
- Uses `getByRole()` for semantic elements (h1, button, etc.)
- Waits for network idle before assertions
- Handles cross-browser visibility with `scrollIntoViewIfNeeded()`

### **Phase 4: Post-Test (afterEach)**
- Screenshots/videos on failure (auto)
- Cleanup if needed (manual in some tests)

### **Test Execution Strategy**
| Scenario | Execution | Speed |
|----------|-----------|-------|
| Local Development | All 5 browsers | 8-10 min |
| CI Pipeline | Chromium only | 1-2 min |
| Smoke Tests | Chromium only | 45-60 sec |

---

## 5. TEST FILE BREAKDOWN & RESPONSIBILITY

### **password-gate.spec.js** → Password Protection
- Tests password gate display on first visit
- Validates correct/incorrect password handling
- Verifies session persistence

### **home.spec.js** → Landing Page
- Branding & navigation visibility
- Logo functionality
- Statistics display
- Auth state (logged in vs out)

### **login.spec.js** → Authentication Entry
- Form validation (email format, password strength)
- Error message assertions
- Successful login redirect
- Credential handling

### **dashboard.spec.js** → Post-Login Dashboard
- Dashboard stats cards (Favorites, Searches, Contacted, Comparisons)
- Search functionality
- Filter operations
- **Logout button** (cross-browser compatible)
- Navigation between pages

### **vendors.spec.js** → Vendor Directory
- Vendor card display (requires "View All" button click first)
- Category filtering
- Product filtering
- Search functionality
- Vendor modal interactions
- Compare feature

### **mobile-responsive.spec.js** → Mobile Viewport Testing
- iPhone SE viewport (375x667)
- Mobile-specific selectors (search input changes)
- Button visibility on mobile
- Touch interactions

### **smoke.spec.ts** → Post-Deployment Production Tests
- Health check: `GET /api/health`
- Unauthenticated pages (home, login, vendors)
- Authenticated pages (dashboard)
- Password gate handling
- Uses `sdrindahl@gmail.com` / `Jessie34!!` credentials
- **Runs in GitHub Actions after Vercel deployment**

---

## 6. SELECTOR HIERARCHY & BEST PRACTICES

### **Priority Order** (Most to Least Reliable)
1. **data-testid** ✅ Best - Explicit, maintainable
   ```javascript
   page.getByTestId('logout-button')
   page.getByTestId('vendor-card')
   ```

2. **Semantic Roles** ✅ Good - Accessible, readable
   ```javascript
   page.getByRole('button', { name: 'Login' })
   page.getByRole('heading', { name: 'Dashboard' })
   page.getByRole('textbox', { name: 'Email' })
   ```

3. **Aria Labels** ⚠️ Sometimes - If roles unavailable
   ```javascript
   page.getByLabel('Search vendors')
   ```

4. **CSS Selectors** ❌ Avoid - Fragile, breaks on design changes
   ```javascript
   page.locator('.btn-primary')  // DON'T USE
   ```

5. **XPath** ❌ Never - Slowest, hardest to maintain
   ```javascript
   page.locator('//button[text()="Login"]')  // NEVER
   ```

### **Reference**: [TEST_IDS.md](TEST_IDS.md)
Complete list of all available `data-testid` attributes in the application.

---

## 7. CRITICAL TEST PATTERNS

### **Pattern 1: Password Gate Bypass**
```javascript
async function bypassPasswordGate(page) {
  const gateDiv = page.getByTestId('password-gate')
  const isVisible = await gateDiv.isVisible().catch(() => false)
  
  if (isVisible) {
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill('eyebridges2025')
    await page.locator('button:has-text("Unlock")').click()
    await page.waitForSelector('[data-testid="password-gate"]', { state: 'hidden' })
  }
}
```

### **Pattern 2: Login Flow**
```javascript
async function loginAndNavigate(page, email, password) {
  await page.goto('/login')
  await page.getByTestId('email-input').fill(email)
  await page.getByTestId('password-input').fill(password)
  await page.getByRole('button', { name: 'Sign In' }).click()
  
  // Wait for dashboard redirect
  await page.waitForURL('**/dashboard')
  await page.waitForLoadState('networkidle')
}
```

### **Pattern 3: Vendor Loading (Critical!)**
```javascript
test('should filter vendors', async ({ page }) => {
  // 1. FIRST: Click "View All" button (vendors hidden by default)
  await page.getByRole('button', { name: 'View All' }).click()
  
  // 2. THEN: Wait for vendor cards to load
  await page.waitForSelector('[data-testid="vendor-card"]', { timeout: 15000 })
  
  // 3. NOW: Apply filters or search
  await page.getByTestId('category-dropdown').selectOption('Contact Lenses')
  
  // 4. VERIFY: Cards updated
  const cards = await page.locator('[data-testid="vendor-card"]').count()
  expect(cards).toBeGreaterThan(0)
})
```

### **Pattern 4: Cross-Browser Visibility** (Firefox Fix)
```javascript
// For elements that fail in Firefox:
await page.getByTestId('logout-button').scrollIntoViewIfNeeded()
await page.getByTestId('logout-button').click()
```

### **Pattern 5: Mobile-Specific Testing**
```javascript
test('mobile search input', async ({ page }) => {
  // Mobile search has different placeholder
  const mobileSearch = page.locator('input[placeholder="Search..."]')
  
  // Verify it's visible on mobile
  await expect(mobileSearch).toBeVisible()
})
```

---

## 8. ENVIRONMENT & CREDENTIALS

### **Local Testing**
```bash
# .env (optional, uses defaults)
API_URL=http://localhost:3001/api
BASE_URL=http://localhost:5173
```

### **CI/CD Testing (GitHub Actions)**
```yaml
# Environment variables in GitHub Actions
SMOKE_TEST_EMAIL: sdrindahl@gmail.com
SMOKE_TEST_PASSWORD: Jessie34!!
```

### **Production Smoke Tests**
- Run against: `https://eye-bridge.vercel.app`
- Uses GitHub secrets for credentials
- Triggered: After Vercel deployment
- Creates GitHub issues on failure with 🚨 tag

### **🔐 Security Best Practices**
- ✅ Use test accounts, not real user accounts
- ✅ Store credentials in GitHub secrets (not in code)
- ✅ Use `process.env` for sensitive data
- ✅ Rotate credentials periodically
- ✅ Never commit `.env` files

---

## 9. TEST COMMANDS & CI/CD

### **Local Development**
```bash
# Run all tests
npm test

# Run in UI mode (interactive debugging)
npm run test:ui

# Run in debug mode (with browser visible)
npm run test:debug

# Run specific test file
npx playwright test tests/dashboard.spec.js

# Run specific test
npx playwright test -g "should display stats cards"

# Run on specific browser
npx playwright test --project=firefox

# View HTML report
npm run test:report
```

### **CI/CD Pipeline** (GitHub Actions)
```yaml
# Triggers: deployment_status success OR manual workflow_dispatch
# Location: .github/workflows/post-deploy-smoke-tests.yml

Jobs:
1. Install dependencies
2. Run smoke tests (Chromium only)
3. On failure: Create GitHub issue with 🚨 tag
4. Generate test report
```

### **Optimization: Smoke Tests**
- **Before**: 3+ minutes (all 5 browsers)
- **After**: 1-2 minutes (Chromium only + caching)
- **Strategy**: Run full browser suite locally, minimal in CI

---

## 10. BEST PRACTICES CHECKLIST

### ✅ Test Organization
- [ ] One test file per page/feature
- [ ] Descriptive test names (`should display...`, `should handle...`)
- [ ] Arrange-Act-Assert pattern
- [ ] Group related tests with `test.describe()`

### ✅ Fixtures & Data
- [ ] Use centralized fixture data from `/tests/api/fixtures/`
- [ ] Create test users in fixtures, not in tests
- [ ] Use environment variables for credentials
- [ ] Clean up test data in afterEach (optional)

### ✅ Selectors
- [ ] Prefer `data-testid` over CSS classes
- [ ] Use semantic roles (`getByRole`)
- [ ] Avoid magic selectors (nth-child, etc.)
- [ ] Update TEST_IDS.md when adding new test IDs

### ✅ Waits & Timing
- [ ] Always use `waitForLoadState('networkidle')` before assertions
- [ ] Specific waits: `waitForSelector()`, `waitForURL()`, `waitForNavigation()`
- [ ] Never use arbitrary `sleep()` / `delay()` - only debug
- [ ] Set appropriate timeouts: 15000ms for vendor loading, 10000ms for UI

### ✅ Cross-Browser
- [ ] Test on Chromium, Firefox, WebKit locally (before push)
- [ ] Use `scrollIntoViewIfNeeded()` for Firefox visibility issues
- [ ] Check element clickability, not just existence
- [ ] Verify responsive behavior on mobile viewports

### ✅ Error Handling
- [ ] Use `test.skip()` for conditional tests
- [ ] Gracefully skip authenticated tests if login fails
- [ ] Capture full page state on failure (screenshots done auto)
- [ ] Check error messages match actual responses

### ✅ Code Quality
- [ ] Extract common setup into `beforeEach`
- [ ] Extract common actions into helper functions
- [ ] Comment non-obvious test logic
- [ ] Use constants from fixtures, not hardcoded values

---

## 11. COMMON ISSUES & SOLUTIONS

| Issue | Solution |
|-------|----------|
| **"Element not found"** | Use `data-testid`, verify password gate bypassed |
| **"Timeout waiting for vendor"** | Click "View All" button first, check filters |
| **"Logout fails in Firefox"** | Use `scrollIntoViewIfNeeded()` before click |
| **"Mobile tests fail"** | Check responsive breakpoints, update selectors |
| **"Smoke tests too slow"** | Run Chromium only (not all 5 browsers) |
| **"Test passes locally, fails in CI"** | Check environment variables, test credentials |
| **"Password gate blocks test"** | Add `bypassPasswordGate()` to beforeEach |
| **"Strict mode errors"** | Use `getByRole()` instead of `locator('text=...')` |

---

## 12. QUICK REFERENCE: TEST EXECUTION PATH

### **New Test Workflow**
1. Create `/tests/new-feature.spec.js`
2. Import fixtures: `import { TEST_USERS } from './api/fixtures/test-data.js'`
3. Set up beforeEach with password gate + login
4. Write tests using `data-testid` selectors
5. Add new test IDs to `TEST_IDS.md`
6. Run: `npm run test:ui` (for debugging)
7. Run: `npm test` (verify all browsers)
8. Commit and push

### **Adding New Test Data**
1. Open `/tests/api/fixtures/test-data.js`
2. Add to appropriate export (TEST_USERS, INVALID_USERS, etc.)
3. Use timestamps for uniqueness: `test-${Date.now()}@eyebridge.test`
4. Reference in tests as needed
5. No code changes needed - imports are dynamic

### **Debugging Failed Tests**
1. Run: `npm run test:ui`
2. Choose test in sidebar
3. Step through with debugger controls
4. Use browser DevTools via Inspector
5. Check screenshots/videos in `test-results/` folder

---

## 13. FILE LOCATIONS & KEY REFERENCES

| Purpose | File |
|---------|------|
| Test Configuration | `playwright.config.js` |
| Test Data & Fixtures | `tests/api/fixtures/test-data.js` |
| Auth Helpers | `tests/api/fixtures/auth-helpers.js` |
| Test ID Reference | `tests/TEST_IDS.md` |
| Test Documentation | `tests/README.md` |
| Smoke Tests | `playwright/smoke.spec.ts` |
| CI/CD Pipeline | `.github/workflows/post-deploy-smoke-tests.yml` |

---

## 14. SUMMARY: BEST PRACTICES FRAMEWORK

```
┌─────────────────────────────────────────────────────────┐
│              TESTING EXCELLENCE PYRAMID                 │
├─────────────────────────────────────────────────────────┤
│  🎯 GOAL: Fast, Reliable, Maintainable Tests            │
│                                                         │
│  Layer 4: Fixtures & Data Management                   │
│  ├─ Centralized test data in fixtures/                 │
│  ├─ Environment variables for credentials              │
│  └─ Utility functions for common operations            │
│                                                         │
│  Layer 3: Smart Selectors                              │
│  ├─ Prefer data-testid (most reliable)                 │
│  ├─ Use semantic roles (getByRole)                     │
│  └─ Avoid CSS selectors and XPath                      │
│                                                         │
│  Layer 2: Proper Waits                                 │
│  ├─ waitForLoadState('networkidle')                    │
│  ├─ waitForSelector() for dynamic elements             │
│  └─ Never use arbitrary delays                         │
│                                                         │
│  Layer 1: Cross-Browser Testing                        │
│  ├─ Test locally on all 5 browsers                     │
│  ├─ Run Chromium only in CI/CD (speed)                 │
│  └─ Fix Firefox visibility with scrollIntoViewIfNeeded |
│                                                         │
│  Base: Test Organization                               │
│  ├─ One file per feature                               │
│  ├─ Clear describe/test structure                      │
│  └─ beforeEach/afterEach patterns                      │
└─────────────────────────────────────────────────────────┘
```

---

**Last Updated**: January 30, 2026
**Framework**: Playwright 1.40+
**Status**: ✅ Production Ready
