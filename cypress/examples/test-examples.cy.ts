// Example: How to Use and Customize Tests

import { 
  loginUser, 
  navigateToDashboard, 
  searchVendor, 
  filterByCategory,
  mockApiError,
  TEST_CREDENTIALS,
  TEST_SELECTORS 
} from '../support/test-utils'

// ============================================
// EXAMPLE 1: Basic Test Using Helpers
// ============================================
describe('Example: Using Test Helpers', () => {
  it('should navigate to dashboard with helper', () => {
    // Use helper function instead of repeating code
    navigateToDashboard()
    
    // Then verify you're on dashboard
    cy.get('[data-testid="dashboard-title"]').should('be.visible')
  })
})

// ============================================
// EXAMPLE 2: Custom Test Data
// ============================================
describe('Example: Custom Test Data', () => {
  const CUSTOM_CREDENTIALS = {
    email: 'custom@example.com',
    password: 'Custom@123',
  }

  it('should login with custom credentials', () => {
    loginUser(CUSTOM_CREDENTIALS.email, CUSTOM_CREDENTIALS.password)
    cy.url().should('include', '/dashboard')
  })
})

// ============================================
// EXAMPLE 3: Mocking API Errors
// ============================================
describe('Example: API Error Handling', () => {
  it('should handle login API error', () => {
    // Mock the login endpoint to return an error
    mockApiError('/api/login', 500, 'Server is down')
    
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
    
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('Test@123')
    cy.contains('button', /sign in|login/i).click()
    
    // Should show error
    cy.contains(/error|failed/i).should('be.visible')
  })
})

// ============================================
// EXAMPLE 4: Search with Filters
// ============================================
describe('Example: Advanced Search', () => {
  beforeEach(() => {
    // Bypass gate
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
    
    // Navigate to vendors
    cy.visit('/vendors')
  })

  it('should search vendors with category filter', () => {
    // Use helper functions for cleaner test
    filterByCategory('Equipment')
    searchVendor('Optics')
    
    // Verify results
    cy.get('[data-testid="vendor-card"]').should('exist')
    cy.url().should('include', 'category=equipment')
    cy.url().should('include', 'q=Optics')
  })
})

// ============================================
// EXAMPLE 5: Testing Form Validation
// ============================================
describe('Example: Form Validation', () => {
  it('should validate email format', () => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
    
    cy.visit('/login')
    
    // Type invalid email
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('input[type="password"]').type('Test@123')
    cy.contains('button', /sign in|login/i).click()
    
    // Should show validation error
    cy.get('[data-testid="login-error"]').should('contain', 'valid email')
  })
})

// ============================================
// EXAMPLE 6: Testing Multiple Vendors
// ============================================
describe('Example: Vendor Comparisons', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
    
    cy.visit('/vendors')
  })

  it('should compare multiple vendors', () => {
    // Add first vendor to comparison
    cy.get('[data-testid="vendor-card"]').eq(0).within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    
    // Add second vendor to comparison
    cy.get('[data-testid="vendor-card"]').eq(1).within(() => {
      cy.get('[data-testid="compare-btn"]').click()
    })
    
    // Verify count
    cy.get('[data-testid="compare-count"]').should('contain', '2')
    
    // Open comparison view
    cy.contains('button', /compare|view comparison/i).click()
    cy.get('[data-testid="comparison-view"]').should('be.visible')
  })
})

// ============================================
// EXAMPLE 7: Testing Responsive Behavior
// ============================================
describe('Example: Responsive Testing', () => {
  it('should display mobile menu on small screen', () => {
    cy.viewport('iphone-x')
    cy.visit('/vendors')
    
    // Mobile menu should be visible
    cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible')
    
    // Click to open menu
    cy.get('[data-testid="mobile-menu-toggle"]').click()
    cy.get('[data-testid="mobile-nav"]').should('be.visible')
  })

  it('should display full menu on desktop', () => {
    cy.viewport('macbook-15')
    cy.visit('/vendors')
    
    // Full navigation should be visible
    cy.get('[data-testid="main-nav"]').should('be.visible')
  })
})

// ============================================
// EXAMPLE 8: Testing Favorites
// ============================================
describe('Example: Favorites Management', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
    
    cy.visit('/vendors')
  })

  it('should add and remove vendor from favorites', () => {
    // Get first vendor name
    cy.get('[data-testid="vendor-card"]').first().then(($card) => {
      const vendorName = $card.text()
      
      // Add to favorites
      cy.wrap($card).within(() => {
        cy.get('[data-testid="favorite-btn"]').click()
      })
      
      // Heart should be filled
      cy.get('[data-testid="vendor-card"]').first().within(() => {
        cy.get('[data-testid="favorite-btn"]').should('have.class', 'filled')
      })
      
      // Remove from favorites
      cy.get('[data-testid="vendor-card"]').first().within(() => {
        cy.get('[data-testid="favorite-btn"]').click()
      })
      
      // Heart should not be filled
      cy.get('[data-testid="vendor-card"]').first().within(() => {
        cy.get('[data-testid="favorite-btn"]').should('not.have.class', 'filled')
      })
    })
  })
})

