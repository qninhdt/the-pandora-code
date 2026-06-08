import { DataComparison } from "@/components/content/data-comparison";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("DataComparison", () => {
  it("renders legacy MDX items without crashing", () => {
    render(
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
    const { container } = render(<DataComparison />);
    expect(container.firstChild).toBeNull();
  });
});
