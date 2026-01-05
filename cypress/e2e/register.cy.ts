describe('Registration Page', () => {
  // Generate unique email for each test
  const generateUniqueEmail = () => {
    return `testuser-${Date.now()}@example.com`
  }

  beforeEach(() => {
    cy.visit('/')
    cy.get('input[type="password"]').type('eyebridges2025')
    cy.get('button[type="submit"]').click()
  })

  it('should display registration page with form fields', () => {
    cy.visit('/register')
    cy.contains(/Sign Up|Register|Create Account/i).should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('input[placeholder*="Confirm"]').should('be.visible')
  })

  it('should validate email is required', () => {
    cy.visit('/register')
    cy.get('input[type="password"]').first().type('Test@123')
    cy.get('input[placeholder*="Confirm"]').type('Test@123')
    cy.contains('button', /register|sign up/i).click()
    cy.get('[data-testid="register-error"]').should('contain', 'email')
  })

  it('should successfully register with valid credentials', () => {
    const uniqueEmail = generateUniqueEmail()
    cy.visit('/register')
    cy.get('input[type="email"]').type(uniqueEmail)
    cy.get('input[type="password"]').first().type('Test@123')
    cy.get('input[placeholder*="Confirm"]').type('Test@123')
    cy.contains('button', /register|sign up/i).click()
    cy.url().should('include', '/login')
  })

  it('should validate password is required', () => {
    cy.visit('/register')
    cy.get('input[type="email"]').type('newuser@example.com')
    cy.get('input[placeholder*="Confirm"]').type('Test@123')
    cy.contains('button', /register|sign up/i).click()
    cy.get('[data-testid="register-error"]').should('contain', 'password')
  })

  it('should validate email format', () => {
    cy.visit('/register')
    cy.get('input[type="email"]').type('invalidemail')
    cy.get('input[type="password"]').first().type('Test@123')
    cy.get('input[placeholder*="Confirm"]').type('Test@123')
    cy.contains('button', /register|sign up/i).click()
    cy.get('[data-testid="register-error"]').should('contain', 'valid email')
  })

  it('should validate password confirmation match', () => {
    const uniqueEmail = generateUniqueEmail()
    cy.visit('/register')
    cy.get('input[type="email"]').type(uniqueEmail)
    cy.get('input[type="password"]').first().type('Test@123')
    cy.get('input[placeholder*="Confirm"]').type('Different@123')
    cy.contains('button', /register|sign up/i).click()
    cy.get('[data-testid="register-error"]').should('contain', /match|confirm/i)
  })

  it('should show link to login page', () => {
    cy.visit('/register')
    cy.contains('a', /login|sign in/i).should('be.visible')
    cy.contains('a', /login|sign in/i).click()
    cy.url().should('include', '/login')
  })

  it('should show link back to home', () => {
    cy.visit('/register')
    cy.contains('button', /home/i).should('be.visible')
    cy.contains('button', /home/i).click()
    cy.url().should('include', '/')
  })
});

it('login', function() {
  cy.visit('http://localhost:5173/')
  
});
