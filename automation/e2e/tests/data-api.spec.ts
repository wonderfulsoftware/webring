import { test, expect } from "@playwright/test"

test("First-time guide", async ({ request }) => {
  const response = await request.get(
    "https://wonderfulsoftware.github.io/webring-site-data/data.json"
  )
  expect(response.status()).toBe(200)
  const data = await response.json()
  expect(data["dt.in.th"]).toEqual(
    expect.objectContaining({
      blurhash: expect.any(String),
      backlink: expect.anything(),
      description: expect.any(String),
      lastUpdated: expect.any(String),
      mobileImageUrlV2: expect.any(String),
      number: expect.any(Number),
      screenshotUpdatedAt: expect.any(String),
      url: expect.any(String),
    })
  )
})
