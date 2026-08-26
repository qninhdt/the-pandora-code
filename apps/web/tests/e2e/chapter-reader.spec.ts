import { expect, test } from "@playwright/test";

const SLUG = "reading-pandora-as-a-specimen";

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

  test("chapters index lists a published chapter", async ({ page }) => {
    await page.goto("/vi/chapters");
    await expect(
      page.locator('a[href="/vi/chapters/reading-pandora-as-a-specimen"]').first(),
    ).toBeVisible();
  });

  test("continue reading card stays inside the desktop content rail", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(() => {
      localStorage.setItem(
        "pandora:reading-history:v1",
        JSON.stringify({
          version: 1,
          data: [
            {
              locale: "vi",
              slug: "reading-pandora-as-a-specimen",
              progress: 0.83,
              updatedAt: Date.now(),
              completed: false,
            },
          ],
        }),
      );
    });
    await page.goto("/vi");

    const card = page.getByRole("link", { name: "83%" }).locator("..");
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    const viewport = page.viewportSize();
    expect(box).not.toBeNull();
    expect(viewport).not.toBeNull();
    expect(box!.x).toBeGreaterThan(100);
    expect(viewport!.width - (box!.x + box!.width)).toBeGreaterThan(100);
  });

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/vi/chapters/does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
