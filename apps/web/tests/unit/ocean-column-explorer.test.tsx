import { OceanColumnExplorer } from "@/components/content/ocean-column-explorer";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("OceanColumnExplorer", () => {
  it("starts with a stratified water column", () => {
    renderWithIntl(<OceanColumnExplorer />);
    expect(screen.getByRole("radio", { name: "Stratified" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getAllByText("Pycnocline")).toHaveLength(2);
  });

  it("shows the rising-water regime", () => {
    renderWithIntl(<OceanColumnExplorer />);
    fireEvent.click(screen.getByRole("radio", { name: "Upwelling" }));
    expect(
      screen.getByText(
        "Rising water lifts the nutrient boundary, but it does not bring sunlight into the abyss.",
      ),
    ).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<OceanColumnExplorer />, "vi");
    expect(screen.getByRole("radio", { name: "Phân tầng" })).toBeInTheDocument();
    expect(screen.getByLabelText("Độ sâu đầu dò")).toBeInTheDocument();
  });
});
