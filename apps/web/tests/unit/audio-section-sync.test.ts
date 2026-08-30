import {
  audioIndexForHeading,
  buildAudioHeadingMap,
} from "@/components/reading/audio-section-sync";
import type { TocHeading } from "@/components/reading/table-of-contents";
import { describe, expect, it } from "vitest";

const sectionIds = ["sec-00", "sec-01", "sec-02"];

const headings: TocHeading[] = [
  { id: "first", text: "First", depth: 2 },
  { id: "first-detail", text: "Detail", depth: 3 },
  { id: "second", text: "Second", depth: 2 },
];

describe("audio section heading mapping", () => {
  it("leaves the intro unanchored and maps numbered sections to top-level headings", () => {
    expect([...buildAudioHeadingMap(headings, sectionIds)]).toEqual([
      ["sec-01", "first"],
      ["sec-02", "second"],
    ]);
  });

  it("resolves a heading back to its marker index and rejects unknown headings", () => {
    expect(audioIndexForHeading(headings, sectionIds, "first")).toBe(1);
    expect(audioIndexForHeading(headings, sectionIds, "first-detail")).toBe(1);
    expect(audioIndexForHeading(headings, sectionIds, "second")).toBe(2);
    expect(audioIndexForHeading(headings, sectionIds, "missing")).toBe(-1);
  });
});
