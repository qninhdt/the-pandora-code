import { buildPageMetadata } from "@/lib/seo/page-metadata";
import { getSiteUrl } from "@/lib/seo/site-url";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("page metadata", () => {
  it("defaults route metadata to website semantics", () => {
    const metadata = buildPageMetadata({
      locale: "en",
      path: "/chapters",
      title: "Chapters",
      description: "The library",
    });

    expect((metadata.openGraph as { type?: string } | undefined)?.type).toBe("website");
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en/chapters");
    expect(metadata.alternates?.languages).toEqual({
      vi: "http://localhost:3000/vi/chapters",
      en: "http://localhost:3000/en/chapters",
    });
  });

  it("uses article semantics only when explicitly requested", () => {
    const metadata = buildPageMetadata({
      locale: "vi",
      path: "/chapters/example",
      title: "Chapter",
      description: "Summary",
      availableLocales: ["vi"],
      pageType: "article",
    });

    expect((metadata.openGraph as { type?: string } | undefined)?.type).toBe("article");
    expect(metadata.alternates?.languages).toEqual({
      vi: "http://localhost:3000/vi/chapters/example",
    });
  });

  it("requires an absolute site URL in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(() => getSiteUrl()).toThrow(/NEXT_PUBLIC_SITE_URL must be set/);
  });
});
