// See: https://docs.cypress.io/guides/tooling/typescript-support.html#Types-for-custom-commands
declare namespace Cypress {
  interface Chainable {
    visitRoute(value: string): Chainable
    shouldAutomaticallySelectPage(value: string): Chainable
  }
}
