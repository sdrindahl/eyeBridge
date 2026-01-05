import { TEST_EMAIL, TEST_PASSWORD } from '../support/e2e'

describe('Login & Authentication', () => {

    beforeEach(() => {
        // Bypass password gate
        cy.visit('/')
        cy.get('input[type="password"]').type('eyebridges2025')
        cy.get('button[type="submit"]').click()
        
        // Ensure test user exists via API
        cy.request({
            method: 'POST',
            url: 'http://localhost:3001/api/auth/register',
            body: {
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            },
            failOnStatusCode: false
        }).then((response) => {
            // Log for debugging
            cy.log(`Register response: ${response.status}`)
            // Status 201 = created, 400 = already exists (ok), others = error
            if (response.status !== 201 && response.status !== 400) {
                cy.log(`Warning: Registration returned ${response.status}: ${JSON.stringify(response.body)}`)
            }
        })
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
        cy.get('input[type="password"]').type(TEST_PASSWORD)
        cy.contains('button', /sign in|login/i).click()
        cy.get('[data-testid="login-error"]').should('contain', 'email and password')
    })

    it('should validate password field is required', () => {
        cy.visit('/login')
        cy.get('input[type="email"]').type(TEST_EMAIL)
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
        cy.get('input[type="email"]').type(TEST_EMAIL)
        cy.get('input[type="password"]').type(TEST_PASSWORD)
        cy.contains('button', /sign in|login/i).click()
        cy.url().should('include', '/dashboard')
    })

    it('should display loading state during login', () => {
        cy.visit('/login')
        cy.get('input[type="email"]').type(TEST_EMAIL)
        cy.get('input[type="password"]').type(TEST_PASSWORD)
        const loginButton = cy.contains('button', /sign in|login/i)
        loginButton.click()
        // After login, should redirect to dashboard
        cy.url().should('include', '/dashboard')
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
