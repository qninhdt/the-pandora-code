import { expect, test } from "@playwright/test";

test("sw controller diagnostics", async ({ page }) => {
  page.on("console", (m) => console.log(`[${m.type()}] ${m.text().slice(0, 300)}`));
  page.on("pageerror", (e) => console.log(`[pageerror] ${e.message.slice(0, 400)}`));
  page.on("requestfailed", (r) =>
    console.log(`[reqfail] ${r.url().slice(0, 120)} ${r.failure()?.errorText}`),
  );
  await page.goto("/vi");
  console.log(
    "manual register:",
    JSON.stringify(
      await page.evaluate(async () => {
        try {
          const reg = await navigator.serviceWorker.register("/serwist/sw.js", { scope: "/" });
          return { ok: true, scope: reg.scope, state: reg.installing?.state ?? reg.active?.state };
        } catch (error) {
          return { ok: false, error: String(error) };
        }
      }),
    ),
  );
  for (let i = 0; i < 8; i++) {
    const state = await page.evaluate(async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      return {
        controller: navigator.serviceWorker.controller?.scriptURL ?? null,
        regs: regs.map((r) => ({
          scope: r.scope,
          installing: r.installing?.state ?? null,
          waiting: r.waiting?.state ?? null,
          active: r.active?.state ?? null,
        })),
      };
    });
    console.log(i, JSON.stringify(state));
    if (state.regs.some((r) => r.active === "activated")) break;
    await page.waitForTimeout(2000);
  }
  await page.reload();
  await page.waitForTimeout(2000);
  console.log(
    "after reload:",
    JSON.stringify(
      await page.evaluate(async () => ({
        controller: navigator.serviceWorker.controller?.scriptURL ?? null,
        regs: (await navigator.serviceWorker.getRegistrations()).map((r) => ({
          installing: r.installing?.state ?? null,
          waiting: r.waiting?.state ?? null,
          active: r.active?.state ?? null,
        })),
      })),
    ),
  );
  expect(true).toBe(true);
});
