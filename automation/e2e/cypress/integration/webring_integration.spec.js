context("data.json", () => {
    it("should return 200", () => {
      cy.request(
        "https://wonderfulsoftware.github.io/webring-site-data/data.json"
      ).then((res) => {
        expect(res.status).to.be.eq(200)
      })
    })
  
    it("should have keys", () => {
      cy.request(
        "https://wonderfulsoftware.github.io/webring-site-data/data.json"
      ).then((res) => {
        cy.log(res.body["dt.in.th"])
        expect(res.body["dt.in.th"]).to.have.keys(
          "blurhash",
          "backlink",
          "description",
          "lastUpdated",
          "mobileImageUrlV2",
          "number",
          "url"
        )
        expect(res.body["dt.in.th"]["backlink"]).to.have.keys("href", "rect")
      })
    })
  })