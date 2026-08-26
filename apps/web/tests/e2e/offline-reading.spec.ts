import { expect, test } from "@playwright/test";

/**
 * Offline reading is the product promise, so verify it the way a reader meets
 * it: install the worker on a first visit, download a chapter, then require the
 * navigation shell and that chapter to be genuinely stored.
 *
 * Note on the offline phase: `context.setOffline` does not apply to fetches the
 * service worker itself makes, so a navigation "offline" can still be answered
 * from the network. The cache assertions below are therefore the load-bearing
 * ones — they prove what a reader would actually have on a plane.
 */
test.describe("offline reading", () => {
  test("stores the shell and a downloaded chapter", async ({ page, context }) => {
    await page.goto("/vi");
    // The worker installs on the first visit but only controls the page after a
    // reload (skipWaiting is off so a reading session is never swapped).
    await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
    await page.reload();
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
      timeout: 30_000,
    });

    // Install-time precaching covers the navigation shell for both locales,
    // including pages this reader never opened.
    const shell = await page.evaluate(async () => {
      const cache = await caches.open("pandora-offline:shell:v1");
      return (await cache.keys()).map((request) => new URL(request.url).pathname);
    });
    for (const path of ["/vi", "/vi/chapters", "/vi/glossary", "/en", "/en/chapters"]) {
      expect(shell, `shell cache holds ${path}`).toContain(path);
    }

    // The offline notice is precached, so an undownloaded chapter shows the
    // book's own message instead of the browser's connection error.
    expect(
      await page.evaluate(() =>
        caches.match("/offline.html", { ignoreSearch: true }).then(Boolean),
      ),
    ).toBe(true);

    await page.goto("/vi/chapters/where-is-pandora");
    await page.getByRole("button", { name: "Tải để đọc offline" }).click();
    await expect(page.getByRole("button", { name: "Tải lại bản mới" })).toBeVisible({
      timeout: 120_000,
    });

    // A downloaded chapter carries its own document plus its figures.
    const chapter = await page.evaluate(async () => {
      const name = (await caches.keys()).find((key) =>
        key.startsWith("pandora-offline:chapter:vi:where-is-pandora:"),
      );
      if (!name) return null;
      const cache = await caches.open(name);
      return (await cache.keys()).map((request) => new URL(request.url).pathname);
    });
    expect(chapter, "chapter cache exists").not.toBeNull();
    expect(chapter).toContain("/vi/chapters/where-is-pandora");
    expect(
      chapter?.filter((path) => path.startsWith("/images/chapters/where-is-pandora/")).length,
      "chapter figures stored alongside the document",
    ).toBeGreaterThan(0);

    // With the network cut, the stored pages still render and their figures
    // resolve from the chapter cache.
    await context.setOffline(true);
    for (const path of ["/vi", "/vi/chapters", "/vi/glossary"]) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `offline navigation to ${path}`).toBe(200);
      await expect(page.locator("header nav a").first()).toBeAttached();
    }

    await page.goto("/vi/chapters/where-is-pandora", { waitUntil: "load" });
    await expect(page.locator("h1")).toHaveText("Pandora nằm ở đâu?");
    expect(await page.locator("article p").count()).toBeGreaterThan(20);
    expect(
      await page.$$eval(
        "article img",
        (nodes) => nodes.filter((node) => (node as HTMLImageElement).naturalWidth === 0).length,
      ),
      "figures served without the network",
    ).toBe(0);
  });
});
