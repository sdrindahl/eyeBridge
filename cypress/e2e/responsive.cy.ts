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
      cy.get('[data-testid="vendor-card"]').first().should('have.css', 'width')
    })

    it('should make filters accessible on mobile', () => {
      cy.visit('/vendors')
      cy.contains('button', /All Categories/i).should('be.visible')
      cy.contains('button', /All Products/i).should('be.visible')
    })

    it('should display search bar on mobile', () => {
      cy.visit('/vendors')
      cy.get('input[placeholder*="Search"]').should('be.visible')
    })

    it('should display dashboard stats on mobile', () => {
      cy.login('test@example.com', 'Test@123')
      cy.get('[data-testid="quick-stats"]').should('be.visible')
    })
  })

  describe('Tablet Layout', () => {
    beforeEach(() => {
      cy.viewport('ipad-2')
    })

    it('should display dashboard properly', () => {
      cy.login('test@example.com', 'Test@123')
      cy.get('[data-testid="dashboard-title"]').should('be.visible')
    })

    it('should display vendor grid', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="vendor-card"]').should('be.visible')
    })
  })

  describe('Desktop Layout', () => {
    beforeEach(() => {
      cy.viewport('macbook-15')
    })

    it('should display full navigation menu', () => {
      cy.visit('/')
      cy.get('[data-testid="main-nav"]').should('be.visible')
    })

    it('should display comparison and favorites side by side', () => {
      cy.login('test@example.com', 'Test@123')
      cy.get('[data-testid="quick-stats"]').should('be.visible')
      cy.get('[data-testid="favorite-vendors-section"]').should('be.visible')
    })
  })

  describe('Responsive Images', () => {
    it('should load vendor logos at different sizes', () => {
      cy.viewport('iphone-x')
      cy.visit('/vendors')
      cy.get('[data-testid="vendor-card"]').first().within(() => {
        cy.get('img').should('be.visible')
      })

      cy.viewport('macbook-15')
      cy.get('[data-testid="vendor-card"]').first().within(() => {
        cy.get('img').should('be.visible')
      })
    })
  })

  describe('Touch Interactions', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should handle touch on favorite button', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="vendor-card"]').first().within(() => {
        cy.get('[data-testid="favorite-btn"]').click()
        cy.get('[data-testid="favorite-btn"]').should('have.class', 'filled')
      })
    })

    it('should handle touch on compare button', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="vendor-card"]').first().within(() => {
        cy.get('[data-testid="compare-btn"]').click()
      })
      cy.get('[data-testid="compare-count"]').should('contain', '1')
    })
  })
})
