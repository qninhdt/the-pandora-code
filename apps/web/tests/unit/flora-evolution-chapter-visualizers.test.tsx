import {
  TRUNKS,
  TRUNK_VIEW_HEIGHT,
  trunkRowBottom,
} from "@/components/content/arborescence-habit-model";
import { ArborescenceHabitSorter } from "@/components/content/arborescence-habit-sorter";
import { PitcherConvergenceBench } from "@/components/content/pitcher-convergence-bench";
import { ReticulateFloraNetwork } from "@/components/content/reticulate-flora-network";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("ArborescenceHabitSorter", () => {
  it("collapses every trunk into one meaningless pile when sorted by outline", () => {
    renderWithIntl(<ArborescenceHabitSorter />);
    expect(screen.getByRole("radio", { name: "By silhouette" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    // One pile, and it reveals nothing: height is a response to light competition,
    // not something a lineage hands down.
    expect(screen.getByText("Nothing")).toBeInTheDocument();
    expect(screen.getByText("one pile, tallest first")).toBeInTheDocument();
  });

  it("separates the trunks into one group per load-bearing strategy", () => {
    renderWithIntl(<ArborescenceHabitSorter />);
    fireEvent.click(screen.getByRole("radio", { name: "By construction" }));
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Construction")).toBeInTheDocument();
    // Sorting by mechanism narrows the wood-share gap inside a group from the
    // 24-point spread of the mixed pile down to 6 points or less.
    expect(screen.getByText("6 pts")).toBeInTheDocument();
    expect(screen.getByText("still not ancestry")).toBeInTheDocument();
  });

  it("pairs each Pandoran giant with an Earth stem built the same way", () => {
    renderWithIntl(<ArborescenceHabitSorter />);
    expect(screen.getByText("Hometree")).toBeInTheDocument();
    expect(screen.getByText("Banyan fig")).toBeInTheDocument();
    expect(screen.getByText("Scale tree")).toBeInTheDocument();
    expect(screen.getByText("Saguaro")).toBeInTheDocument();
  });

  it("keeps every bench caption inside the drawing area", () => {
    // The SVG clips its own overflow, so a caption below the viewBox disappears
    // without any error. The bottom row is the one at risk.
    for (let i = 0; i < TRUNKS.length; i++) {
      expect(trunkRowBottom(i)).toBeLessThanOrEqual(TRUNK_VIEW_HEIGHT);
    }
  });
});

describe("PitcherConvergenceBench", () => {
  it("reads leached ground as the condition the trap tracks", () => {
    renderWithIntl(<PitcherConvergenceBench />);
    // Default soil is impoverished, so the carnivorous urns are actively feeding.
    expect(screen.getAllByText("digesting prey")).toHaveLength(2);
    expect(screen.getByText(/ten to twelve times over/)).toBeInTheDocument();
  });

  it("keeps the kinship signal low no matter how the soil is set", () => {
    renderWithIntl(<PitcherConvergenceBench />);
    // Two independent origins of the urn on one bench, so the shared organ cannot
    // carry ancestry — and enriching the soil does not change that.
    expect(screen.getByText("of the urn, on this bench alone")).toBeInTheDocument();
    const before = screen.getByText("unmoved by the soil, and low");
    fireEvent.change(screen.getByLabelText("Bioavailable nitrogen"), { target: { value: "0.9" } });
    fireEvent.change(screen.getByLabelText("Bioavailable phosphorus"), {
      target: { value: "0.9" },
    });
    expect(before).toBeInTheDocument();
    expect(screen.getByText(/the trap is a liability/)).toBeInTheDocument();
  });

  it("shows the Direhorse pitcher feeding a pollinator rather than digesting", () => {
    renderWithIntl(<PitcherConvergenceBench />);
    expect(screen.getByText("feeding a pollinator")).toBeInTheDocument();
    expect(screen.getByText("Direhorse pitcher")).toBeInTheDocument();
  });
});

describe("ReticulateFloraNetwork", () => {
  it("draws pure descent as a loop-free tree", () => {
    renderWithIntl(<ReticulateFloraNetwork />);
    expect(screen.getByText("A tree")).toBeInTheDocument();
    expect(screen.getByText("0 closed loops")).toBeInTheDocument();
  });

  it("becomes a network once the lateral channels are drawn", () => {
    renderWithIntl(<ReticulateFloraNetwork />);
    fireEvent.click(screen.getByRole("radio", { name: "Add lateral channels" }));
    expect(screen.getByText("A network")).toBeInTheDocument();
    // Seven descent edges plus four lateral ones on eight nodes: four more edges
    // than a tree can carry, so four closed loops.
    expect(screen.getByText("4 closed loops")).toBeInTheDocument();
  });

  it("marks which lateral channels canon actually describes", () => {
    renderWithIntl(<ReticulateFloraNetwork />);
    fireEvent.click(screen.getByRole("radio", { name: "Add lateral channels" }));
    expect(screen.getByText("root graft (canon)")).toBeInTheDocument();
    expect(screen.getByText("fungal conduit (canon)")).toBeInTheDocument();
    expect(screen.getByText("plastid capture (inferred)")).toBeInTheDocument();
  });

  it("renders Vietnamese clade labels and verdict", () => {
    renderWithIntl(<ReticulateFloraNetwork />, "vi");
    expect(screen.getByText("Một cái cây")).toBeInTheDocument();
    expect(screen.getByText("bậc zooplantae")).toBeInTheDocument();
  });
});
