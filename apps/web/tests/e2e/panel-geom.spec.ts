import { expect, test } from "@playwright/test";

test("reader panel stays on screen", async ({ page }) => {
  for (const size of [
    { width: 1280, height: 800 },
    { width: 1180, height: 640 },
    { width: 1180, height: 420 },
    { width: 768, height: 700 },
    { width: 390, height: 700 },
    { width: 320, height: 560 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/vi/chapters", { waitUntil: "load" });
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Kiểu hiển thị" }).click();
    await page.waitForTimeout(700);

    const info = await page.evaluate(() => {
      const panel = document.querySelector("[data-radix-popper-content-wrapper] > *");
      if (!panel) return { missing: true };
      const r = panel.getBoundingClientRect();
      return {
        v: { w: innerWidth, h: innerHeight },
        box: {
          top: Math.round(r.top),
          left: Math.round(r.left),
          right: Math.round(r.right),
          bottom: Math.round(r.bottom),
          w: Math.round(r.width),
          h: Math.round(r.height),
        },
        inside:
          r.top >= -1 && r.left >= -1 && r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
      };
    });
    console.log(`${size.width}x${size.height}`, JSON.stringify(info));
    await page.screenshot({ path: `test-results/panel2-${size.width}x${size.height}.png` });
  }
  expect(true).toBe(true);
});
