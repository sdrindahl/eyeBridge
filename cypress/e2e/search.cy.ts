import { TEST_EMAIL, TEST_PASSWORD } from "../support/e2e"

describe('Search Functionality', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
    
    // Login before each test
    cy.visit('/login')
    cy.get('input[type="email"]').type(TEST_EMAIL)
    cy.get('input[type="password"]').type(TEST_PASSWORD)
    cy.contains('button', /sign in|login/i).click()
  })

  it('should display search history on dashboard', () => {
    cy.url().should('include', '/dashboard')
    cy.contains('Recent Searches').should('be.visible')
  })

  it.skip('should add search to history', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /Search|Find/i).click()
    
    cy.visit('/dashboard')
    cy.contains('Optics').should('be.visible')
  })

  it.skip('should show search history dropdown', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').click()
    cy.get('[data-testid="search-history-dropdown"]').should('be.visible')
  })

  it.skip('should search from history by clicking', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /Search|Find/i).click()
    
    // Return to vendor page
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').click()
    cy.contains('Optics').click()
    
    cy.url().should('include', 'q=Optics')
  })

  it.skip('should clear search history', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /Search|Find/i).click()
    
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').click()
    cy.contains('button', /Clear|Delete/i).click()
    cy.contains('Optics').should('not.exist')
  })

  it.skip('should filter by search with category', () => {
    cy.visit('/vendors')
    cy.contains('button', /All Categories/i).click()
    cy.contains('Equipment').click()
    
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /Search|Find/i).click()
    
    cy.url().should('include', 'category=equipment')
    cy.url().should('include', 'q=Optics')
  })

  it.skip('should filter by search with product', () => {
    cy.visit('/vendors')
    cy.contains('button', /All Products/i).click()
    cy.get('li').first().then(($el) => {
      const product = $el.text()
      cy.wrap($el).click()
      
      cy.get('input[placeholder*="Search"]').type('Test')
      cy.contains('button', /Search|Find/i).click()
      
      cy.url().should('include', `product=${product}`)
    })
  })

  it.skip('should highlight matching text in results', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /Search|Find/i).click()
    
    cy.get('mark').should('contain', 'Optics')
  })

  it.skip('should perform case-insensitive search', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').type('optics')
    cy.contains('button', /Search|Find/i).click()
    
    cy.get('[data-testid="vendor-card"]').should('exist')
    cy.url().should('include', 'q=optics')
  })

  it.skip('should clear search input', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.get('[data-testid="clear-search"]').click()
    cy.get('input[placeholder*="Search"]').should('have.value', '')
  })

  it.skip('should display no results message', () => {
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').type('NONEXISTENTVENDOR123')
    cy.contains('button', /Search|Find/i).click()
    
    cy.contains(/no vendors|no results|not found/i).should('be.visible')
  })

  it.skip('should perform search from dashboard', () => {
    cy.login('test@example.com', 'Test@123')
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /Search|Find/i).click()
    
    cy.url().should('include', '/vendors')
    cy.url().should('include', 'q=Optics')
  })

  it.skip('should maintain search filters on reload', () => {
    cy.visit('/vendors?q=Optics&category=equipment')
    cy.get('input[placeholder*="Search"]').should('have.value', 'Optics')
    cy.contains('button', /All Categories/i).should('contain', 'equipment')
  })
})
