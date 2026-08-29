// Four cycles, side by side, and one structural difference that explains most of
// what a biosphere can and cannot do.
//
// Carbon, nitrogen and sulfur all have a gas phase, so their cycles include an
// atmospheric reservoir — a fast, globally mixed buffer that any organism anywhere
// can draw on. Phosphorus has none. Under planetary surface conditions there is no
// stable volatile phosphorus species, so P enters the biosphere only by weathering
// rock and leaves only by sinking into sediment. That single absence is why
// phosphorus is the ultimate limiting nutrient over geological time, why fertility
// is a tectonic property rather than a biological one, and why a world whose crust
// has stopped moving eventually goes barren no matter how much life it started with.
//
// Reservoirs and fluxes are modern Earth values, in the conventional unit for each
// element. Deterministic; no randomness.

export type ElementId = "carbon" | "nitrogen" | "phosphorus" | "sulfur";

export interface CycleReservoir {
  id: string;
  /** Stock in the element's own unit. */
  stock: number;
  /** Whether this reservoir is the atmosphere — the box phosphorus lacks. */
  atmospheric?: boolean;
}

export interface CycleFlux {
  id: string;
  from: string;
  to: string;
  /** Rate in unit per year. */
  rate: number;
  /**
   * A flux that only tectonics or sedimentation can drive, and therefore runs on
   * geological rather than biological time.
   */
  geological?: boolean;
}

export interface ElementCycle {
  id: ElementId;
  unit: "GtC" | "TgN" | "TgP" | "TgS";
  tone: "teal" | "cyan" | "amber" | "magenta";
  /** Bond or phase fact that governs the cycle's bottleneck. */
  bottleneck: "bondEnergy" | "noGasPhase" | "oxidation" | "buffering";
  hasGasPhase: boolean;
  reservoirs: CycleReservoir[];
  fluxes: CycleFlux[];
}

export const ELEMENT_CYCLES: ElementCycle[] = [
  {
    id: "carbon",
    unit: "GtC",
    tone: "teal",
    bottleneck: "buffering",
    hasGasPhase: true,
    reservoirs: [
      { id: "atmosphere", stock: 875, atmospheric: true },
      { id: "biomass", stock: 500 },
      { id: "soil", stock: 2000 },
      { id: "ocean", stock: 38000 },
      { id: "rock", stock: 6e7 },
    ],
    fluxes: [
      { id: "photosynthesis", from: "atmosphere", to: "biomass", rate: 120 },
      { id: "respiration", from: "biomass", to: "atmosphere", rate: 60 },
      { id: "litterfall", from: "biomass", to: "soil", rate: 60 },
      { id: "decay", from: "soil", to: "atmosphere", rate: 57 },
      { id: "airSea", from: "atmosphere", to: "ocean", rate: 90 },
      { id: "burial", from: "ocean", to: "rock", rate: 0.2, geological: true },
      { id: "degassing", from: "rock", to: "atmosphere", rate: 0.2, geological: true },
    ],
  },
  {
    id: "nitrogen",
    unit: "TgN",
    tone: "cyan",
    bottleneck: "bondEnergy",
    hasGasPhase: true,
    reservoirs: [
      { id: "atmosphere", stock: 3.9e9, atmospheric: true },
      { id: "biomass", stock: 3500 },
      { id: "soil", stock: 200000 },
      { id: "ocean", stock: 570000 },
    ],
    fluxes: [
      { id: "fixation", from: "atmosphere", to: "soil", rate: 250 },
      { id: "uptake", from: "soil", to: "biomass", rate: 1200 },
      { id: "mineralisation", from: "biomass", to: "soil", rate: 1150 },
      { id: "leaching", from: "soil", to: "ocean", rate: 50 },
      { id: "denitrification", from: "soil", to: "atmosphere", rate: 200 },
      { id: "marineDenitrification", from: "ocean", to: "atmosphere", rate: 100 },
    ],
  },
  {
    id: "phosphorus",
    unit: "TgP",
    tone: "amber",
    bottleneck: "noGasPhase",
    hasGasPhase: false,
    reservoirs: [
      { id: "biomass", stock: 3000 },
      { id: "soil", stock: 200000 },
      { id: "ocean", stock: 84000 },
      { id: "rock", stock: 4e9 },
    ],
    fluxes: [
      { id: "weathering", from: "rock", to: "soil", rate: 20, geological: true },
      { id: "uptake", from: "soil", to: "biomass", rate: 1000 },
      { id: "remineralisation", from: "biomass", to: "soil", rate: 980 },
      { id: "riverine", from: "soil", to: "ocean", rate: 20 },
      { id: "sedimentation", from: "ocean", to: "rock", rate: 20, geological: true },
    ],
  },
  {
    id: "sulfur",
    unit: "TgS",
    tone: "magenta",
    bottleneck: "oxidation",
    hasGasPhase: true,
    reservoirs: [
      { id: "atmosphere", stock: 5, atmospheric: true },
      { id: "biomass", stock: 600 },
      { id: "ocean", stock: 1.3e9 },
      { id: "rock", stock: 2e10 },
    ],
    fluxes: [
      { id: "volcanic", from: "rock", to: "atmosphere", rate: 20, geological: true },
      { id: "dms", from: "ocean", to: "atmosphere", rate: 30 },
      { id: "deposition", from: "atmosphere", to: "ocean", rate: 50 },
      { id: "uptake", from: "ocean", to: "biomass", rate: 200 },
      { id: "remineralisation", from: "biomass", to: "ocean", rate: 195 },
      { id: "pyriteBurial", from: "ocean", to: "rock", rate: 40, geological: true },
    ],
  },
];

