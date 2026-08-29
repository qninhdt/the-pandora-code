import { MaterialIndexBench } from "@/components/content/material-index-bench";
import enMaterials from "@/messages/en/viz-materials.json";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it } from "vitest";

// The shared renderWithIntl helper hard-codes its namespace list and cannot see
// viz-materials, so this figure mounts a provider over exactly its own namespace.
function renderBench() {
  return render(
    <NextIntlClientProvider locale="en" messages={enMaterials}>
      <MaterialIndexBench />
    </NextIntlClientProvider>,
  );
}

describe("MaterialIndexBench", () => {
  it("ranks carbon fibre and silk above steel when the job is holding a pull", () => {
    renderBench();
    expect(screen.getByRole("radio", { name: "Hold a pull" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // Specific strength puts carbon fibre first and mild steel dead last, which
    // is the whole point of dividing by density. The winner appears twice: as a
    // row on the bench and again in the leader readout.
    expect(screen.getAllByText("Carbon fibre")).toHaveLength(2);
    expect(screen.getByText("12 of 12")).toBeInTheDocument();
  });

  it("re-sorts the bench when the structural job changes", () => {
    renderBench();
    fireEvent.click(screen.getByRole("radio", { name: "Store energy" }));
    // Silk is alone at the top for energy storage — an order of magnitude clear
    // of the next material.
    expect(screen.getByText(/silk is alone at the top/i)).toBeInTheDocument();
  });

  it("gives light woods the lead once buckling sets the limit", () => {
    renderBench();
    fireEvent.click(screen.getByRole("radio", { name: "Stand up a column" }));
    expect(screen.getByText(/light woods lead again/i)).toBeInTheDocument();
  });
});
