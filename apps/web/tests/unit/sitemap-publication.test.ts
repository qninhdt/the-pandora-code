import sitemap from "@/app/sitemap";
import { describe, expect, it } from "vitest";

describe("sitemap publication boundary", () => {
  it("emits published chapters and topics", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.some((url) => url.includes("the-aerial-arms-race"))).toBe(true);
    expect(urls.some((url) => url.includes("fire-ecology"))).toBe(true);
    expect(urls.some((url) => url.includes("non-existent-topic"))).toBe(false);
  });

  it("emits localized alternates only for published topic locales", () => {
    const topic = sitemap().find((entry) => entry.url.endsWith("/topics/astronomy"));
    expect(topic).toBeDefined();
    expect(topic?.alternates?.languages?.en).toContain("/en/topics/astronomy");
  });
});
