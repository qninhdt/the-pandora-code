import { GyreBoundaryCurrents } from "@/components/content/gyre-boundary-currents";
import {
  buildGyreLoop,
  limbSpeed,
  limbWidth,
} from "@/components/content/gyre-boundary-currents-model";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("gyre loop model", () => {
  it("leaves both long margins identical with no latitude gradient", () => {
    expect(limbSpeed("west", 0)).toBe(limbSpeed("east", 0));
    expect(limbWidth("west", 0)).toBe(limbWidth("east", 0));
  });

  it("makes the western margin fast and narrow, the eastern slow and broad", () => {
    expect(limbSpeed("west", 1)).toBeGreaterThan(limbSpeed("east", 1));
    expect(limbWidth("west", 1)).toBeLessThan(limbWidth("east", 1));
  });

  it("spends less of the circuit on the western margin once it intensifies", () => {
    const symmetric = buildGyreLoop(0, true);
    const skewed = buildGyreLoop(1, true);
    expect(symmetric.limbShare.west).toBeCloseTo(symmetric.limbShare.east, 2);
    expect(skewed.limbShare.west).toBeLessThan(skewed.limbShare.east);
  });

  it("keeps the western margin on the western side in either hemisphere", () => {
    const north = buildGyreLoop(0.8, true);
    const south = buildGyreLoop(0.8, false);
    expect(north.limbShare.west).toBeCloseTo(south.limbShare.west, 2);
  });
});

describe("GyreBoundaryCurrents", () => {
  it("opens on an intensified western margin", () => {
    renderWithIntl(<GyreBoundaryCurrents />);
    expect(screen.getByText("Narrow, deep, fast")).toBeInTheDocument();
    expect(
      screen.getByText(/lingers on the eastern side and sprints down the western one/),
    ).toBeInTheDocument();
  });

  it("evens the loop out when rotation grips the same at every latitude", () => {
    renderWithIntl(<GyreBoundaryCurrents />);
    fireEvent.change(screen.getByLabelText("How much rotation's grip changes with latitude"), {
      target: { value: "0" },
    });
    expect(screen.getByText(/A fair racetrack/)).toBeInTheDocument();
    expect(screen.getByText("No change")).toBeInTheDocument();
  });

  it("offers both hemispheres without changing which margin is fast", () => {
    renderWithIntl(<GyreBoundaryCurrents />);
    fireEvent.click(screen.getByRole("radio", { name: "Southern" }));
    expect(screen.getByText("Narrow, deep, fast")).toBeInTheDocument();
  });

  it("renders the Vietnamese controls and verdict", () => {
    renderWithIntl(<GyreBoundaryCurrents />, "vi");
    expect(screen.getByRole("radio", { name: "Bắc bán cầu" })).toBeInTheDocument();
    expect(screen.getByText("Hẹp, sâu, chảy nhanh")).toBeInTheDocument();
  });
});
