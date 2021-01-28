/// <reference types="cypress" />

function commonTests() {
  describe("website information", () => {
    beforeEach(() => {
      cy.visitRoute("#/dt.in.th")
    })

    it("shows website title", () => {
      cy.get("h2").should("contain.text", "dt.in.th")
    })

    it("shows website description", () => {
      cy.get(".site-description").should(
        "contain.text",
        "Thai Pangsakulyanont’s web site"
      )
    })

    describe("the next button", () => {
      it("works", () => {
        cy.get("#next-button").click()
        cy.shouldBeOnSite("notaboutcode.com")
      })
    })

    describe("the previous button", () => {
      it("works", () => {
        cy.get("#previous-button").click()
        cy.shouldBeOnSite("wonderful.software")
      })
    })
  })

  context("visiting directly", () => {
    it("selects a random website", () => {
      // Note: In testing mode, the site randomizer always selects the 4th site on the list.
      // See: https://xkcd.com/221/
      cy.visitRoute("#")
      cy.shouldBeOnSite("monosor.dev")
    })
    it("should send beacon when visiting that site", () => {
      cy.get('[data-cy="go:monosor.dev"]').click()
      cy.shouldSendBeacon({
        action: "outbound",
        site: "monosor.dev",
        referrer: "",
      })
    })
  })

  describe("inbound links", () => {
    context("visiting #<site>", () => {
      beforeEach(() => {
        cy.visitRoute("#monosor.dev")
      })
      it("should automatically advance to next page", () => {
        cy.shouldBeOnSite("monosor.com")
      })
      it("should send beacon upon entering", () => {
        cy.shouldSendBeacon({
          action: "inbound",
          site: "monosor.dev",
        })
      })
      it("should send beacon when visiting next site", () => {
        cy.get('[data-cy="go:monosor.com"]').click()
        cy.shouldSendBeacon({
          action: "outbound",
          site: "monosor.com",
          referrer: "monosor.dev",
        })
      })
    })
    describe("visiting #<site>:next", () => {
      it("should automatically advance to next page", () => {
        cy.visitRoute("#monosor.dev:next")
        cy.shouldBeOnSite("monosor.com")
      })
    })
    xdescribe("visiting #<site>:prev", () => {
      it("should automatically advance to next page", () => {
        cy.visitRoute("#monosor.dev:prev")
        cy.shouldBeOnSite("notaboutcode.com")
      })
    })
    xdescribe("visiting #<site>:random", () => {
      it("should select a random page", () => {
        cy.visitRoute("#monosor.dev:random")
        cy.shouldBeOnSite("monosor.com")
      })
    })
    describe("wvisiting #<site>:list", () => {
      xit("should show the list on mobile")
      xit("should show the website on desktop", () => {
        cy.visitRoute("#monosor.dev:list")
        cy.shouldBeOnSite("monosor.com")
      })
    })
  })
}

context("Mobile", () => {
  beforeEach(() => {
    cy.viewport("iphone-6")
  })
  commonTests()
})

context("Desktop", () => {
  beforeEach(() => {
    cy.viewport(1024, 768)
  })
  commonTests()
})
