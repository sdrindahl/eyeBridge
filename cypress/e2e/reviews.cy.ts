import { TEST_EMAIL, TEST_PASSWORD } from "../support/e2e"

describe('Vendor Reviews & Ratings', () => {
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
  })

  it('should display review section in vendor modal', () => {
    cy.url().should('include', '/dashboard')
    cy.get('input.pl-12').type('Contacts');
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").should('be.visible')
  })

  it('should display review form toggle', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").should('be.visible')
  })

  it.skip('should toggle review form visibility', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").click()
    cy.get('[data-testid="review-form"]').should('be.visible')
  })

  it.skip('should allow rating with star clicks', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").click()
    
    // Click 4th star for 4-star rating
    cy.get('[data-testid="rating-star-4"]').click()
    cy.get('[data-testid="rating-star-4"]').should('have.class', 'selected')
  })

  it.skip('should allow submitting review with comment', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").click()
    
    cy.get('[data-testid="rating-star-5"]').click()
    cy.get('[data-testid="review-comment"]').type('Excellent vendor!')
    cy.contains('button', /submit|post|save/i).click()
    
    // Review should appear in reviews list
    cy.contains('Excellent vendor!').should('be.visible')
  })

  it.skip('should display user rating in review', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").click()
    
    cy.get('[data-testid="rating-star-3"]').click()
    cy.get('[data-testid="review-comment"]').type('Good service')
    cy.contains('button', /submit|post|save/i).click()
    
    cy.get('[data-testid="review-item"]').should('contain', '3')
  })

  it.skip('should validate comment is not empty', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").click()
    
    cy.get('[data-testid="rating-star-4"]').click()
    cy.contains('button', /submit|post|save/i).click()
    
    // Should show validation error
    cy.contains(/comment|required|empty/i).should('be.visible')
  })

  it.skip('should validate rating is selected', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").click()
    
    cy.get('[data-testid="review-comment"]').type('Good service')
    cy.contains('button', /submit|post|save/i).click()
    
    // Should show validation error
    cy.contains(/rating|required|select/i).should('be.visible')
  })

  it.skip('should show star hover effect', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").click()
    
    cy.get('[data-testid="rating-star-3"]').trigger('mouseenter')
    cy.get('[data-testid="rating-star-3"]').should('have.class', 'hover')
  })

  it.skip('should display existing reviews', () => {
    cy.get('input.pl-12').type('Contacts')
    cy.contains('button', "Search Vendors").click()
    cy.get('[data-testid="vendor-card"]').first().click()
    cy.contains('button', "Leave a Review").should('be.visible')
    cy.get('[data-testid="reviews-section"]').should('contain', /review|rating/i)
  })
})
