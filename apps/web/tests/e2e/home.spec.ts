import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("vi home renders brand and CTA", async ({ page }) => {
    await page.goto("/vi");
    await expect(page).toHaveURL(/\/vi$/);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("link", { name: /pandora/i }).first()).toBeVisible();
  });

  test("en home renders", async ({ page }) => {
    await page.goto("/en");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("banner")).toBeVisible();
  });

  test("root redirects to default locale", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.url()).toMatch(/\/(vi|en)\/?$/);
  });
});
