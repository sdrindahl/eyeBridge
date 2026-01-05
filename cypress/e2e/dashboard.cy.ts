import { TEST_EMAIL, TEST_PASSWORD } from '../support/e2e'

describe('Dashboard', () => {

  beforeEach(() => {
    // Bypass password gate
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()

    // Login
    cy.visit('/login')
    cy.get('input[type="email"]').type(TEST_EMAIL)
    cy.get('input[type="password"]').type(TEST_PASSWORD)
    cy.contains('button', /sign in|login/i).click()
    cy.url().should('include', '/dashboard')
  })

  it('should display dashboard title and user email', () => {
    cy.url().should('include', '/dashboard')
    cy.contains(TEST_EMAIL).should('be.visible')
  })

  it('should display Quick Stats section with four cards', () => {
    cy.get('[data-testid="quick-stats"]').should('be.visible')
    cy.get('[data-testid="favorites-stat-card"]').should('be.visible')
    cy.get('[data-testid="searches-stat-card"]').should('be.visible')
    cy.get('[data-testid="contacted-stat-card"]').should('be.visible')

  })

  it('should display stat card labels correctly', () => {
    cy.get('[data-testid="favorites-label"]').should('contain', 'Favorites')
    cy.get('[data-testid="searches-label"]').should('contain', 'Recent Searches')
    cy.get('[data-testid="contacted-label"]').should('contain', 'Contacted')
  })

  it('should display Favorite Vendors section', () => {
    cy.get('#favorites-section > .flex-col').should('be.visible')
    cy.contains(/Favorite Vendors|My Favorites/i).should('be.visible')
  })

  it('should display Recent Searches section', () => {
    cy.get('#searches-section > .flex-col').should('be.visible')
    cy.get('#searches-section > .flex-col > .justify-between').should('be.visible')
  })


  it('Compare button should compare vendors selected', () => {
    cy.get('#favorites-section div:nth-child(1) > div.flex > button.font-medium').click();
    cy.get('#favorites-section div:nth-child(2) > div.flex > button.font-medium').click();
    cy.get('#favorites-section button.bg-slate-200').click();
    cy.get('#favorites-section button.bg-blue-600').click();
    cy.contains('Comparing 3 vendors').should('be.visible');
  })

  it('should have search functionality visible', () => {
    cy.get('input[placeholder*="Search"]').should('be.visible')
    cy.contains('button', /All Categories/i).should('be.visible')
  })

  // it('should allow collapsing Recent Searches section', () => {
  //   // Get initial state of recent searches
  //   cy.get('[data-testid="recent-searches-section"]').within(() => {
  //     cy.get('[data-testid="collapse-toggle"]').click()
  //   })
  //   // Section should be collapsed
  //   cy.get('[data-testid="recent-searches-section"]').should('have.attr', 'aria-expanded', 'false')
  // })

  it('should allow collapsing Favorite Vendors section', () => {
    cy.get('[data-testid="favorite-vendors-section"]').within(() => {
      cy.get('[data-testid="collapse-toggle"]').click()
    })
    cy.get('[data-testid="favorite-vendors-section"]').should('have.attr', 'aria-expanded', 'false')
  })

  it('should navigate to vendors page with search', () => {
    cy.get('input[placeholder*="Search"]').type('optics')
    cy.contains('button', /search|find/i).click()
    cy.url().should('include', '/vendors')
    cy.url().should('include', 'q=optics')
  })

  it('should filter by category', () => {
    cy.contains('button', /All Categories/i).click()
    cy.contains('Equipment').click()
    cy.url().should('include', 'category=equipment')
  })

  it('should filter by product', () => {
    cy.contains('button', /All Products/i).click()
    cy.get('li').first().click()
    // URL should include product parameter
    cy.url().should('include', 'product=')
  })

  it('should handle vendor modal opening', () => {
    // If there are vendor cards visible
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="vendor-modal"]').should('be.visible')
  })

  it('should close vendor modal on close button', () => {
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="close-modal"]').click()
    cy.get('[data-testid="vendor-modal"]').should('not.exist')
  })
})
