import { ReefRugosityProfile } from "@/components/content/reef-rugosity-profile";
import { buildReefProfile, rugosityRegime } from "@/components/content/reef-rugosity-profile-model";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("reef rugosity model", () => {
  it("collapses toward a flat floor when the framework is ground down", () => {
    expect(buildReefProfile(0, 260).rugosity).toBeCloseTo(1, 2);
    expect(buildReefProfile(1, 260).rugosity).toBeGreaterThan(2.5);
  });

  it("loses the smallest shelters before the largest ones appear", () => {
    const complex = buildReefProfile(1, 260);
    const reduced = buildReefProfile(0.5, 260);
    expect(reduced.refuges.large).toBe(0);
    expect(complex.refuges.large).toBeGreaterThan(0);
    expect(reduced.refuges.small).toBeGreaterThan(0);
  });

  it("lets more swell through as the surface smooths out", () => {
    expect(buildReefProfile(0.2, 260).waveTransmission).toBeGreaterThan(
      buildReefProfile(0.9, 260).waveTransmission,
    );
  });

  it("names the regime from the measured index", () => {
    expect(rugosityRegime(2.8)).toBe("complex");
    expect(rugosityRegime(1.8)).toBe("reduced");
    expect(rugosityRegime(1.05)).toBe("flattened");
  });
});

describe("ReefRugosityProfile", () => {
  it("opens on a branching framework that breaks the swell", () => {
    renderWithIntl(<ReefRugosityProfile />);
    expect(screen.getByText("Branching framework")).toBeInTheDocument();
    expect(screen.getByText(/Each fold is a refuge from a predator/)).toBeInTheDocument();
  });

  it("reports a rubble plain once the structure is gone", () => {
    renderWithIntl(<ReefRugosityProfile />);
    fireEvent.change(screen.getByLabelText("Structural complexity of the framework"), {
      target: { value: "0.05" },
    });
    expect(screen.getByText("Rubble plain")).toBeInTheDocument();
    expect(screen.getByText(/still there as rock and gone as habitat/)).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("renders the Vietnamese controls and regime", () => {
    renderWithIntl(<ReefRugosityProfile />, "vi");
    expect(screen.getByLabelText("Độ phức tạp cấu trúc của khung rạn")).toBeInTheDocument();
    expect(screen.getByText("Khung phân nhánh")).toBeInTheDocument();
  });
});
