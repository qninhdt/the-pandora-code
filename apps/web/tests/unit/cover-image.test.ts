import { getChapterCoverImage } from "@/lib/content/loader/cover-image";
import { describe, expect, it } from "vitest";

describe("getChapterCoverImage", () => {
  it("returns the canonical cover figure when present", () => {
    expect(getChapterCoverImage("floating-mountains-and-the-superconductor")).toBe(
      "/images/chapters/floating-mountains-and-the-superconductor/fig-00-cover.png",
    );
  });
});
