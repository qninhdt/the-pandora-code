import { ChapterMeta } from "@/lib/content/schemas/chapter-meta";
import { describe, expect, it } from "vitest";

describe("ChapterMeta schema", () => {
  const valid = {
    slug: "demo",
    part: "prologue",
    order: 1,
    status: "published",
    title: { vi: "T", en: "T" },
    hook: { vi: "H", en: "H" },
    authors: ["bardabez"],
    reading_time_min: 5,
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
