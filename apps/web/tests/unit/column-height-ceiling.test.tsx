import { ColumnHeightCeiling } from "@/components/content/column-height-ceiling";
import enMaterials from "@/messages/en/viz-materials.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

// The shared renderWithIntl helper hard-codes its namespace list and cannot see
// viz-materials, so this figure mounts a provider over exactly its own namespace.
function renderCeiling() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMaterials}>
      <ColumnHeightCeiling />
    </NextIntlClientProvider>,
  );
}

describe("ColumnHeightCeiling", () => {
  it("clears Hometree on ordinary wood at the default buttressed base", () => {
    renderCeiling();
    // Greenhill at D = 30 m, E = 10 GPa, rho = 600 kg/m^3, 0.8 g.
    expect(screen.getByText("1,553 m")).toBeInTheDocument();
    expect(screen.getByText("5.2×")).toBeInTheDocument();
    expect(screen.getByText(/it is not buckling/)).toBeInTheDocument();
  });

  it("reports the much smaller base a 300 m trunk actually needs", () => {
    renderCeiling();
    expect(screen.getByText("2.55 m")).toBeInTheDocument();
  });

  it("fails the trunk once the base is narrowed far enough", () => {
    renderCeiling();
    const diameter = screen.getByRole("slider", { name: "Base diameter" });
    fireEvent.change(diameter, { target: { value: "1" } });
    expect(screen.getByText(/buckles under its own weight before/)).toBeInTheDocument();
  });

  it("barely moves the ceiling when gravity changes, because gravity is under a cube root", () => {
    renderCeiling();
    const gravity = screen.getByRole("slider", { name: "Surface gravity" });
    fireEvent.change(gravity, { target: { value: "1" } });
    // 0.8 g to 1.0 g costs only about 7 percent of the height, not 20.
    expect(screen.getByText("1,442 m")).toBeInTheDocument();
    expect(screen.getByText(/it is not buckling/)).toBeInTheDocument();
  });
});
