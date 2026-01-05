// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to login (adjust based on your auth flow)
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/')
  cy.contains('button', /login|sign in/i).click()
  cy.get('input[type="email"]').type(email)
  cy.get('input[type="password"]').type(password)
  cy.contains('button', /login|sign in/i).click()
  cy.url().should('not.include', '/login')
})

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click()
  cy.contains('button', /logout|sign out/i).click()
  cy.url().should('include', '/')
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      logout(): Chainable<void>
    }
  }
}

export {}
