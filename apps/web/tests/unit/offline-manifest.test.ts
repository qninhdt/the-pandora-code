import { describe, expect, it } from "vitest";
import {
  chapterCacheName,
  isOwnedOfflineCache,
  stagingCacheName,
} from "../../lib/offline/cache-names";
import { extractAssetUrls } from "../../scripts/build-offline-manifest";

describe("offline chapter manifest helpers", () => {
  it("extracts only absolute asset references and handles srcset", () => {
    const source = `
      <Figure src="/images/chapters/where-is-pandora/fig-01.webp" />
      <video poster='/images/chapters/where-is-pandora/poster.webp' />
      <img srcSet="/images/chapters/where-is-pandora/fig-02.webp 1x, /images/chapters/where-is-pandora/fig-02@2x.webp 2x" />
      <img src="https://cdn.example.test/not-allowed.webp" />
    `;
    expect(extractAssetUrls(source)).toEqual([
      "/images/chapters/where-is-pandora/fig-01.webp",
      "/images/chapters/where-is-pandora/poster.webp",
      "/images/chapters/where-is-pandora/fig-02.webp",
      "/images/chapters/where-is-pandora/fig-02@2x.webp",
    ]);
  });

  it("keeps chapter cache generations immutable and names owned caches", () => {
    const cache = chapterCacheName("vi", "where-is-pandora", "a".repeat(64));
    expect(cache).toBe(`pandora-offline:chapter:vi:where-is-pandora:${"a".repeat(64)}`);
    expect(chapterCacheName("vi", "where-is-pandora", "a".repeat(64))).toBe(cache);
    expect(stagingCacheName("vi", "where-is-pandora", 42)).toContain(
      "pandora-offline:staging:vi:where-is-pandora:42",
    );
    expect(isOwnedOfflineCache(cache)).toBe(true);
    expect(isOwnedOfflineCache("static-image-assets")).toBe(false);
  });
});
