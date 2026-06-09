import { HabitableZoneExplorer } from "@/components/content/habitable-zone-explorer";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("HabitableZoneExplorer", () => {
  it("renders the temperate-band status for the default Pandora setup", () => {
    renderWithIntl(<HabitableZoneExplorer />);
    // Default luminosity 1.5 / distance 1.25 AU falls inside the band.
    expect(screen.getByText("Just right — liquid water survives")).toBeInTheDocument();
  });

  it("reports too hot when the world is dragged in close", () => {
    renderWithIntl(<HabitableZoneExplorer />);
    const distance = screen.getByLabelText("Orbital distance (AU)");
    fireEvent.change(distance, { target: { value: "0.3" } });
    expect(screen.getByText("Too hot — oceans boil away")).toBeInTheDocument();
  });

  it("reports too cold when the world is dragged far out", () => {
    renderWithIntl(<HabitableZoneExplorer />);
    const distance = screen.getByLabelText("Orbital distance (AU)");
    fireEvent.change(distance, { target: { value: "2.9" } });
    expect(screen.getByText("Too cold — water freezes solid")).toBeInTheDocument();
  });

  it("renders localized labels in Vietnamese", () => {
    renderWithIntl(<HabitableZoneExplorer />, "vi");
    expect(screen.getByText("Ôn đới")).toBeInTheDocument();
    expect(screen.getByLabelText("Khoảng cách quỹ đạo (AU)")).toBeInTheDocument();
  });
});
