import { RelatedChapters } from "@/components/reading/related-chapters";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("RelatedChapters", () => {
  it("resolves published chapter slugs into localized links", () => {
    const { getByRole } = renderWithIntl(
      <RelatedChapters slugs={["where-is-pandora"]} locale="vi" />,
      "en",
    );

    expect(getByRole("link", { name: /Pandora nằm ở đâu\?/ })).toHaveAttribute(
      "href",
      "/vi/chapters/where-is-pandora",
    );
  });

  it("does not render links for unknown or unpublished slugs", () => {
    const { container } = renderWithIntl(<RelatedChapters slugs={["does-not-exist"]} />);

    expect(container.firstChild).toBeNull();
  });
});
