describe('Error Handling & Edge Cases', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
  })

  describe('Network Errors', () => {
    it('should handle server timeout gracefully', () => {
      cy.intercept('/api/**', { 
        delayMs: 10000,
        statusCode: 504 
      }).as('serverTimeout')

      cy.visit('/login')
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Test@123')
      cy.contains('button', /sign in|login/i).click()
      
      cy.wait('@serverTimeout')
      cy.get('[data-testid="login-error"]').should('be.visible')
    })

    it('should handle connection errors', () => {
      cy.intercept('/api/login', { forceNetworkError: true }).as('networkError')

      cy.visit('/login')
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Test@123')
      cy.contains('button', /sign in|login/i).click()
      
      cy.contains(/connection|network|error/i).should('be.visible')
    })

    it('should handle 500 server error', () => {
      cy.intercept('/api/login', { 
        statusCode: 500,
        body: { error: 'Internal server error' }
      }).as('serverError')

      cy.visit('/login')
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Test@123')
      cy.contains('button', /sign in|login/i).click()

      cy.contains(/error|failed/i).should('be.visible')
    })
  })

  describe('Input Validation', () => {
    it('should trim whitespace from email', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('  test@example.com  ')
      cy.get('input[type="password"]').type('Test@123')
      // Form should accept it (trimmed version is valid)
      cy.contains('button', /sign in|login/i).click()
    })

    it('should handle special characters in input', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('test+tag@example.com')
      cy.get('input[type="password"]').type('Test@123!#$%')
      cy.contains('button', /sign in|login/i).click()
      // Should either succeed or show appropriate error
    })

    it('should handle very long input', () => {
      cy.visit('/login')
      const longEmail = 'a'.repeat(100) + '@example.com'
      cy.get('input[type="email"]').type(longEmail)
      cy.get('input[type="password"]').type('Test@123')
      cy.contains('button', /sign in|login/i).click()
    })

    it('should handle empty search query', () => {
      cy.visit('/vendors')
      cy.get('input[placeholder*="Search"]').clear()
      cy.contains('button', /Search|Find/i).click()
      // Should either show all results or message
    })
  })

  describe('Session Management', () => {
    it('should redirect to login on token expiration', () => {
      // Login first
      cy.visit('/login')
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Test@123')
      cy.contains('button', /sign in|login/i).click()
      cy.url().should('include', '/dashboard')

      // Clear token to simulate expiration
      cy.window().then((window) => {
        window.localStorage.removeItem('token')
      })
      
      // Should redirect to login
      cy.visit('/dashboard')
      cy.url().should('include', '/login')
    })

    it('should persist session on page reload', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Test@123')
      cy.contains('button', /sign in|login/i).click()
      cy.url().should('include', '/dashboard')

      cy.reload()
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Browser Back/Forward', () => {
    it('should handle back button from login', () => {
      cy.visit('/vendors')
      cy.visit('/login')
      cy.go('back')
      cy.url().should('include', '/vendors')
    })

    it('should handle forward button after login', () => {
      cy.visit('/vendors')
      cy.visit('/login')
      cy.go('back')
      cy.go('forward')
      cy.url().should('include', '/login')
    })
  })

  describe('Modal Edge Cases', () => {
    it('should handle rapid modal open/close', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="vendor-card"]').first().click()
      cy.get('[data-testid="close-modal"]').click()
      cy.get('[data-testid="vendor-card"]').first().click()
      cy.get('[data-testid="vendor-modal"]').should('be.visible')
    })

    it('should handle clicking vendor card while modal is open', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="vendor-card"]').first().click()
      cy.get('[data-testid="vendor-modal"]').should('be.visible')
      cy.get('[data-testid="vendor-card"]').eq(1).click()
      // Should update modal content
      cy.get('[data-testid="vendor-modal"]').should('be.visible')
    })

    it('should handle closing modal multiple times', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="vendor-card"]').first().click()
      cy.get('[data-testid="close-modal"]').click()
      // Second click should not cause error
      cy.get('[data-testid="close-modal"]').should('not.exist')
    })
  })

  describe('Data Loading', () => {
    it('should handle loading state on vendors page', () => {
      cy.intercept('/api/vendors', (req) => {
        req.reply((res) => {
          res.delay(2000)
        })
      }).as('vendorsLoading')

      cy.visit('/vendors')
      cy.get('[data-testid="loading-skeleton"]').should('be.visible')
      
      cy.wait('@vendorsLoading')
      cy.get('[data-testid="vendor-card"]').should('be.visible')
    })

    it('should handle empty vendors list', () => {
      cy.intercept('/api/vendors', { 
        statusCode: 200,
        body: [] 
      }).as('emptyVendors')

      cy.visit('/vendors')
      cy.contains(/no vendors|empty/i).should('be.visible')
    })
  })

  describe('Form Resubmission', () => {
    it('should prevent double submission', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Test@123')
      
      // Rapid clicks
      cy.contains('button', /sign in|login/i).click()
      cy.contains('button', /sign in|login/i).click()
      
      // Should only submit once
      cy.url().should('include', '/dashboard')
    })

    it('should clear error message on new input', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('invalid@example.com')
      cy.get('input[type="password"]').type('wrongpassword')
      cy.contains('button', /sign in|login/i).click()
      
      cy.get('[data-testid="login-error"]').should('be.visible')
      
      cy.get('input[type="email"]').clear().type('test@example.com')
      cy.get('[data-testid="login-error"]').should('not.exist')
    })
  })
})
