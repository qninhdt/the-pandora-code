import { EclipseSeasonThreader } from "@/components/content/eclipse-season-threader";
import {
  eclipseSeasonFraction,
  shadowFit,
  shadowOffset,
} from "@/components/content/eclipse-season-threader-model";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("eclipse-season geometry", () => {
  it("eclipses every lap of every year when the orbit is not tilted", () => {
    expect(shadowOffset(0, 45)).toBe(0);
    expect(shadowFit(shadowOffset(0, 45))).toBe("total");
    expect(eclipseSeasonFraction(0)).toBe(1);
  });

  it("narrows the eclipse seasons as the tilt steepens", () => {
    expect(eclipseSeasonFraction(25)).toBeLessThan(eclipseSeasonFraction(10));
    expect(eclipseSeasonFraction(40)).toBeLessThan(eclipseSeasonFraction(25));
  });
});

describe("EclipseSeasonThreader", () => {
  it("threads the shadow near node alignment", () => {
    renderWithIntl(<EclipseSeasonThreader />);
    expect(screen.getByText("Total eclipse")).toBeInTheDocument();
    expect(
      screen.getByText(/every single lap carries the moon fully into the dark/),
    ).toBeInTheDocument();
  });

  it("clears the shadow when the year moves toward the solstice", () => {
    renderWithIntl(<EclipseSeasonThreader />);
    const season = screen.getByLabelText("Where the year has got to");
    fireEvent.change(season, { target: { value: "80" } });
    expect(screen.getByText("No eclipse")).toBeInTheDocument();
    expect(screen.getByText("Furthest from alignment")).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<EclipseSeasonThreader />, "vi");
    expect(screen.getByText("Nhật thực toàn phần")).toBeInTheDocument();
    expect(screen.getByLabelText("Độ nghiêng của quỹ đạo")).toBeInTheDocument();
  });
});
