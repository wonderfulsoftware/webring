// See: https://on.cypress.io/custom-commands
Cypress.Commands.add("visitRoute", (hash) => {
  cy.visit("/?test=" + Date.now() + hash)
})

Cypress.Commands.add("shouldBeOnSite", (siteName) => {
  cy.get("h2").should("contain.text", siteName)
})

Cypress.Commands.add("shouldSendBeacon", (target) => {
  cy.window().should((w) => {
    const { WEBRING_TEST_MODE } = /** @type {any} */ (w)
    console.log(w)
    const foundBeacon = WEBRING_TEST_MODE.sentBeacons.find((info) => {
      try {
        expect(info).to.include(target)
        return true
      } catch (e) {
        return false
      }
    })
    expect(foundBeacon).to.be.ok
  })
})
