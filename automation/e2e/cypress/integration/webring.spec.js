/// <reference types="cypress" />

context("webring", () => {
  beforeEach(() => {
    cy.visit("http://webring/#/wonderful.software")
  })

  it("shows website info", () => {
    cy.get("h2").should("contain.text", "wonderful.software")
  })

  describe("the next button", () => {
    it("works", () => {
      cy.get("#next-button").click()
      cy.get("h2").should("contain.text", "dt.in.th")
    })
  })

  describe("the previous button", () => {
    it("works", () => {
      cy.visit("http://webring/#/notaboutcode.com")
      cy.get("#previous-button").click()
      cy.get("h2").should("contain.text", "dt.in.th")
    })
  })

  // viewport: mobile, desktop
  describe("entering from another website", () => {
    it("should automatically advance to next page", () => {
      cy.visitRoute("#monosor.dev").shouldAutomaticallySelectPage("monosor.com")
      // cy.visitRoute("#monosor.dev:prev").shouldAutomaticallySelectPage(
      //   "notaboutcode.com"
      // )
      // cy.visitRoute("#monosor.dev:random").shouldAutomaticallySelectPage(
      //   "notaboutcode.com"
      // )
      // cy.visitRoute("#monosor.dev:list").shouldAutomaticallySelectPage(
      //   "notaboutcode.com"
      // )
    })
  })
})
