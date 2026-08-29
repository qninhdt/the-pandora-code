import { SparMassFractionGate } from "@/components/content/spar-mass-fraction-gate";
import enMaterials from "@/messages/en/viz-materials.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

// The shared renderWithIntl helper hard-codes its namespace list and cannot see
// viz-materials, so this figure mounts a provider over exactly its own namespace.
function renderGate() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMaterials}>
      <SparMassFractionGate />
    </NextIntlClientProvider>,
  );
}

describe("SparMassFractionGate", () => {
  it("grounds the flier when the spars are ordinary bone", () => {
    renderGate();
    // A 25 m span at 350 kg banking at 2.5 g puts 18.2 kN·m into the shoulder,
    // and bone pays for it with more than half the animal's mass.
    expect(screen.getByText("18.2 kN·m at the shoulder")).toBeInTheDocument();
    expect(screen.getByText("57%")).toBeInTheDocument();
    expect(screen.getByText("201 kg")).toBeInTheDocument();
    expect(screen.getByText(/cannot exist/)).toBeInTheDocument();
  });

  it("makes the same wing flyable on a carbon composite spar", () => {
    renderGate();
    fireEvent.click(screen.getByRole("radio", { name: "Carbon composite" }));
    expect(screen.getByText("17%")).toBeInTheDocument();
    expect(screen.getByText("58 kg")).toBeInTheDocument();
    expect(screen.getByText("2.98×")).toBeInTheDocument();
    expect(screen.getByText(/This flier works/)).toBeInTheDocument();
  });

  it("always shows what the other material would cost", () => {
    renderGate();
    expect(screen.getByText(/With Carbon composite instead/)).toBeInTheDocument();
  });

  it("shrinks the spar bill when the wing gets shorter", () => {
    renderGate();
    const span = screen.getByRole("slider", { name: "Wingspan" });
    fireEvent.change(span, { target: { value: "10" } });
    // Root moment falls with span and the spar shortens with it, so a small
    // flier carries its wings on ordinary bone without trouble.
    expect(screen.getByText(/This flier works/)).toBeInTheDocument();
  });
});
