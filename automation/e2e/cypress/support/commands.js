// See: https://on.cypress.io/custom-commands
Cypress.Commands.add("visitRoute", (hash) => {
  cy.visit("/?test=" + Date.now() + hash)
})

Cypress.Commands.add("shouldAutomaticallySelectPage", (siteName) => {
  cy.get("h2").should("contain.text", siteName)
})
