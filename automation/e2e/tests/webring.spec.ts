import { expect, Page, test } from "@playwright/test"

test.describe("Website information", () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, "#/dt.in.th")
  })

  test("Website title is shown", async ({ page }) => {
    await expect(page.locator("h2")).toHaveText("dt.in.th")
  })

  test("Website description is shown", async ({ page }) => {
    await visit(page, "#/wonderful.software")
    await expect(page.locator(".site-description").first()).toHaveText(
      "a website about software engineering",
    )
  })

  test("Next button", async ({ page }) => {
    await page.click("#next-button")
    await assertHash(page, "#/notaboutcode.com")
  })

  test("Previous button", async ({ page }) => {
    await page.click("#previous-button")
    await assertHash(page, "#/wonderful.software")
  })
})

test.describe("Visiting directly", () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, "#")
  })

  test("selects a random website", async ({ page }) => {
    await assertHash(page, "#/garden.narze.live")
  })

  test("should send beacon when visiting that site", async ({ page }) => {
    await page.click('[data-cy="go:garden.narze.live"]')
    await assertBeacon(page, {
      action: "outbound",
      site: "garden.narze.live",
      referrer: "",
    })
  })
})

test.describe("inbound links", () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, "#dt.in.th")
  })

  test("should automatically advance to next page", async ({ page }) => {
    await page.click('[data-cy="go:notaboutcode.com"]')
    await assertHash(page, "#/notaboutcode.com")
  })

  test("should send beacon upon entering", async ({ page }) => {
    await assertBeacon(page, {
      action: "inbound",
      site: "dt.in.th",
    })
  })

  test("should send beacon when visiting next site", async ({ page }) => {
    await page.click('[data-cy="go:notaboutcode.com"]')
    await assertBeacon(page, {
      action: "outbound",
      site: "notaboutcode.com",
      referrer: "dt.in.th",
    })
  })
})

test.describe("inbound links with an action suffix", () => {
  test(":next advances to the next site, like a plain inbound link", async ({
    page,
  }) => {
    await visit(page, "#dt.in.th:next")
    await assertHash(page, "#/notaboutcode.com")
  })

  test(":prev goes to the previous site", async ({ page }) => {
    await visit(page, "#dt.in.th:prev")
    await assertHash(page, "#/wonderful.software")
  })

  test(":random goes to a random site", async ({ page }) => {
    await visit(page, "#dt.in.th:random")
    await assertHash(page, "#/garden.narze.live")
  })

  test(":list shows the list and stays on the same site", async ({ page }) => {
    await visit(page, "#dt.in.th:list")
    await expect(page.locator("#aux")).toHaveClass(/--hide-on-mobile/)
    await expect(page.locator("h2")).toHaveText("dt.in.th")
  })

  test("the suffix is case-insensitive", async ({ page }) => {
    await visit(page, "#DT.in.th:PREV")
    await assertHash(page, "#/wonderful.software")
  })

  test("an unknown suffix falls back to the next site", async ({ page }) => {
    await visit(page, "#dt.in.th:bogus")
    await assertHash(page, "#/notaboutcode.com")
  })

  test("an unknown site ignores the suffix and picks a random site", async ({
    page,
  }) => {
    await visit(page, "#not-in-the-ring.example:prev")
    await assertHash(page, "#/garden.narze.live")
  })

  test("should send an inbound beacon for the linking site", async ({
    page,
  }) => {
    await visit(page, "#dt.in.th:prev")
    await assertBeacon(page, { action: "inbound", site: "dt.in.th" })
  })

  test("should send beacon with the linking site as referrer", async ({
    page,
  }) => {
    await visit(page, "#dt.in.th:prev")
    await assertHash(page, "#/wonderful.software")
    await page.click('[data-cy="go:wonderful.software"]')
    await assertBeacon(page, {
      action: "outbound",
      site: "wonderful.software",
      referrer: "dt.in.th",
    })
  })

  test("first-time guide says where :prev will take the visitor", async ({
    page,
  }) => {
    await page.goto("/?test=1#dt.in.th:prev")
    await expect(page.locator("#for-first-timer-v2")).toContainText(
      "เว็บก่อนหน้า",
    )
    await expect(page.locator("#for-first-timer-v2")).not.toContainText(
      "เว็บถัดไป",
    )
  })

  test("first-time guide says where :random will take the visitor", async ({
    page,
  }) => {
    await page.goto("/?test=1#dt.in.th:random")
    await expect(page.locator("#for-first-timer-v2")).toContainText(
      "เว็บแบบสุ่ม",
    )
  })

  test("first-time guide still says next for a plain inbound link", async ({
    page,
  }) => {
    await page.goto("/?test=1#dt.in.th")
    await expect(page.locator("#for-first-timer-v2")).toContainText("เว็บถัดไป")
  })
})

const visit = (page: Page, route: string) =>
  page.goto(`/?test=1&test_onboarded=1${route}`)

const assertBeacon = async (page: Page, target: any) => {
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return (window as any).WEBRING_TEST_MODE.sentBeacons
      })
    })
    .toContainEqual(expect.objectContaining(target))
}

const assertHash = async (page: Page, hash: string) => {
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(hash)
}
