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
    describe("without suffix", () => {
      it("should automatically advance to next page", () => {
        cy.visitRoute("#monosor.dev")
        cy.shouldAutomaticallySelectPage("monosor.com")
      })
    })
    describe("with :next suffix", () => {
      it("should automatically advance to next page", () => {
        cy.visitRoute("#monosor.dev:next")
        cy.shouldAutomaticallySelectPage("monosor.com")
      })
    })
    xdescribe("with :prev suffix", () => {
      it("should automatically advance to next page", () => {
        cy.visitRoute("#monosor.dev:prev")
        cy.shouldAutomaticallySelectPage("notaboutcode.com")
      })
    })
    xdescribe("with :random suffix", () => {
      it("should select a random page", () => {
        cy.visitRoute("#monosor.dev:random")
        cy.shouldAutomaticallySelectPage("monosor.com")
      })
    })
    describe("with :list suffix", () => {
      xit("should show the list on mobile")
      xit("should show the website on desktop", () => {
        cy.visitRoute("#monosor.dev:list")
        cy.shouldAutomaticallySelectPage("monosor.com")
      })
    })
  })
})
