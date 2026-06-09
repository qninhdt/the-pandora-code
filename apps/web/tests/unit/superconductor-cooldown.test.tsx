import { SuperconductorCooldown } from "@/components/content/superconductor-cooldown";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("SuperconductorCooldown", () => {
  it("starts below Tc in the superconducting, levitating state", () => {
    renderWithIntl(<SuperconductorCooldown />);
    expect(screen.getByText("Superconducting")).toBeInTheDocument();
    expect(screen.getByText("Flux-locked — levitating")).toBeInTheDocument();
  });

  it("becomes a normal metal with nonzero resistance above Tc", () => {
    renderWithIntl(<SuperconductorCooldown tcKelvin={92} />);
    const temp = screen.getByLabelText("Temperature");
    fireEvent.change(temp, { target: { value: "150" } });
    expect(screen.getByText("Normal metal")).toBeInTheDocument();
    expect(screen.getByText("Resting on the surface")).toBeInTheDocument();
  });

  it("drops resistance to zero exactly at/under Tc", () => {
    renderWithIntl(<SuperconductorCooldown tcKelvin={92} />);
    const temp = screen.getByLabelText("Temperature");
    fireEvent.change(temp, { target: { value: "92" } });
    expect(screen.getByText("0%")).toBeInTheDocument();
  });

  it("renders localized labels in Vietnamese", () => {
    renderWithIntl(<SuperconductorCooldown />, "vi");
    expect(screen.getByText("Siêu dẫn")).toBeInTheDocument();
    expect(screen.getByLabelText("Nhiệt độ")).toBeInTheDocument();
  });
});
