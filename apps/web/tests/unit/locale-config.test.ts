import { defaultLocale, isLocale, locales } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { describe, expect, it } from "vitest";

describe("locale config", () => {
  it("includes vi and en", () => {
    expect(locales).toContain("vi");
    expect(locales).toContain("en");
  });

  it("defaults to en", () => {
    expect(defaultLocale).toBe("en");
  });

  it("lists en before vi", () => {
    expect(locales[0]).toBe("en");
  });

  it("isLocale rejects unknown", () => {
    expect(isLocale("vi")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("fr")).toBe(false);
    expect(isLocale("")).toBe(false);
  });

  it("loads every locale catalog without dynamic module resolution", () => {
    expect(getMessages("en")).toHaveProperty("viz.seismicShadow.title");
    expect(getMessages("vi")).toHaveProperty("viz.seismicShadow.title");
    expect(getMessages("en")).toHaveProperty("viz.perchedWaterBudget.title");
    expect(getMessages("vi")).toHaveProperty("viz.perchedWaterBudget.title");
  });
});
