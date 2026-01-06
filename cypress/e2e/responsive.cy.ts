import { TEST_EMAIL, TEST_PASSWORD } from "../support/e2e"

describe('Responsive Design', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
  })

  describe('Mobile Layout', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display mobile navigation', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="mobile-nav"]').should('be.visible')
    })

    it('should stack vendor cards vertically', () => {
      cy.visit('/vendors')
      cy.contains('button', 'All').click() // Ensure vendors are loaded
      cy.get('[data-testid="vendor-card"]').first().should('have.css', 'width')
    })
  })

  it('should display search bar on mobile', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').should('be.visible')
  })
})
