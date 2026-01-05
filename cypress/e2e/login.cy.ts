describe('Login & Authentication', () => {
  beforeEach(() => {
    // Bypass password gate
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
  })

  it('should display login page with form fields', () => {
    cy.visit('/login')
    cy.get('[data-testid="login-card"]').should('be.visible')
    cy.contains('Welcome Back').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.contains('button', /sign in|login/i).should('be.visible')
  })

  it('should validate email field is required', () => {
    cy.visit('/login')
    cy.get('input[type="password"]').type('Test@123')
    cy.contains('button', /sign in|login/i).click()
    cy.get('[data-testid="login-error"]').should('contain', 'email and password')
  })

  it('should validate password field is required', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.contains('button', /sign in|login/i).click()
    cy.get('[data-testid="login-error"]').should('contain', 'email and password')
  })

  it('should validate email format', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('invalidemail')
    cy.get('input[type="password"]').type('Test@123')
    cy.contains('button', /sign in|login/i).click()
    cy.get('[data-testid="login-error"]').should('contain', 'valid email')
  })

  it('should handle invalid credentials', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('invalid@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.contains('button', /sign in|login/i).click()
    cy.get('[data-testid="login-error"]').should('be.visible')
  })

  it('should successfully login with valid credentials', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('Test@123')
    cy.contains('button', /sign in|login/i).click()
    cy.url().should('include', '/dashboard')
  })

  it('should display loading state during login', () => {
    cy.visit('/login')
    cy.get('input[type="email"]').type('test@example.com')
    cy.get('input[type="password"]').type('Test@123')
    cy.contains('button', /sign in|login/i).click()
    // Button should show loading state
    cy.contains('button', /signing in|loading/i).should('exist')
  })

  it('should show link to register page', () => {
    cy.visit('/login')
    cy.contains('a', /create|register|sign up/i).should('be.visible')
    cy.contains('a', /create|register|sign up/i).click()
    cy.url().should('include', '/register')
  })

  it('should show link back to home', () => {
    cy.visit('/login')
    cy.contains('button', /home/i).should('be.visible')
    cy.contains('button', /home/i).click()
    cy.url().should('include', '/')
  })
})
