// See: https://docs.cypress.io/guides/tooling/typescript-support.html#Types-for-custom-commands
declare namespace Cypress {
  interface Chainable {
    visitRoute(value: string): Chainable
    shouldBeOnSite(value: string): Chainable
    shouldSendBeacon(info: any): Chainable
  }
}
