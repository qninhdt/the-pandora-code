import { describe, expect, it } from "vitest";
import { collectShellImageUrls } from "../../lib/offline/shell-assets";

const decode = (value: string) => value.replace(/&amp;/gi, "&");

describe("shell image collection", () => {
  it("keeps the brand mark and chapter covers, and drops the rest", () => {
    const html = `
      <img src="/_next/image?url=%2Flogo.png&amp;w=96&amp;q=75" />
      <img src="/images/chapters/where-is-pandora/fig-00-cover.webp" />
      <img src="/author.png" />
      <img src="/images/glossary/eywa/cover.webp" />
      <img src="/images/pages/chapters.png" />
      <img src="https://cdn.example.test/off-origin.webp" />
      <img src="/images/chapters/../../etc/passwd" />
    `;
    expect(collectShellImageUrls(html, decode)).toEqual([
      "/_next/image?url=%2Flogo.png&w=96&q=75",
      "/images/chapters/where-is-pandora/fig-00-cover.webp",
      "/author.png",
    ]);
  });

  it("stores one entry per image even when a document repeats it", () => {
    const html = `
      <img src="/images/chapters/pandoras-ocean/fig-00-cover.webp" />
      <img src="/images/chapters/pandoras-ocean/fig-00-cover.webp" />
    `;
    expect(collectShellImageUrls(html, decode)).toEqual([
      "/images/chapters/pandoras-ocean/fig-00-cover.webp",
    ]);
  });
});
