// How a planet concentrates a trace element into a deposit worth digging — and
// which of those routes survive if the crust never moves.
//
// Crustal abundances are parts per million or per billion; an ore body is a
// hundred to a hundred thousand times richer. Every route to that enrichment is
// a physical process with requirements, and the requirements differ sharply in
// how much they depend on a mobile lid and on circulating water.
//
// The terrestrial analogues named here are the standard ones: Bushveld and
// Norilsk for magmatic segregation, porphyry copper systems at arcs, black
// smokers and volcanogenic massive sulfides at spreading ridges, orogenic gold
// in collisional belts, and banded iron formations and placers at the surface.
// (Robb 2005; Sillitoe 2010; Hedenquist & Lowenstern 1994; Kesler & Simon 2015.)
//
// The `regimes` field is the payload: magmatic segregation runs on any world with
// a melt supply, so the Moon and Mars could host it. The routes that make Earth's
// richest and most systematically located provinces need arcs, or ridges, or
// collisional orogens — all of which are plate boundaries. That is why ore-grade
// unobtanium is a hard thing to explain on a one-plate world.

import type { Regime } from "./tectonic-regime-model";

export type PathwayId =
  | "magmatic"
  | "arcHydrothermal"
  | "ridgeVms"
  | "orogenicGold"
  | "sedimentary";

export const PATHWAY_IDS: PathwayId[] = [
  "magmatic",
  "arcHydrothermal",
  "ridgeVms",
  "orogenicGold",
  "sedimentary",
];

export interface Pathway {
  id: PathwayId;
  /** Order-of-magnitude enrichment over crustal background. */
  enrichment: number;
  /** Does the route require liquid water circulating through rock? */
  needsWater: boolean;
  /** Regimes that can host this route at province scale. */
  regimes: Regime[];
  tone: string;
}

export const PATHWAYS: Record<PathwayId, Pathway> = {
  magmatic: {
    id: "magmatic",
    enrichment: 1e3,
    needsWater: false,
    regimes: ["mobileLid", "sluggishLid", "stagnantLid", "heatPipe"],
    tone: "var(--amber)",
  },
  arcHydrothermal: {
    id: "arcHydrothermal",
    enrichment: 1e4,
    needsWater: true,
    regimes: ["mobileLid"],
    tone: "var(--cyan)",
  },
  ridgeVms: {
    id: "ridgeVms",
    enrichment: 1e4,
    needsWater: true,
    regimes: ["mobileLid"],
    tone: "var(--teal)",
  },
  orogenicGold: {
    id: "orogenicGold",
    enrichment: 1e5,
    needsWater: true,
    regimes: ["mobileLid", "sluggishLid"],
    tone: "var(--magenta)",
  },
  sedimentary: {
    id: "sedimentary",
    enrichment: 1e2,
    needsWater: true,
    regimes: ["mobileLid", "sluggishLid", "stagnantLid"],
    tone: "var(--subtle)",
  },
};

export function hostsPathway(regime: Regime, id: PathwayId): boolean {
  return PATHWAYS[id].regimes.includes(regime);
}

/** How many of the five routes a regime can support. */
export function pathwayCount(regime: Regime): number {
  return PATHWAY_IDS.filter((id) => hostsPathway(regime, id)).length;
}

/** The richest enrichment factor a regime can reach, across its routes. */
export function bestEnrichment(regime: Regime): number {
  return PATHWAY_IDS.filter((id) => hostsPathway(regime, id)).reduce(
    (max, id) => Math.max(max, PATHWAYS[id].enrichment),
    1,
  );
}
