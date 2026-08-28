import { CondensationSequenceDial } from "@/components/content/condensation-sequence-dial";
import { NucleosynthesisLedger } from "@/components/content/nucleosynthesis-ledger";
import { SatelliteMassBudget } from "@/components/content/satellite-mass-budget";
import { VolatileSourceFingerprint } from "@/components/content/volatile-source-fingerprint";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("NucleosynthesisLedger", () => {
  it("attributes a silicate mantle chiefly to massive-star collapse", () => {
    renderWithIntl(<NucleosynthesisLedger />);
    expect(screen.getByText("84% of the sample")).toBeInTheDocument();
    expect(screen.getByText("nothing here predates stars")).toBeInTheDocument();
  });

  it("flips ocean water from supernova oxygen to primordial hydrogen when counting atoms", () => {
    renderWithIntl(<NucleosynthesisLedger />);
    fireEvent.click(screen.getByRole("button", { name: "Ocean water" }));
    // Weighed, the sample is mostly its oxygen, and oxygen is supernova ash.
    expect(screen.getByText("84% of the sample")).toBeInTheDocument();
    expect(screen.getByText("still carrying the first minutes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "By atom count" }));
    // Counted, there are two hydrogens per oxygen and the first minutes win.
    expect(screen.getByText("67% of the sample")).toBeInTheDocument();
  });

  it("traces a heavy-metal vein to neutron-star mergers", () => {
    renderWithIntl(<NucleosynthesisLedger />);
    fireEvent.click(screen.getByRole("button", { name: "Heavy-metal vein" }));
    expect(screen.getByText("55% of the sample")).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<NucleosynthesisLedger />, "vi");
    expect(screen.getByText("84% của mẫu")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Nước đại dương" })).toBeInTheDocument();
  });
});

describe("CondensationSequenceDial", () => {
  it("starts inside the water line with only rock and metal condensed", () => {
    renderWithIntl(<CondensationSequenceDial />);
    expect(screen.getByText("rock and metal only")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("1.0×")).toBeInTheDocument();
  });

  it("adds ice and collapses the density past the water line", () => {
    renderWithIntl(<CondensationSequenceDial />);
    fireEvent.change(screen.getByLabelText("Where the body assembles"), {
      target: { value: "5" },
    });
    expect(screen.getByText("ice included")).toBeInTheDocument();
    expect(screen.getByText("2.5×")).toBeInTheDocument();
    // A body built out here is more than half ice, so its density more than halves.
    expect(screen.getByText("1.36")).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<CondensationSequenceDial />, "vi");
    expect(screen.getByText("chỉ đá và kim loại")).toBeInTheDocument();
    expect(screen.getByLabelText("Nơi thiên thể lắp ghép")).toBeInTheDocument();
  });
});

describe("SatelliteMassBudget", () => {
  it("puts Pandora an order of magnitude past what a disk delivers", () => {
    renderWithIntl(<SatelliteMassBudget />);
    expect(screen.getByText("Not from a disk")).toBeInTheDocument();
    expect(screen.getByText("14×")).toBeInTheDocument();
  });

  it("brings a Galilean-scale moon back inside the ceiling", () => {
    renderWithIntl(<SatelliteMassBudget />);
    fireEvent.change(screen.getByLabelText("Moon mass"), { target: { value: "0.025" } });
    expect(screen.getByText("A disk could")).toBeInTheDocument();
  });

  it("cannot rescue Pandora by making the host heavier", () => {
    renderWithIntl(<SatelliteMassBudget />);
    fireEvent.change(screen.getByLabelText("Host planet mass"), { target: { value: "6" } });
    // Six Jupiters is already generous for Polyphemus and still leaves the moon
    // more than twice what a disk grows.
    expect(screen.getByText("Straining")).toBeInTheDocument();
    expect(screen.getByText("2.4×")).toBeInTheDocument();
  });

  it("states what each formation route costs", () => {
    renderWithIntl(<SatelliteMassBudget />);
    fireEvent.click(screen.getByRole("radio", { name: "Captured" }));
    expect(screen.getByText(/solves the mass outright/)).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<SatelliteMassBudget />, "vi");
    expect(screen.getByText("Không từ đĩa")).toBeInTheDocument();
    expect(screen.getByLabelText("Khối lượng mặt trăng")).toBeInTheDocument();
  });
});

describe("VolatileSourceFingerprint", () => {
  it("admits only a couple of percent of comet water", () => {
    renderWithIntl(<VolatileSourceFingerprint />);
    expect(screen.getByText("Reproduces it")).toBeInTheDocument();
    expect(screen.getByText(/about 2% of the hydrogen comes from Comet 67P/)).toBeInTheDocument();
  });

  it("overshoots seawater once comets carry a fifth of the water", () => {
    renderWithIntl(<VolatileSourceFingerprint />);
    fireEvent.change(screen.getByLabelText("Share drawn from Comet 67P"), {
      target: { value: "0.2" },
    });
    expect(screen.getByText("Too heavy")).toBeInTheDocument();
  });

  it("reports nebular gas as unable to reach seawater at any proportion", () => {
    renderWithIntl(<VolatileSourceFingerprint />);
    fireEvent.click(screen.getByRole("button", { name: "Nebular gas" }));
    expect(screen.getByText(/lies outside the range these two suppliers span/)).toBeInTheDocument();
    expect(screen.getByText("Too light")).toBeInTheDocument();
  });

  it("renders Vietnamese labels", () => {
    renderWithIntl(<VolatileSourceFingerprint />, "vi");
    expect(screen.getByText("Tái tạo được")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sao chổi 67P" })).toBeInTheDocument();
  });
});
