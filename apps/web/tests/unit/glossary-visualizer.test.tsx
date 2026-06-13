import Allometry from "@/components/glossary/interactive/allometry";
import AlphaCentauri from "@/components/glossary/interactive/alpha-centauri";
import Bioluminescence from "@/components/glossary/interactive/bioluminescence";
import LotkaVolterra from "@/components/glossary/interactive/lotka-volterra-equations";
import Chirality from "@/components/glossary/interactive/chirality";
import Umwelt from "@/components/glossary/interactive/umwelt";
import OccamsRazor from "@/components/glossary/interactive/occams-razor";
import TidalLocking from "@/components/glossary/interactive/tidal-locking";
import AtmosphericDisequilibrium from "@/components/glossary/interactive/atmospheric-disequilibrium";
import HalfLife from "@/components/glossary/interactive/half-life";
import Cladogram from "@/components/glossary/interactive/cladogram";
import CountercurrentExchange from "@/components/glossary/interactive/countercurrent-exchange";
import DirectImaging from "@/components/glossary/interactive/direct-imaging";
import Exomoon from "@/components/glossary/interactive/exomoon";
import HabitableZone from "@/components/glossary/interactive/habitable-zone";
import HoxGenes from "@/components/glossary/interactive/hox-genes";
import NichePartitioning from "@/components/glossary/interactive/niche-partitioning";
import RadialVelocity from "@/components/glossary/interactive/radial-velocity";
import RocheLimit from "@/components/glossary/interactive/roche-limit";
import TidalHeating from "@/components/glossary/interactive/tidal-heating";
import TransitTimingVariation from "@/components/glossary/interactive/transit-timing-variation";
import { GlossaryVisualizer } from "@/components/glossary/interactive/visualizer";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithIntl } from "./render-with-intl";

describe("Glossary Components Direct Mount", () => {
  it("renders alpha-centauri orrery", () => {
    renderWithIntl(<AlphaCentauri locale="en" />);
    expect(screen.getAllByText("Alpha Centauri Orrery")[0]).toBeInTheDocument();
  });

  it("renders habitable-zone simulator", () => {
    renderWithIntl(<HabitableZone locale="en" />);
    expect(screen.getAllByText("The habitable zone")[0]).toBeInTheDocument();
  });

  it("renders exomoon balance puzzle", () => {
    renderWithIntl(<Exomoon locale="en" />);
    expect(screen.getAllByText("Exomoon Energy Balance")[0]).toBeInTheDocument();
  });

  it("renders tidal-heating simulator", () => {
    renderWithIntl(<TidalHeating locale="en" />);
    expect(screen.getAllByText("Tidal Heating & Elliptical Flexing")[0]).toBeInTheDocument();
  });

  it("renders roche-limit breakup simulator", () => {
    renderWithIntl(<RocheLimit locale="en" />);
    expect(screen.getAllByText("Roche Limit Breakup Simulator")[0]).toBeInTheDocument();
  });

  it("renders radial-velocity Doppler wobble", () => {
    renderWithIntl(<RadialVelocity locale="en" />);
    expect(screen.getAllByText("Radial Velocity (Doppler Wobble)")[0]).toBeInTheDocument();
  });

  it("renders direct-imaging coronagraph", () => {
    renderWithIntl(<DirectImaging locale="en" />);
    expect(screen.getAllByText("Direct Imaging & Coronagraph Mask")[0]).toBeInTheDocument();
  });

  it("renders transit-timing-variation TTV plot", () => {
    renderWithIntl(<TransitTimingVariation locale="en" />);
    expect(screen.getAllByText("Transit Timing Variations (TTV)")[0]).toBeInTheDocument();
  });

  it("renders hox-genes address system", () => {
    renderWithIntl(<HoxGenes locale="en" />);
    expect(screen.getAllByText("The Hox address system")[0]).toBeInTheDocument();
  });

  it("renders niche-partitioning layers", () => {
    renderWithIntl(<NichePartitioning locale="en" />);
    expect(screen.getAllByText("One forest, divided into floors")[0]).toBeInTheDocument();
  });

  it("renders countercurrent-exchange simulator", () => {
    renderWithIntl(<CountercurrentExchange locale="en" />);
    expect(screen.getAllByText("Gill lamella: flip the blood")[0]).toBeInTheDocument();
  });

  it("renders bioluminescence simulator", () => {
    renderWithIntl(<Bioluminescence locale="en" />);
    expect(screen.getAllByText("The cold-light reaction")[0]).toBeInTheDocument();
  });

  it("renders cladogram builder", () => {
    renderWithIntl(<Cladogram locale="en" />);
    expect(
      screen.getAllByText("Character matrix → the most parsimonious tree")[0],
    ).toBeInTheDocument();
  });

  it("renders allometry scaling calculator", () => {
    renderWithIntl(<Allometry locale="en" />);
    expect(
      screen.getAllByText("Bone Stress & Allometry")[0] ||
        screen.getAllByText("Bone Stress & Allometry")[0],
    ).toBeInTheDocument();
  });

  it("renders lotka-volterra dynamics", () => {
    renderWithIntl(<LotkaVolterra locale="en" />);
    expect(
      screen.getAllByText("Predator-Prey Population dynamics")[0],
    ).toBeInTheDocument();
  });

  it("renders chirality polarimeter", () => {
    renderWithIntl(<Chirality locale="en" />);
    expect(
      screen.getAllByText("Chirality & Optical Rotation")[0],
    ).toBeInTheDocument();
  });

  it("renders umwelt goggles", () => {
    renderWithIntl(<Umwelt locale="en" />);
    expect(
      screen.getAllByText("The Pandoran Umwelt")[0],
    ).toBeInTheDocument();
  });

  it("renders occams-razor logic engine", () => {
    renderWithIntl(<OccamsRazor locale="en" />);
    expect(
      screen.getAllByText("Occam's Razor")[0],
    ).toBeInTheDocument();
  });

  it("renders tidal-locking simulator", () => {
    renderWithIntl(<TidalLocking locale="en" />);
    expect(
      screen.getAllByText("Tidal Locking Simulator")[0],
    ).toBeInTheDocument();
  });

  it("renders atmospheric-disequilibrium reaction", () => {
    renderWithIntl(<AtmosphericDisequilibrium locale="en" />);
    expect(
      screen.getAllByText("Reading life off the air")[0],
    ).toBeInTheDocument();
  });

  it("renders half-life decay clock", () => {
    renderWithIntl(<HalfLife locale="en" />);
    expect(
      screen.getAllByText("Radioactive decay clock")[0],
    ).toBeInTheDocument();
  });

  it("returns null for unregistered terms in GlossaryVisualizer", () => {
    const { container } = renderWithIntl(<GlossaryVisualizer term="unknown-term" locale="en" />);
    expect(container.firstChild).toBeNull();
  });
});
