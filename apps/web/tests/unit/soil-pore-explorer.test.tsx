import { SoilPoreExplorer } from "@/components/content/soil-pore-explorer";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("SoilPoreExplorer", () => {
  it("defaults to the connected moist pore", () => {
    renderWithIntl(<SoilPoreExplorer />);
    expect(screen.getByText("Fast")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Moist" })).toHaveAttribute("aria-checked", "true");
  });

  it("reveals oxygen loss when the pore floods", () => {
    renderWithIntl(<SoilPoreExplorer />);
    fireEvent.click(screen.getByRole("radio", { name: "Saturated" }));
    expect(screen.getByText("Low; anoxic pockets")).toBeInTheDocument();
    expect(screen.getByText("Slower")).toBeInTheDocument();
  });

  it("renders Vietnamese controls", () => {
    renderWithIntl(<SoilPoreExplorer />, "vi");
    expect(screen.getByRole("radio", { name: "Ẩm vừa" })).toBeInTheDocument();
  });
});
