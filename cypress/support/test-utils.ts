/**
 * Test utilities and helpers for Cypress tests
 */

// Common test data
export const TEST_CREDENTIALS = {
  email: 'test@example.com',
  password: 'Test@123',
  invalidEmail: 'invalid@example.com',
  invalidPassword: 'wrongpassword',
  passwordGate: 'eyebridges2025',
}

export const TEST_TIMEOUTS = {
  short: 2000,
  medium: 5000,
  long: 10000,
  api: 8000,
}

export const TEST_SELECTORS = {
  // Auth
  loginCard: '[data-testid="login-card"]',
  loginForm: '[data-testid="login-form"]',
  loginError: '[data-testid="login-error"]',
  emailInput: 'input[type="email"]',
  passwordInput: 'input[type="password"]',
  submitButton: 'button[type="submit"]',

  // Dashboard
  dashboardTitle: '[data-testid="dashboard-title"]',
  quickStats: '[data-testid="quick-stats"]',
  favoritesSection: '[data-testid="favorite-vendors-section"]',
  recentSearchesSection: '[data-testid="recent-searches-section"]',
  comparisonsSection: '[data-testid="saved-comparisons-section"]',

  // Vendors
  vendorCard: '[data-testid="vendor-card"]',
  vendorModal: '[data-testid="vendor-modal"]',
  closeModal: '[data-testid="close-modal"]',
  favoriteBtn: '[data-testid="favorite-btn"]',
  compareBtn: '[data-testid="compare-btn"]',

  // Navigation
  mainNav: '[data-testid="main-nav"]',
  mobileMenuToggle: '[data-testid="mobile-menu-toggle"]',
  mobileNav: '[data-testid="mobile-nav"]',

  // Search
  searchInput: 'input[placeholder*="Search"]',
  searchButton: 'button[contains(text(), "Search")]',
}

// Common helper functions
export const loginUser = (email = TEST_CREDENTIALS.email, password = TEST_CREDENTIALS.password) => {
  cy.visit('/login')
  cy.get(TEST_SELECTORS.emailInput).type(email)
  cy.get(TEST_SELECTORS.passwordInput).type(password)
  cy.get(TEST_SELECTORS.submitButton).click()
}

export const bypassPasswordGate = () => {
  cy.visit('/')
  cy.get('input[type="password"]').type(TEST_CREDENTIALS.passwordGate)
  cy.get('button[type="submit"]').click()
}

export const navigateToDashboard = () => {
  bypassPasswordGate()
  loginUser()
  cy.url().should('include', '/dashboard')
}

export const navigateToVendors = () => {
  bypassPasswordGate()
  cy.visit('/vendors')
}

export const searchVendor = (query: string) => {
  cy.get(TEST_SELECTORS.searchInput).type(query)
  cy.contains('button', /search|find/i).click()
}

export const filterByCategory = (category: string) => {
  cy.contains('button', /All Categories/i).click()
  cy.contains(category).click()
}

export const filterByProduct = (product: string) => {
  cy.contains('button', /All Products/i).click()
  cy.contains(product).click()
}

export const openVendorModal = (index = 0) => {
  cy.get(TEST_SELECTORS.vendorCard).eq(index).click()
  cy.get(TEST_SELECTORS.vendorModal).should('be.visible')
}

export const closeVendorModal = () => {
  cy.get(TEST_SELECTORS.closeModal).click()
  cy.get(TEST_SELECTORS.vendorModal).should('not.exist')
}

export const addToFavorites = (index = 0) => {
  cy.get(TEST_SELECTORS.vendorCard).eq(index).within(() => {
    cy.get(TEST_SELECTORS.favoriteBtn).click()
  })
}

export const addToComparison = (index = 0) => {
  cy.get(TEST_SELECTORS.vendorCard).eq(index).within(() => {
    cy.get(TEST_SELECTORS.compareBtn).click()
  })
}

export const setMobileViewport = () => {
  cy.viewport('iphone-x')
}

export const setTabletViewport = () => {
  cy.viewport('ipad-2')
}

export const setDesktopViewport = () => {
  cy.viewport('macbook-15')
}

// API mocking utilities
export const mockApiResponse = (endpoint: string, response: any, statusCode = 200) => {
  cy.intercept(new RegExp(endpoint), {
    statusCode,
    body: response,
  }).as(`api${endpoint}`)
}

export const mockApiError = (endpoint: string, statusCode = 500, message = 'Internal Server Error') => {
  cy.intercept(new RegExp(endpoint), {
    statusCode,
    body: { error: message },
  }).as(`apiError${endpoint}`)
}

export const mockApiTimeout = (endpoint: string, delayMs = 5000) => {
  cy.intercept(new RegExp(endpoint), (req) => {
    req.reply((res) => {
      res.delay(delayMs)
    })
  }).as(`apiTimeout${endpoint}`)
}

// Assertion helpers
export const expectErrorMessage = (message: string | RegExp) => {
  cy.get(TEST_SELECTORS.loginError).should('contain', message)
}

export const expectUrlToContain = (text: string) => {
  cy.url().should('include', text)
}

export const expectElementVisible = (selector: string) => {
  cy.get(selector).should('be.visible')
}

export const expectElementHidden = (selector: string) => {
  cy.get(selector).should('not.be.visible')
}

export const expectElementNotExists = (selector: string) => {
  cy.get(selector).should('not.exist')
}

// Storage utilities
export const clearStorage = () => {
  cy.window().then((window) => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })
}

export const getStorageItem = (key: string) => {
  return cy.window().then((window) => {
    return window.localStorage.getItem(key)
  })
}

export const setStorageItem = (key: string, value: string) => {
  cy.window().then((window) => {
    window.localStorage.setItem(key, value)
  })
}

// Wait utilities
export const waitForApiCall = (alias: string, timeout = TEST_TIMEOUTS.api) => {
  cy.wait(`@${alias}`, { timeout })
}

export const waitForUrl = (urlPattern: string) => {
  cy.url().should('include', urlPattern)
}

export const waitForElement = (selector: string, timeout = TEST_TIMEOUTS.medium) => {
  cy.get(selector, { timeout }).should('be.visible')
}

// Scroll utilities
export const scrollToElement = (selector: string) => {
  cy.get(selector).scrollIntoView()
}

export const scrollToTop = () => {
  cy.window().then((window) => {
    window.scrollTo(0, 0)
  })
}

// Keyboard utilities
export const typeAndWait = (selector: string, text: string, delayMs = 50) => {
  cy.get(selector).type(text, { delay: delayMs })
}

export const clearInput = (selector: string) => {
  cy.get(selector).clear()
}

export const selectFromDropdown = (label: string, option: string) => {
  cy.contains('button', label).click()
  cy.contains(option).click()
}

// Date utilities
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0]
}

export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0]
}
