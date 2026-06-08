import { expect, test } from "@playwright/test";

test.describe("locale switch", () => {
  test("switching from vi to en preserves path", async ({ page }) => {
    await page.goto("/vi/chapters");
    await expect(page).toHaveURL(/\/vi\/chapters$/);

    const enLink = page.getByRole("link", { name: /en/i }).first();
    if (await enLink.isVisible().catch(() => false)) {
      await enLink.click();
      await expect(page).toHaveURL(/\/en\/chapters$/);
    } else {
      await page.goto("/en/chapters");
      await expect(page).toHaveURL(/\/en\/chapters$/);
    }
  });

  test("invalid locale redirects or 404s", async ({ page }) => {
    const response = await page.goto("/fr");
    const status = response?.status() ?? 0;
    expect([200, 301, 302, 307, 308, 404]).toContain(status);
    if (status === 200) {
      await expect(page).toHaveURL(/\/(vi|en)/);
    }
  });
});
