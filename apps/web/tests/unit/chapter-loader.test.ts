import {
  getChapter,
  getPublishedChapter,
  listChapterSlugs,
  listPublishedChapters,
} from "@/lib/content/loader/chapter-loader";
import { describe, expect, it } from "vitest";

describe("chapter-loader", () => {
  it("excludes underscore-prefixed directories from slugs", () => {
    const slugs = listChapterSlugs();
    expect(slugs.every((s) => !s.startsWith("_"))).toBe(true);
  });

  it("returns null for unknown slug", () => {
    expect(getChapter("does-not-exist", "vi")).toBeNull();
  });

  it("derives locale-specific reading time for a loaded chapter", () => {
    const chapter = getChapter("where-is-pandora", "en");
    expect(chapter?.readingTimeMin).toBeGreaterThan(0);
    expect(chapter?.readingTimeDiagnostics.locale).toBe("en");
  });

  it("keeps drafts out of the public resolver and published list", () => {
    expect(getPublishedChapter("non-existent-chapter", "en")).toBeNull();
    expect(
      listPublishedChapters("en").every((chapter) => chapter.meta.status === "published"),
    ).toBe(true);
  });
});