export function cycleById(id: ElementId): ElementCycle {
  return ELEMENT_CYCLES.find((c) => c.id === id) ?? ELEMENT_CYCLES[0];
}

/** Total inflow to a reservoir, for the residence-time readout. */
export function inflow(cycle: ElementCycle, reservoirId: string): number {
  return cycle.fluxes
    .filter((f) => f.to === reservoirId)
    .reduce((sum, f) => sum + f.rate, 0);
}

/** Total outflow from a reservoir. */
export function outflow(cycle: ElementCycle, reservoirId: string): number {
  return cycle.fluxes
    .filter((f) => f.from === reservoirId)
    .reduce((sum, f) => sum + f.rate, 0);
}

export interface ReservoirAudit {
  id: string;
  stock: number;
  in: number;
  out: number;
  /** Stock ÷ outflow, in years. */
  residenceYears: number;
  /** Inflow minus outflow: zero means the books close for this box. */
  imbalance: number;
  atmospheric: boolean;
}

export function auditCycle(cycle: ElementCycle): ReservoirAudit[] {
  return cycle.reservoirs.map((r) => {
    const out = outflow(cycle, r.id);
    const inn = inflow(cycle, r.id);
    return {
      id: r.id,
      stock: r.stock,
      in: inn,
      out,
      residenceYears: out > 0 ? r.stock / out : Number.POSITIVE_INFINITY,
      imbalance: inn - out,
      atmospheric: r.atmospheric === true,
    };
  });
}

/**
 * The share of a cycle's total throughput that only geology can drive. High means
 * the cycle's long-run supply is hostage to tectonics — the phosphorus signature.
 */
export function geologicalShare(cycle: ElementCycle): number {
  const total = cycle.fluxes.reduce((sum, f) => sum + f.rate, 0);
  const geological = cycle.fluxes
    .filter((f) => f.geological)
    .reduce((sum, f) => sum + f.rate, 0);
  return total > 0 ? geological / total : 0;
}

/** The slowest step in the cycle, which is what actually sets its long-run pace. */
export function slowestFlux(cycle: ElementCycle): CycleFlux {
  return cycle.fluxes.reduce((slowest, f) => (f.rate < slowest.rate ? f : slowest));
}

const STOCK_MIN = 1;
const STOCK_MAX = 1e11;

/** Log-scaled bar width for stocks spanning eleven decades. */
export function stockFraction(stock: number): number {
  const clamped = Math.min(STOCK_MAX, Math.max(STOCK_MIN, stock));
  return (
    (Math.log10(clamped) - Math.log10(STOCK_MIN)) /
    (Math.log10(STOCK_MAX) - Math.log10(STOCK_MIN))
  );
}

export function formatStock(value: number): string {
  if (value >= 1e4) {
    const exp = Math.floor(Math.log10(value));
    return `${(value / 10 ** exp).toFixed(1)}e${exp}`;
  }
  if (value >= 100) return value.toFixed(0);
  return value.toFixed(1);
}

export function formatYears(years: number): string {
  if (!Number.isFinite(years)) return "∞";
  if (years >= 1e4) {
    const exp = Math.floor(Math.log10(years));
    return `${(years / 10 ** exp).toFixed(1)}e${exp}`;
  }
  if (years >= 10) return years.toFixed(0);
  return years.toFixed(1);
}
