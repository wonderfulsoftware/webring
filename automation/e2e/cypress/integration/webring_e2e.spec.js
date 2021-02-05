/// <reference types="cypress" />

function commonTests() {
  context("e2e with real user behaviour on random link", () => {

    it("should navigate to the next link for n-link or last-link", () => {
      cy.visit("/")
      cy.get("li[data-current='1']").then((getCurrentLink) => {
        let isLastChild = Cypress.$(getCurrentLink).is(":last-child")
        cy.get("#next-button").click()
        cy.get("li[data-current='1']")
          .invoke("text")
          .then((getNewLink) => {
            if (isLastChild) {
              cy.get("li[data-current='1']")
                .first()
                .invoke("text")
                .then((getFirstChildText) => {
                  expect(getNewLink).to.be.eq(getFirstChildText)
                })
            } else {
              cy.get(getCurrentLink)
                .next()
                .invoke("text")
                .then((getFirstChildText) => {
                  expect(getNewLink).to.be.eq(getFirstChildText)
                })
            }
          })
      })
    })

    it("should navigate to the previous link for n-link or first-link", () => {
      cy.visit("/")
      cy.get("li[data-current='1']").then((getCurrentLink) => {
        let isFirstChild = Cypress.$(getCurrentLink).is(":first-child")
        cy.get("#previous-button").click()
        cy.get("li[data-current='1']")
          .invoke("text")
          .then((getNewLink) => {
            if (isFirstChild) {
              cy.get("li[data-current='1']")
                .last()
                .invoke("text")
                .then((getLastChildText) => {
                  expect(getNewLink).to.be.eq(getLastChildText)
                })
            } else {
              cy.get(getCurrentLink)
                .prev()
                .invoke("text")
                .then((getLastChildText) => {
                  expect(getNewLink).to.be.eq(getLastChildText)
                })
            }
          })
      })
    })

    it("should display the sticky consent banner", () => {
      cy.visit("/")
      cy.get("#for-first-timer").should("be.visible")
    })

    it("should hide the sticky consent banner when it is clicked", () => {
      cy.visit("/")
      cy.get("#for-first-timer").should("be.visible")
      cy.get("#for-first-timer").click()
      cy.get("#for-first-timer").should("not.be.visible")
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
