import { test, expect, Page } from "@playwright/test";

test.describe("Website information", () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, "#/dt.in.th");
  });

  test("Website title is shown", async ({ page }) => {
    await expect(page.locator("h2")).toHaveText("dt.in.th");
  });

  test("Website description is shown", async ({ page }) => {
    await expect(page.locator(".site-description")).toHaveText(
      "Thai Pangsakulyanont’s web site"
    );
  });

  test("Next button", async ({ page }) => {
    await page.click("#next-button");
    await assertHash(page, "#/notaboutcode.com");
  });

  test("Previous button", async ({ page }) => {
    await page.click("#previous-button");
    await assertHash(page, "#/wonderful.software");
  });
});

test.describe("Visiting directly", () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, "#");
  });

  test("selects a random website", async ({ page }) => {
    await assertHash(page, "#/garden.narze.live");
  });

  test("should send beacon when visiting that site", async ({ page }) => {
    await page.click('[data-cy="go:garden.narze.live"]');
    await assertBeacon(page, {
      action: "outbound",
      site: "garden.narze.live",
      referrer: "",
    });
  });
});

test.describe("inbound links", () => {
  test.beforeEach(async ({ page }) => {
    await visit(page, "#dt.in.th");
  });

  test("should automatically advance to next page", async ({ page }) => {
    await page.click('[data-cy="go:notaboutcode.com"]');
    await assertHash(page, "#/notaboutcode.com");
  });

  test("should send beacon upon entering", async ({ page }) => {
    await assertBeacon(page, {
      action: "inbound",
      site: "dt.in.th",
    });
  });

  test("should send beacon when visiting next site", async ({ page }) => {
    await page.click('[data-cy="go:garden.narze.live"]');
    await assertBeacon(page, {
      action: "outbound",
      site: "garden.narze.live",
      referrer: "dt.in.th",
    });
  });
});

const visit = (page: Page, route: string) =>
  page.goto(`/?test=1&test_onboarded=1${route}`);

const assertBeacon = async (page: Page, target: any) => {
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return (window as any).WEBRING_TEST_MODE.sentBeacons;
      });
    })
    .toContainEqual(expect.objectContaining(target));
};

const assertHash = async (page: Page, hash: string) => {
  await expect.poll(() => page.evaluate(() => window.location.hash)).toBe(hash);
};