// ============================================
// EXAMPLE 9: Testing Search History
// ============================================
describe('Example: Search History', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
  })

  it('should save and recall search history', () => {
    // Perform a search
    cy.visit('/vendors')
    cy.get('input[placeholder*="Search"]').type('Optics')
    cy.contains('button', /search|find/i).click()
    
    // Go back to dashboard
    cy.visit('/dashboard')
    
    // Check if search appears in recent searches
    cy.get('[data-testid="recent-searches-section"]').should('contain', 'Optics')
  })
})

// ============================================
// EXAMPLE 10: Testing Reviews
// ============================================
describe('Example: Review Submission', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
    
    // Login
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('Test@123')
    cy.contains('button', /sign in|login/i).click()
  })

  it('should submit a vendor review', () => {
    cy.visit('/vendors')
    
    // Open vendor modal
    cy.get('[data-testid="vendor-card"]').first().click()
    
    // Show review form
    cy.get('[data-testid="show-review-form"]').click()
    
    // Fill review
    cy.get('[data-testid="rating-star-5"]').click()
    cy.get('[data-testid="review-comment"]').type('Excellent service!')
    
    // Submit
    cy.contains('button', /submit|post/i).click()
    
    // Verify review appears
    cy.contains('Excellent service!').should('be.visible')
  })
})

// ============================================
// EXAMPLE 11: Custom Page Object Pattern
// ============================================
class VendorsPage {
  visit() {
    cy.visit('/vendors')
  }

  searchFor(query: string) {
    cy.get('input[placeholder*="Search"]').type(query)
    cy.contains('button', /search|find/i).click()
  }

  selectVendor(index: number) {
    cy.get('[data-testid="vendor-card"]').eq(index).click()
  }

  closeModal() {
    cy.get('[data-testid="close-modal"]').click()
  }

  addToFavorites(index: number) {
    cy.get('[data-testid="vendor-card"]').eq(index).within(() => {
      cy.get('[data-testid="favorite-btn"]').click()
    })
  }
}

describe('Example: Using Page Objects', () => {
  it('should use page object pattern', () => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
    
    const page = new VendorsPage()
    
    page.visit()
    page.searchFor('Optics')
    cy.get('[data-testid="vendor-card"]').should('exist')
    
    page.selectVendor(0)
    cy.get('[data-testid="vendor-modal"]').should('be.visible')
    
    page.closeModal()
    cy.get('[data-testid="vendor-modal"]').should('not.exist')
  })
})

// ============================================
// EXAMPLE 12: Testing with Multiple Data Sets
// ============================================
describe('Example: Data-Driven Tests', () => {
  const searchQueries = ['Optics', 'Lenses', 'Equipment']
  
  searchQueries.forEach((query) => {
    it(`should search for ${query}`, () => {
      cy.visit('/')
      cy.get('input[type="password"]').type('eyebridges2025')
      cy.get('button[type="submit"]').click()
      
      cy.visit('/vendors')
      cy.get('input[placeholder*="Search"]').type(query)
      cy.contains('button', /search|find/i).click()
      
      // Results should exist
      cy.url().should('include', `q=${query}`)
    })
  })
})

// ============================================
// TIPS & BEST PRACTICES
// ============================================
/*
1. USE HELPERS: Instead of repeating setup code, use helper functions from test-utils.ts

2. ORGANIZE TESTS: Use describe blocks to group related tests

3. BEFOREEACH: Use beforeEach() for setup that's common to multiple tests

4. ASSERTIONS: Use clear, specific assertions

5. NAMES: Use descriptive test names that explain what's being tested

6. NO WAITS: Avoid cy.wait(1000) - use proper waits instead:
   - cy.get(selector, { timeout: 10000 })
   - cy.wait('@apiCall')
   - cy.url().should('include', '/path')

7. DATA-TESTID: Always use data-testid attributes for reliability

8. MOCK APIS: Mock API calls for faster, more reliable tests

9. INDEPENDENT: Each test should be able to run independently

10. DRY: Don't repeat code - extract to helper functions

COMMON PATTERNS:

// ❌ DON'T: Hardcoded waits
cy.wait(1000)

// ✅ DO: Proper waits
cy.get('element', { timeout: 10000 })
cy.url().should('include', '/path')

// ❌ DON'T: CSS selectors
cy.get('.my-button')

// ✅ DO: data-testid
cy.get('[data-testid="my-button"]')

// ❌ DON'T: Repeating setup
it('test 1', () => {
  cy.login(...)
  // test code
})
it('test 2', () => {
  cy.login(...)
  // test code
})

// ✅ DO: Use beforeEach
beforeEach(() => {
  cy.login(...)
})

it('test 1', () => {
  // test code
})
it('test 2', () => {
  // test code
})
*/
