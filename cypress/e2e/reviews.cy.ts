describe('Vendor Reviews & Ratings', () => {
  beforeEach(() => {
    // Bypass password gate
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()

    // Login
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('Test@123')
    cy.contains('button', /sign in|login/i).click()
  })

  it('should display review section in vendor modal', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="reviews-section"]').should('be.visible')
  })

  it('should display review form toggle', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="show-review-form"]').should('be.visible')
  })

  it('should toggle review form visibility', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="show-review-form"]').click()
    cy.get('[data-testid="review-form"]').should('be.visible')
  })

  it('should allow rating with star clicks', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="show-review-form"]').click()
    
    // Click 4th star for 4-star rating
    cy.get('[data-testid="rating-star-4"]').click()
    cy.get('[data-testid="rating-star-4"]').should('have.class', 'selected')
  })

  it('should allow submitting review with comment', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="show-review-form"]').click()
    
    cy.get('[data-testid="rating-star-5"]').click()
    cy.get('[data-testid="review-comment"]').type('Excellent vendor!')
    cy.contains('button', /submit|post|save/i).click()
    
    // Review should appear in reviews list
    cy.contains('Excellent vendor!').should('be.visible')
  })

  it('should display user rating in review', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="show-review-form"]').click()
    
    cy.get('[data-testid="rating-star-3"]').click()
    cy.get('[data-testid="review-comment"]').type('Good service')
    cy.contains('button', /submit|post|save/i).click()
    
    cy.get('[data-testid="review-item"]').should('contain', '3')
  })

  it('should validate comment is not empty', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="show-review-form"]').click()
    
    cy.get('[data-testid="rating-star-4"]').click()
    cy.contains('button', /submit|post|save/i).click()
    
    // Should show validation error
    cy.contains(/comment|required|empty/i).should('be.visible')
  })

  it('should validate rating is selected', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="show-review-form"]').click()
    
    cy.get('[data-testid="review-comment"]').type('Good service')
    cy.contains('button', /submit|post|save/i).click()
    
    // Should show validation error
    cy.contains(/rating|required|select/i).should('be.visible')
  })

  it('should show star hover effect', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="show-review-form"]').click()
    
    cy.get('[data-testid="rating-star-3"]').trigger('mouseenter')
    cy.get('[data-testid="rating-star-3"]').should('have.class', 'hover')
  })

  it('should display existing reviews', () => {
    cy.visit('/vendors')
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.get('[data-testid="reviews-section"]').should('contain', /review|rating/i)
  })
})
