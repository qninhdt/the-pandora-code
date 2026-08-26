import { expect, test } from "@playwright/test";

test("provider registration timing", async ({ page }) => {
  page.on("pageerror", (e) => console.log(`[pageerror] ${e.message.slice(0, 300)}`));
  await page.goto("/vi");
  for (let i = 0; i < 10; i++) {
    const state = await page.evaluate(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      return {
        c: navigator.serviceWorker.controller?.scriptURL?.slice(-20) ?? null,
        regs: regs.map((r) => [r.installing?.state, r.waiting?.state, r.active?.state]),
      };
    });
    console.log(`t+${i * 1.5}s`, JSON.stringify(state));
    if (state.regs.some((r) => r[2] === "activated")) break;
    await page.waitForTimeout(1500);
  }
  await page.reload();
  for (let i = 0; i < 6; i++) {
    const c = await page.evaluate(
      () => navigator.serviceWorker.controller?.scriptURL?.slice(-20) ?? null,
    );
    console.log(`post-reload t+${i * 1.5}s controller:`, c);
    if (c) break;
    await page.waitForTimeout(1500);
  }
  expect(true).toBe(true);
});
