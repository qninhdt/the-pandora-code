import { PageBackground } from "@/components/layout/page-background";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("PageBackground", () => {
  it("renders a decorative full-bleed image with the given src", () => {
    const { container } = render(<PageBackground src="/images/pages/chapters.png" />);

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("/images/pages/chapters.png");
    // Empty alt + aria-hidden: purely decorative, invisible to assistive tech.
    expect(img?.getAttribute("alt")).toBe("");
    expect(container.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
  });

  it("accepts a custom scrim intensity without crashing", () => {
    const { container } = render(
      <PageBackground src="/images/pages/timeline.png" intensity={0.4} />,
    );
    expect(container.querySelector("img")).not.toBeNull();
  });
});
