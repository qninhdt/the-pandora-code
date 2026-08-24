import { describe, expect, it } from "vitest";
import { isOfflineRequest } from "../../lib/offline/types";

describe("offline protocol validation", () => {
  it("accepts only typed chapter operations", () => {
    expect(
      isOfflineRequest({
        type: "DOWNLOAD_CHAPTER",
        protocolVersion: 1,
        locale: "vi",
        slug: "where-is-pandora",
      }),
    ).toBe(true);
    expect(isOfflineRequest({ type: "GET_STATUS", protocolVersion: 1, locale: "en" })).toBe(true);
    expect(
      isOfflineRequest({
        type: "DOWNLOAD_CHAPTER",
        protocolVersion: 1,
        locale: "fr",
        slug: "anything",
      }),
    ).toBe(false);
    expect(
      isOfflineRequest({
        type: "DOWNLOAD_CHAPTER",
        protocolVersion: 1,
        locale: "vi",
        slug: "../../private",
      }),
    ).toBe(false);
    expect(isOfflineRequest({ type: "DOWNLOAD_CHAPTER", protocolVersion: 1, locale: "vi" })).toBe(
      false,
    );
  });
});
