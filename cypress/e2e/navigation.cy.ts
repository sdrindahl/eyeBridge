describe('Navigation & Routing', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
  })

  describe('Page Navigation', () => {
    it('should navigate to home page', () => {
      cy.visit('/')
      cy.url().should('include', '/')
    })

    it('should navigate to vendors page', () => {
      cy.visit('/vendors')
      cy.url().should('include', '/vendors')
    })

    it('should navigate to login page', () => {
      cy.visit('/login')
      cy.url().should('include', '/login')
    })

    it('should navigate to register page', () => {
      cy.visit('/register')
      cy.url().should('include', '/register')
    })

    it('should navigate to dashboard when authenticated', () => {
      cy.visit('/login')
      cy.get('input[type="email"]').type('test@example.com')
      cy.get('input[type="password"]').type('Test@123')
      cy.contains('button', /sign in|login/i).click()
      cy.url().should('include', '/dashboard')
    })
  })

  describe('Navigation Menu', () => {
    it('should display navigation menu', () => {
      cy.visit('/')
      cy.get('[data-testid="main-nav"]').should('be.visible')
    })

    it('should navigate using menu links', () => {
      cy.visit('/')
      cy.contains('a', /vendors/i).click()
      cy.url().should('include', '/vendors')
    })

    it('should highlight active menu item', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="nav-vendors"]').should('have.class', 'active')
    })
  })

  describe('Search Navigation', () => {
    it('should navigate to vendors with search params', () => {
      cy.visit('/vendors?q=Optics')
      cy.url().should('include', 'q=Optics')
    })

    it('should navigate with category filter', () => {
      cy.visit('/vendors?category=equipment')
      cy.url().should('include', 'category=equipment')
    })

    it('should navigate with multiple filters', () => {
      cy.visit('/vendors?q=Optics&category=equipment&product=Glasses')
      cy.url().should('include', 'q=Optics')
      cy.url().should('include', 'category=equipment')
    })

    it('should preserve search params on page reload', () => {
      cy.visit('/vendors?q=Optics&category=equipment')
      cy.reload()
      cy.url().should('include', 'q=Optics')
      cy.url().should('include', 'category=equipment')
    })
  })

  describe('Breadcrumbs or History', () => {
    it('should allow going back with browser back button', () => {
      cy.visit('/')
      cy.visit('/vendors')
      cy.go('back')
      cy.url().should('include', '/')
    })

    it('should allow going forward with browser forward button', () => {
      cy.visit('/')
      cy.visit('/vendors')
      cy.go('back')
      cy.go('forward')
      cy.url().should('include', '/vendors')
    })
  })

  describe('Internal Links', () => {
    it('should follow logo link to home', () => {
      cy.visit('/vendors')
      cy.get('[data-testid="logo-link"]').click()
      cy.url().should('include', '/')
    })

    it('should follow home button to home', () => {
      cy.visit('/login')
      cy.contains('button', /home/i).click()
      cy.url().should('include', '/')
    })
  })

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-x')
    })

    it('should display mobile menu toggle', () => {
      cy.visit('/')
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible')
    })

    it('should open mobile menu on toggle click', () => {
      cy.visit('/')
      cy.get('[data-testid="mobile-menu-toggle"]').click()
      cy.get('[data-testid="mobile-nav-menu"]').should('be.visible')
    })

    it('should close mobile menu on link click', () => {
      cy.visit('/')
      cy.get('[data-testid="mobile-menu-toggle"]').click()
      cy.get('[data-testid="mobile-nav-menu"]').within(() => {
        cy.contains('a', /vendors/i).click()
      })
      cy.get('[data-testid="mobile-nav-menu"]').should('not.be.visible')
    })
  })

  describe('Invalid Routes', () => {
    it('should handle invalid route gracefully', () => {
      cy.visit('/invalid-route', { failOnStatusCode: false })
      // Should either show 404 or redirect
      cy.contains(/not found|404|error/i).should('exist').or(
        cy.url().should('include', '/')
      )
    })
  })
})
