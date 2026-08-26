import { AbyssalSignalStack } from "@/components/content/abyssal-signal-stack";
import { CavitationDepthCeiling } from "@/components/content/cavitation-depth-ceiling";
import { JetVersusFoilEfficiency } from "@/components/content/jet-versus-foil-efficiency";
import { PressureDoesNotCrush } from "@/components/content/pressure-does-not-crush";
import { ThermalScopeDial } from "@/components/content/thermal-scope-dial";
import { VentEnergyBudget } from "@/components/content/vent-energy-budget";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("JetVersusFoilEfficiency", () => {
  it("opens with the siphon losing to the wing", () => {
    renderWithIntl(<JetVersusFoilEfficiency />);
    expect(screen.getByText("Jet exit speed")).toBeInTheDocument();
    expect(screen.getByText("Left in the wake")).toBeInTheDocument();
  });

  it("closes the gap as the aperture widens", () => {
    renderWithIntl(<JetVersusFoilEfficiency />);
    const before = screen.getByText(/× the animal's own speed/).textContent;
    fireEvent.change(screen.getByLabelText("Total siphon aperture"), { target: { value: "900" } });
    const after = screen.getByText(/× the animal's own speed/).textContent;
    expect(after).not.toEqual(before);
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<JetVersusFoilEfficiency />, "vi");
    expect(screen.getByLabelText("Tổng tiết diện miệng phun")).toBeInTheDocument();
  });
});

describe("CavitationDepthCeiling", () => {
  it("reports clean flow at depth", () => {
    renderWithIntl(<CavitationDepthCeiling />);
    expect(screen.getByText("Clean flow")).toBeInTheDocument();
  });

  it("cavitates when the same burst is attempted near the surface", () => {
    renderWithIntl(<CavitationDepthCeiling />);
    fireEvent.change(screen.getByLabelText("Depth"), { target: { value: "0" } });
    expect(screen.getByText("Bubbles forming — tissue damage")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<CavitationDepthCeiling />, "vi");
    expect(screen.getByLabelText("Độ sâu")).toBeInTheDocument();
  });
});

describe("PressureDoesNotCrush", () => {
  it("shows crushing as the stress that never arrives", () => {
    renderWithIntl(<PressureDoesNotCrush />);
    expect(screen.getByText("Tissue is nearly incompressible")).toBeInTheDocument();
    expect(screen.getByText(/mOsm left/)).toBeInTheDocument();
  });

  it("breaches the osmotic ceiling past the hadal limit", () => {
    renderWithIntl(<PressureDoesNotCrush />);
    fireEvent.change(screen.getByLabelText("Depth"), { target: { value: "10000" } });
    expect(screen.getByText("Ceiling passed")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<PressureDoesNotCrush />, "vi");
    expect(screen.getByLabelText("Độ sâu")).toBeInTheDocument();
  });
});

describe("AbyssalSignalStack", () => {
  it("opens below the depth where reflection still works", () => {
    renderWithIntl(<AbyssalSignalStack />);
    expect(screen.getByText("Emission")).toBeInTheDocument();
  });

  it("restores the reflective channel in shallow water", () => {
    renderWithIntl(<AbyssalSignalStack />);
    fireEvent.change(screen.getByLabelText("Depth"), { target: { value: "0" } });
    expect(screen.getByText("Reflection")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<AbyssalSignalStack />, "vi");
    expect(screen.getByRole("radio", { name: "Tín hiệu đàn" })).toBeInTheDocument();
  });
});

describe("VentEnergyBudget", () => {
  it("shows the field falling far short of the pack", () => {
    renderWithIntl(<VentEnergyBudget />);
    expect(screen.getByText("Largest resident possible")).toBeInTheDocument();
    expect(screen.getByText(/falls short by a factor/)).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<VentEnergyBudget />, "vi");
    expect(screen.getByLabelText("Số con trong đàn")).toBeInTheDocument();
  });
});

describe("ThermalScopeDial", () => {
  it("opens with an ectotherm too slow to commit", () => {
    renderWithIntl(<ThermalScopeDial />);
    expect(screen.getByText("Too slow to commit")).toBeInTheDocument();
  });

  it("passes once enough metabolic heat is retained", () => {
    renderWithIntl(<ThermalScopeDial />);
    fireEvent.change(screen.getByLabelText("Heat held above ambient"), { target: { value: "15" } });
    expect(screen.getByText("Within reach")).toBeInTheDocument();
  });

  it("renders in Vietnamese", () => {
    renderWithIntl(<ThermalScopeDial />, "vi");
    expect(screen.getByLabelText("Nhiệt giữ lại trên nền nước")).toBeInTheDocument();
  });
});
