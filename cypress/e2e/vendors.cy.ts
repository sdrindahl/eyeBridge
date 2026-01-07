describe('Vendors Page', () => {
  beforeEach(() => {
    // Bypass password gate
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()

    // Navigate to vendors page
    cy.visit('/vendors')
  })

  it('should display vendors page with search bar', () => {
    cy.contains(/Vendors|Browse Vendors/i).should('be.visible')
    cy.get('input[placeholder*="Search"]').should('be.visible')
  })

  it('should display category filter dropdown', () => {
    cy.contains('button', /All Categories/i).should('be.visible')
  })

  it.skip('should display product filter dropdown', () => {
    cy.contains('button', /All Products/i).should('be.visible')
  })

  it.skip('should filter vendors by category', () => {
    cy.contains('button', /All Categories/i).click()
    cy.contains('li', 'Equipment').click()
    // Results should update
    cy.get('[data-testid="vendor-card"]').should('exist')
    cy.url().should('include', 'category=equipment')
  })

  it.skip('should filter vendors by product', () => {
    cy.contains('button', /All Products/i).click()
    cy.get('li').first().then(($el) => {
      const product = $el.text()
      cy.wrap($el).click()
      cy.url().should('include', `product=${product}`)
    })
  })

  it.skip('should search vendors by name', () => {
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /Search|Find/i).click()
    cy.url().should('include', 'q=Optics')
    cy.get('[data-testid="vendor-card"]').should('exist')
  })

  it.skip('should display vendor cards with required information', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.contains(/Company|Name/i).should('be.visible')
    })
  })

  it.skip('should allow opening vendor modal', () => {
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="vendor-modal"]').should('be.visible')
  })

  it.skip('should display vendor details in modal', () => {
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="vendor-modal"]').within(() => {
      cy.contains(/Phone|Email|Website|Address/i).should('exist')
    })
  })

  it.skip('should close modal on X button', () => {
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="close-modal"]').click()
    cy.get('[data-testid="vendor-modal"]').should('not.exist')
  })

  it.skip('should close modal on backdrop click', () => {
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="modal-backdrop"]').click({ force: true })
    cy.get('[data-testid="vendor-modal"]').should('not.exist')
  })

  it.skip('should allow adding vendor to favorites', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="favorite-btn"]').click()
    })
    // Heart should be filled
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="favorite-btn"]').should('have.class', 'filled')
    })
  })

  it.skip('should allow removing vendor from favorites', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="favorite-btn"]').click()
      cy.get('[data-testid="favorite-btn"]').click()
    })
    // Heart should not be filled
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="favorite-btn"]').should('not.have.class', 'filled')
    })
  })

  it.skip('should allow adding vendor to comparison', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    // Comparison should be added
    cy.get('[data-testid="compare-count"]').should('contain', '1')
  })

  it.skip('should highlight search query in results', () => {
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /Search|Find/i).click()
    cy.get('mark').should('exist')
  })

  it.skip('should display no results message for empty search', () => {
    cy.get('input[placeholder*="Search"]').type('ZZZZZZZZZZZ')
    cy.contains('button', /Search|Find/i).click()
    cy.contains(/no vendors|no results/i).should('be.visible')
  })

  it.skip('should reset filters when clicking reset button', () => {
    cy.contains('button', /All Categories/i).click()
    cy.contains('li', 'Equipment').click()
    cy.contains('button', /Reset|Clear/i).click()
    cy.url().should('not.include', 'category=')
  })

  it.skip('should handle responsive layout on mobile', () => {
    cy.viewport('iphone-x')
    cy.get('input[placeholder*="Search"]').should('be.visible')
    cy.get('[data-testid="vendor-card"]').should('be.visible')
  })
})
