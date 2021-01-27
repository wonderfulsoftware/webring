declare namespace Cypress {
  interface Chainable {
    visitRoute(value: string): Chainable
    shouldAutomaticallySelectPage(value: string): Chainable
  }
}
