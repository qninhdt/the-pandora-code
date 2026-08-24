import {
  clearReadingTimeCache,
  estimateReadingTime,
  estimateReadingTimeCached,
  extractVisibleMdxText,
} from "@/lib/content/reading-time";
import { describe, expect, it } from "vitest";

describe("reading-time extractor", () => {
  it("keeps visible prose and JSX children while excluding syntax", () => {
    const source = [
      'import { Widget } from "./widget";',
      "",
      '<DiagramFigure alt="prop words must not count" src="https://example.com/image.webp" />',
      "",
      "## Visible heading",
      "",
      'Visible [link label](https://example.com) and <GlossaryTerm slug="hidden-prop">visible child</GlossaryTerm>.',
      "",
      "| cell one | cell two |",
      "| --- | --- |",
      "",
      "```ts",
      'const hidden = "not reader text";',
      "```",
      "",
      '<InteractiveWidget data={{ hidden: "expression" }} />',
    ].join("\n");
    const visible = extractVisibleMdxText(source);

    expect(visible).toContain("Visible heading");
    expect(visible).toContain("link label");
    expect(visible).toContain("visible child");
    expect(visible).toContain("cell one");
    expect(visible).not.toContain("prop words");
    expect(visible).not.toContain("example.com");
    expect(visible).not.toContain("hidden");
  });

  it("counts Vietnamese whitespace syllable tokens independently from English words", () => {
    const vi = estimateReadingTime("Đây là một câu tiếng Việt.", "vi");
    const en = estimateReadingTime("One small English sentence.", "en");

    expect(vi.diagnostics.textUnits).toBe(6);
    expect(en.diagnostics.textUnits).toBe(4);
    expect(vi.diagnostics.wordsPerMinute).toBe(260);
    expect(en.diagnostics.wordsPerMinute).toBe(220);
  });

  it("caps visual allowance relative to prose and supports a reasoned override", () => {
    const prose = Array.from({ length: 440 }, (_, index) => `word${index}`).join(" ");
    const derived = estimateReadingTime(`${prose}\n<InteractiveChart />`, "en", {
      figureCount: 10,
    });
    const overridden = estimateReadingTime(prose, "en", {
      override: { minutes: 9, reason: "Editorial read-through" },
    });

    expect(derived.diagnostics.interactiveBlockCount).toBe(1);
    expect(derived.diagnostics.visualMinutes).toBeLessThanOrEqual(
      derived.diagnostics.baseMinutes * 0.25,
    );
    expect(overridden.minutes).toBe(9);
    expect(overridden.diagnostics.overrideReason).toBe("Editorial read-through");
  });

  it("caches by path, locale, source fingerprint, and metadata inputs", () => {
    clearReadingTimeCache();
    const first = estimateReadingTimeCached("chapter/en.mdx", "one two three", "en");
    const second = estimateReadingTimeCached("chapter/en.mdx", "one two three", "en");
    const otherLocale = estimateReadingTimeCached("chapter/en.mdx", "one two three", "vi");

    expect(second).toBe(first);
    expect(otherLocale).not.toBe(first);
  });
});
