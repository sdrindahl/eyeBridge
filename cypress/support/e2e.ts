// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Disable uncaught exception handling for development
Cypress.on('uncaught:exception', (err, runnable) => {
  return false
})

// Test Credentials
export const TEST_EMAIL = 'vikings@gmail.com'
export const TEST_PASSWORD = 'Vikings34!!' // Must have: uppercase, lowercase, number, and special char
