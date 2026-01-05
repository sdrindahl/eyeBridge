describe('Vendor Comparisons', () => {
  beforeEach(() => {
    // Bypass password gate
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()

    // Navigate to vendors
    cy.visit('/vendors')
  })

  it('should display comparison button on vendor cards', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').should('be.visible')
    })
  })

  it('should add vendor to comparison', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.get('[data-testid="compare-count"]').should('contain', '1')
  })

  it('should allow adding multiple vendors to comparison', () => {
    cy.get('[data-testid="vendor-card"]').eq(0).within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.get('[data-testid="vendor-card"]').eq(1).within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.get('[data-testid="compare-count"]').should('contain', '2')
  })

  it('should remove vendor from comparison', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').click()
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.get('[data-testid="compare-count"]').should('contain', '0')
  })

  it('should display comparison view button when vendors added', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.contains('button', /compare|view comparison/i).should('be.visible')
  })

  it('should open comparison view', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.contains('button', /compare|view comparison/i).click()
    cy.get('[data-testid="comparison-view"]').should('be.visible')
  })

  it('should display vendor details in comparison', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.contains('button', /compare|view comparison/i).click()
    cy.get('[data-testid="comparison-view"]').within(() => {
      cy.contains(/company|phone|email|website/i).should('exist')
    })
  })

  it('should allow removing vendor from comparison view', () => {
    cy.get('[data-testid="vendor-card"]').eq(0).within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.get('[data-testid="vendor-card"]').eq(1).within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.contains('button', /compare|view comparison/i).click()
    
    cy.get('[data-testid="comparison-view"]').within(() => {
      cy.get('[data-testid="remove-from-comparison"]').first().click()
    })
    cy.get('[data-testid="comparison-item"]').should('have.length', 1)
  })

  it('should allow clearing all comparisons', () => {
    cy.get('[data-testid="vendor-card"]').eq(0).within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.get('[data-testid="vendor-card"]').eq(1).within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.contains('button', /compare|view comparison/i).click()
    
    cy.contains('button', /clear|remove all/i).click()
    cy.get('[data-testid="comparison-item"]').should('not.exist')
  })

  it('should allow saving comparison', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.contains('button', /compare|view comparison/i).click()
    cy.contains('button', /save|bookmark/i).click()
    cy.contains(/saved|success/i).should('be.visible')
  })

  it('should display comparison count limit', () => {
    // Try adding more than allowed (usually 5)
    for (let i = 0; i < 6; i++) {
      cy.get('[data-testid="vendor-card"]').eq(i).within(() => {
        cy.get('[data-testid="compare-btn"]').click()
      })
    }
    cy.contains(/limit|maximum/i).should('be.visible')
  })

  it('should persist comparison on page reload', () => {
    cy.get('[data-testid="vendor-card"]').first().within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    cy.get('[data-testid="compare-count"]').should('contain', '1')
    cy.reload()
    cy.get('[data-testid="compare-count"]').should('contain', '1')
  })
})
