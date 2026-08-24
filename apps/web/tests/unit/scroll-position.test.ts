import {
  SCROLL_POSITION_MAX_AGE_MS,
  consumeScrollPosition,
  rememberScrollPosition,
} from "@/lib/navigation/scroll-position";
import { beforeEach, describe, expect, it } from "vitest";

describe("locale scroll hand-off", () => {
  beforeEach(() => sessionStorage.clear());

  it("stores a position for one destination and consumes it once", () => {
    expect(rememberScrollPosition("/en/chapters", 812.7, 10_000)).toBe(true);
    expect(consumeScrollPosition("/en/chapters", 10_500)).toBe(813);
    expect(consumeScrollPosition("/en/chapters", 10_500)).toBeNull();
  });

  it("ignores stale hand-offs", () => {
    rememberScrollPosition("/en", 400, 10_000);
    expect(consumeScrollPosition("/en", 10_000 + SCROLL_POSITION_MAX_AGE_MS + 1)).toBeNull();
  });
});
