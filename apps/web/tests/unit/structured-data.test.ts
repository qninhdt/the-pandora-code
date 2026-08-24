import { JsonLd } from "@/components/seo/json-ld";
import {
  createArticleSchema,
  createBreadcrumbListSchema,
  createProfilePageSchema,
  createWebSiteSchema,
  validateJsonLd,
} from "@/lib/seo/structured-data";
import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

describe("structured data", () => {
  it("creates supported schema.org objects with absolute URLs", () => {
    const site = createWebSiteSchema({ name: "The Pandora Code", alternateName: "Pandora" });
    const article = createArticleSchema({
      url: "/en/chapters/example",
      headline: "A chapter",
      description: "A visible summary.",
      image: "/images/example.webp",
      author: { name: "Bardabez", url: "/en/author" },
    });
    const breadcrumbs = createBreadcrumbListSchema([
      { name: "Chapters", item: "/en/chapters" },
      { name: "A chapter", item: "/en/chapters/example" },
    ]);
    const profile = createProfilePageSchema({
      url: "/en/author",
      name: "Bardabez",
      description: "Visible author bio.",
    });

    expect(site["@type"]).toBe("WebSite");
    expect(article.url).toMatch(/^http:\/\/localhost:3000\//);
    expect((article.author as Array<{ url: string }>)[0].url).toMatch(/^http:/);
    expect(breadcrumbs.itemListElement).toHaveLength(2);
    expect(profile["@type"]).toBe("ProfilePage");
    expect(() => validateJsonLd([site, article, breadcrumbs, profile])).not.toThrow();
  });

  it("rejects malformed schema objects before render", () => {
    expect(() =>
      validateJsonLd({ "@context": "https://example.com", "@type": "Article" }),
    ).toThrow();
    expect(() =>
      createArticleSchema({
        url: "/en/chapters/example",
        headline: "",
        description: "summary",
        author: { name: "Bardabez" },
      }),
    ).toThrow();
  });

  it("escapes script-breaking characters in JSON-LD output", () => {
    const schema = createArticleSchema({
      url: "/en/chapters/example",
      headline: "<script>alert(1)</script>",
      description: "Visible summary",
      author: { name: "Bardabez" },
    });
    const { container } = render(createElement(JsonLd, { data: schema }));
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(script?.textContent).toContain("\\u003cscript\\u003e");
    expect(script?.textContent).not.toContain("<script>");
  });
});
