import { expect, test } from "@playwright/test";

const CHAPTER = "/vi/chapters/where-is-pandora";
const PLAYER = "Trình phát chương";
const LISTEN = "Nghe chương này";

interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

test("audio is opt-in and plays the chapter as one continuous track", async ({ page }) => {
  await page.goto(CHAPTER);
  const player = page.getByRole("group", { name: PLAYER });
  await expect(player).toHaveCount(0);

  await page.getByRole("button", { name: LISTEN }).click();
  await expect(player).toBeVisible();

  // A single media element covering the whole chapter, not one file per section.
  await expect(page.locator("audio")).toHaveCount(1);
  const scrubber = player.getByRole("slider", { name: "Thời điểm hiện tại" });
  await expect
    .poll(async () => Number(await scrubber.getAttribute("aria-valuemax")))
    .toBeGreaterThan(2000);

  await player.getByRole("button", { name: "Đóng trình phát" }).click();
  await expect(player).toHaveCount(0);
});

test("no audio surface exists outside a chapter", async ({ page }) => {
  await page.goto("/vi");
  await expect(page.getByRole("group", { name: PLAYER })).toHaveCount(0);
  await expect(page.locator("audio")).toHaveCount(0);
});

for (const [name, width, height] of [
  ["desktop", 1280, 800],
  ["tablet", 768, 900],
  ["mobile", 390, 780],
] as const) {
  test(`player fits the ${name} viewport without covering the bottom controls`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto(CHAPTER);
    await page.getByRole("button", { name: LISTEN }).click();
    const player = page.getByRole("group", { name: PLAYER });
    await expect(player).toBeVisible();
    const playerBox = await player.boundingBox();
    expect(playerBox).not.toBeNull();
    if (!playerBox) return;

    // The bottom-left ToC trigger and bottom-right reader settings share z-40
    // with the player, so a collision would hide a control rather than reflow.
    for (const control of [
      page.locator("button.fixed.bottom-5.left-5"),
      page.locator("div.fixed.bottom-5.right-5 button").first(),
    ]) {
      if ((await control.count()) === 0 || !(await control.first().isVisible())) continue;
      const box = await control.first().boundingBox();
      if (!box) continue;
      expect(overlaps(playerBox, box), `player overlaps a bottom control on ${name}`).toBe(false);
    }

    expect(playerBox.x).toBeGreaterThanOrEqual(0);
    expect(playerBox.x + playerBox.width).toBeLessThanOrEqual(width + 0.5);
    expect(playerBox.y + playerBox.height).toBeLessThanOrEqual(height + 0.5);

    for (const label of ["Tạm dừng", "Phát", "Đóng trình phát"]) {
      const button = player.getByRole("button", { name: label });
      if ((await button.count()) === 0) continue;
      const box = await button.first().boundingBox();
      if (!box) continue;
      expect(
        Math.min(box.width, box.height),
        `${label} is too small on ${name}`,
      ).toBeGreaterThanOrEqual(31);
    }
  });
}
