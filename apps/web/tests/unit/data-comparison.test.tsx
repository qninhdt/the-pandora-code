import { DataComparison } from "@/components/content/data-comparison";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("DataComparison", () => {
  it("renders legacy MDX items without crashing", () => {
    renderWithIntl(
      <DataComparison
        items={[
          {
            label: "Lab YBCO disc",
            value: "~10 mm",
            note: "hover gap, hands-off",
          },
        ]}
      />,
    );

    expect(screen.getByText("Lab YBCO disc")).toBeInTheDocument();
    expect(screen.getByText("~10 mm")).toBeInTheDocument();
    expect(screen.getByText("hover gap, hands-off")).toBeInTheDocument();
  });

  it("renders nothing when no data is provided", () => {
    const { container } = renderWithIntl(<DataComparison />);
    expect(container.firstChild).toBeNull();
  });
});
