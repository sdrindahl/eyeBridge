# Cypress Test Suite for Eye Bridges

This directory contains comprehensive end-to-end (E2E) tests for the Eye Bridges application using Cypress with TypeScript.

## Test Files Overview

### 1. **auth.cy.ts** - Authentication Tests
- Login page validation
- Email and password field validation
- Email format validation
- Invalid credentials handling
- Successful login flow
- Loading states
- Links to register and home pages
- **Tests: 9**

### 2. **login.cy.ts** - Duplicate/Extended Login Tests
- Complete login flow variations
- Form field visibility
- Credential validation
- Error message display
- **Tests: 9**

### 3. **dashboard.cy.ts** - Dashboard Page Tests
- Dashboard title and user email display
- Quick Stats section with 4 cards
- Favorite Vendors section
- Recent Searches section
- Saved Comparisons section
- Section collapsing functionality
- Search and filter navigation
- Vendor modal interactions
- **Tests: 14**

### 4. **vendors.cy.ts** - Vendor Browsing Tests
- Vendors page display
- Category filtering
- Product filtering
- Search functionality
- Vendor card display
- Vendor modal operations
- Add/remove favorites
- Add to comparison
- Search result highlighting
- Responsive layout
- **Tests: 18**

### 5. **register.cy.ts** - Registration Tests
- Registration page display
- Email validation
- Password validation
- Confirm password matching
- Links to login and home
- **Tests: 7**

### 6. **reviews.cy.ts** - Vendor Reviews & Ratings
- Review section display
- Review form toggle
- Star rating interaction
- Review submission
- User rating display
- Validation checks
- Star hover effects
- Existing reviews display
- **Tests: 9**

### 7. **comparisons.cy.ts** - Vendor Comparison Tests
- Comparison button display
- Add vendors to comparison
- Multiple vendor comparison
- Remove from comparison
- Comparison view display
- Vendor details in comparison
- Clear all comparisons
- Save comparisons
- Comparison count limits
- Persistence on reload
- **Tests: 11**

### 8. **search.cy.ts** - Search Functionality
- Search history display
- Add search to history
- Search history dropdown
- Search from history
- Clear search history
- Filter combinations
- Text highlighting
- Case-insensitive search
- Search clearing
- No results handling
- Maintain filters on reload
- **Tests: 11**

### 9. **navigation.cy.ts** - Navigation & Routing
- Page navigation
- Navigation menu display
- Menu highlighting
- Search parameter navigation
- Browser back/forward buttons
- Internal link following
- Mobile navigation menu
- Invalid route handling
- **Tests: 18**

### 10. **responsive.cy.ts** - Responsive Design Tests
- Mobile layout (iPhone X)
- Tablet layout (iPad)
- Desktop layout (MacBook)
- Mobile navigation
- Vendor card stacking
- Touch interactions
- Responsive images
- **Tests: 11**

### 11. **edge-cases.cy.ts** - Error Handling & Edge Cases
- Network error handling
- Server timeout handling
- Connection error handling
- 500 error handling
- Input validation
- Special characters handling
- Very long input handling
- Empty search handling
- Session management
- Token expiration
- Session persistence
- Browser back/forward
- Modal edge cases
- Data loading states
- Double form submission prevention
- Error message clearing
- **Tests: 28+**

## Total Test Coverage
Approximately **135+ test cases** covering:
- ✅ Authentication & Authorization
- ✅ User Dashboard & Statistics
- ✅ Vendor Browsing & Filtering
- ✅ Search Functionality
- ✅ Comparisons & Favorites
- ✅ Reviews & Ratings
- ✅ Navigation & Routing
- ✅ Responsive Design
- ✅ Error Handling
- ✅ Edge Cases & Performance

## Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Cypress (installed via `npm install --save-dev cypress`)

### Installation

```bash
# Install dependencies
npm install

# Install Cypress-specific packages
npm install --save-dev cypress typescript @types/node
```

### Running Tests

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all tests headless (background)
npm run cypress:run

# Run tests with browser visible (headed mode)
npm run cypress:run:headed

# Run tests in debug mode
npm run cypress:run:debug

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# Run tests in Chrome
npx cypress run --browser chrome

# Run tests in Firefox
npx cypress run --browser firefox
```

## Test Structure

Each test follows this pattern:
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup: Bypass password gate and login if needed
  })

  it('should do something specific', () => {
    // Arrange: Navigate to page
    // Act: Perform action
    // Assert: Verify result
  })
})
```

## Key Selectors

Tests use `data-testid` attributes for reliability:
- `[data-testid="login-card"]` - Login form container
- `[data-testid="dashboard-title"]` - Dashboard page title
- `[data-testid="vendor-card"]` - Individual vendor card
- `[data-testid="quick-stats"]` - Quick stats section
- `[data-testid="vendor-modal"]` - Vendor detail modal

## Custom Commands

Located in `cypress/support/commands.ts`:
- `cy.login(email, password)` - Login to application
- `cy.logout()` - Logout from application

## Configuration

Cypress configuration is in `cypress.config.ts`:
- Base URL: `http://localhost:5173`
- Viewport: 1280x720 (default)
- Screenshots on failure: enabled
- Video recording: disabled

## Important Notes

1. **Password Gate**: All tests bypass the initial password gate with `eyebridges2025`
2. **Test Credentials**: Use `test@example.com` / `Test@123` for login tests
3. **Data-TestId Attributes**: Some tests may need your components to have `data-testid` attributes
4. **Timing**: Tests include waits for API responses and animations
5. **Isolation**: Each test is independent and cleans up after itself

## Continuous Integration

To run tests in CI/CD pipelines:

```bash
# Run in CI mode (exits after completion)
npm run cypress:run

# Generate reports
npm run cypress:run -- --reporter junit --reporter-options mochaFile=results/cypress-results.xml
```

## Debugging Tips

```bash
# Debug specific test
npx cypress run --spec "cypress/e2e/auth.cy.ts" --headed --no-exit

# Open browser DevTools in Cypress Test Runner
# Use browser.pause() in test code

# View test execution with time stamps
npx cypress run --headed --config video=true
```

## Best Practices

1. ✅ Use `data-testid` attributes instead of class selectors
2. ✅ Wait for elements instead of using fixed delays
3. ✅ Group related tests using `describe()`
4. ✅ Clean up state in `beforeEach()` hooks
5. ✅ Use meaningful test descriptions
6. ✅ Avoid testing implementation details
7. ✅ Keep tests independent

## Troubleshooting

### Tests Fail Intermittently
- Increase timeout: `cy.get('selector', { timeout: 10000 })`
- Add explicit waits: `cy.wait('@apiCall')`
- Use `cy.waitForUrl()` for navigation

### Element Not Found
- Verify `data-testid` exists in component
- Check selector specificity
- Use `cy.debug()` to inspect state

### Flaky Tests
- Avoid hardcoded delays
- Use explicit waits
- Mock API responses for consistency
- Clear cache between tests

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Testing Library Selectors](https://testing-library.com/)

## Contributing

When adding new features to Eye Bridges:
1. Add corresponding test cases
2. Update this README
3. Ensure all tests pass before merging
4. Maintain test naming conventions
5. Add meaningful descriptions to tests

## Maintenance

- Review and update tests when UI changes
- Remove tests for deprecated features
- Refactor common test patterns into helper functions
- Keep test data synchronized with application
- Monitor test execution times (goal: < 10s per test)
