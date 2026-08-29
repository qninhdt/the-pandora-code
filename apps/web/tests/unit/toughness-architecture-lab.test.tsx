import { ToughnessArchitectureLab } from "@/components/content/toughness-architecture-lab";
import enMaterials from "@/messages/en/viz-materials.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

// The shared renderWithIntl helper hard-codes its namespace list and cannot see
// viz-materials, so this figure mounts a provider over exactly its own namespace.
function renderLab() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMaterials}>
      <ToughnessArchitectureLab />
    </NextIntlClientProvider>,
  );
}

describe("ToughnessArchitectureLab", () => {
  it("starts on the solid block, where the crack runs straight and free", () => {
    renderLab();
    expect(screen.getByRole("button", { name: "Solid mineral" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    // A straight crack keeps all its driving force and travels no further than
    // the width of the block.
    expect(screen.getByText("1.00×")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("shields the crack tip once the mineral is broken into platelets", () => {
    renderLab();
    fireEvent.click(screen.getByRole("button", { name: "Platelet stack" }));
    // K_eff = K_I cos^3(theta/2) at 55 degrees leaves about 70% of the force.
    expect(screen.getByText("70%")).toBeInTheDocument();
    expect(screen.getByText("after a 55° turn")).toBeInTheDocument();
  });

  it("reports nacre's measured thousandfold gain on the bridged architecture", () => {
    renderLab();
    fireEvent.click(screen.getByRole("button", { name: "Staggered and bridged" }));
    expect(screen.getByText("1000×")).toBeInTheDocument();
    expect(screen.getByText("measured, against the solid block")).toBeInTheDocument();
    expect(screen.getByText(/Not a better ingredient/)).toBeInTheDocument();
  });

  it("makes the twisted stack take the crack out of the plane", () => {
    renderLab();
    fireEvent.click(screen.getByRole("button", { name: "Twisted stack" }));
    expect(
      screen.getByText(/manufactures new surface faster than it advances/),
    ).toBeInTheDocument();
  });
});
