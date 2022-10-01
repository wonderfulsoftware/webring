import { test, expect } from "@playwright/test"

test("First-time guide", async ({ page }) => {
  await page.goto("/")
  await expect(page.locator("#for-first-timer-v2")).toBeVisible()
  await page.locator("text=เข้าสู่วงแหวนเว็บ").click()
  await expect(page.locator("#for-first-timer-v2")).not.toBeVisible()
})
