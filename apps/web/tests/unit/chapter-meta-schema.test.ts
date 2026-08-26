import { ChapterMeta } from "@/lib/content/schemas/chapter-meta";
import { describe, expect, it } from "vitest";

describe("ChapterMeta schema", () => {
  const valid = {
    slug: "demo",
    status: "published",
    title: { vi: "T", en: "T" },
    hook: { vi: "H", en: "H" },
    authors: ["bardabez"],
    tags: [],
    classification: {
      canon_pct: 25,
      inference_pct: 25,
      speculation_pct: 25,
      real_science_pct: 25,
    },
    related_chapters: [],
    glossary_terms: [],
    figures: [],
    sources: [],
  };

  it("accepts a valid meta", () => {
    expect(() => ChapterMeta.parse(valid)).not.toThrow();
  });

  it("accepts locale-specific overrides only with a reason", () => {
    expect(
      ChapterMeta.parse({
        ...valid,
        reading_time_override: {
          en: { minutes: 7, reason: "Reviewed after a recorded editorial read-through" },
        },
      }).reading_time_override?.en?.minutes,
    ).toBe(7);
  });

  it("rejects a localized override without a reason", () => {
    expect(() =>
      ChapterMeta.parse({
        ...valid,
        reading_time_override: { vi: { minutes: 7, reason: "  " } },
      }),
    ).toThrow();
  });

  it("rejects the removed shared reading-time field", () => {
    expect(() => ChapterMeta.parse({ ...valid, reading_time_min: 5 })).toThrow();
  });

  it("rejects classification not summing to 100", () => {
    const bad = { ...valid, classification: { ...valid.classification, canon_pct: 26 } };
    expect(() => ChapterMeta.parse(bad)).toThrow();
  });

  it("rejects duplicate figure ids", () => {
    const bad = {
      ...valid,
      figures: [
        { id: "fig-01-a", role: "hero", asset_status: "ready" },
        { id: "fig-01-a", role: "inline", asset_status: "ready" },
      ],
    };
    expect(() => ChapterMeta.parse(bad)).toThrow();
  });

  it("rejects malformed figure id", () => {
    const bad = {
      ...valid,
      figures: [{ id: "bad-id", role: "hero", asset_status: "ready" }],
    };
    expect(() => ChapterMeta.parse(bad)).toThrow();
  });

  it("rejects unknown author id", () => {
    const bad = { ...valid, authors: ["not-a-real-author"] };
    expect(() => ChapterMeta.parse(bad)).toThrow();
  });
});
