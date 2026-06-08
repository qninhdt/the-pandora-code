import { getChapter, listChapterSlugs } from "@/lib/content/loader/chapter-loader";
import { describe, expect, it } from "vitest";

describe("chapter-loader", () => {
  it("excludes underscore-prefixed directories from slugs", () => {
    const slugs = listChapterSlugs();
    expect(slugs.every((s) => !s.startsWith("_"))).toBe(true);
  });

  it("returns null for unknown slug", () => {
    expect(getChapter("does-not-exist", "vi")).toBeNull();
  });
});
