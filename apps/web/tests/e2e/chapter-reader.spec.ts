import { expect, test } from "@playwright/test";

const SLUG = "demo-chapter-foundation-shell";

test.describe("chapter reader", () => {
  test("vi chapter renders hero and classification", async ({ page }) => {
    await page.goto(`/vi/chapters/${SLUG}`);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByText(/canon|inference|speculation/i).first()).toBeVisible();
  });

  test("en chapter renders", async ({ page }) => {
    await page.goto(`/en/chapters/${SLUG}`);
    await expect(page.locator("h1")).toBeVisible();
  });

  test("chapters index lists demo chapter", async ({ page }) => {
    await page.goto("/vi/chapters");
    await expect(page.getByRole("link", { name: /demo/i }).first()).toBeVisible();
  });

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/vi/chapters/does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
