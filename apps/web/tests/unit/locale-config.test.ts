import { defaultLocale, isLocale, locales } from "@/i18n/config";
import { describe, expect, it } from "vitest";

describe("locale config", () => {
  it("includes vi and en", () => {
    expect(locales).toContain("vi");
    expect(locales).toContain("en");
  });

  it("defaults to vi", () => {
    expect(defaultLocale).toBe("vi");
  });

  it("isLocale rejects unknown", () => {
    expect(isLocale("vi")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });
});
