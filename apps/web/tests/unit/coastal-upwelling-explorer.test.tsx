import { CoastalUpwellingExplorer } from "@/components/content/coastal-upwelling-explorer";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("CoastalUpwellingExplorer", () => {
  it("starts with equatorward-wind upwelling", () => {
    renderWithIntl(<CoastalUpwellingExplorer />);
    expect(screen.getByText("Offshore")).toBeInTheDocument();
    expect(screen.getByText("Deep water rises")).toBeInTheDocument();
  });

  it("reverses to downwelling with poleward wind", () => {
    renderWithIntl(<CoastalUpwellingExplorer />);
    fireEvent.click(screen.getByRole("radio", { name: "Poleward wind" }));
    expect(screen.getByText("Onshore")).toBeInTheDocument();
    expect(screen.getByText("Surface water sinks")).toBeInTheDocument();
  });

  it("keeps the controls accessible in Vietnamese", () => {
    renderWithIntl(<CoastalUpwellingExplorer />, "vi");
    expect(screen.getByRole("radio", { name: "Bắc bán cầu" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Gió hướng xích đạo" })).toBeInTheDocument();
  });
});
