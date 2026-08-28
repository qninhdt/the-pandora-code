// The ledger behind PerchedWaterBudget, and the chapter's central argument.
//
// A floating massif sheds water continuously from its rim and its underside. It
// has no upstream catchment — there is nothing above it but sky. So whatever
// leaves has to arrive, and the only plausible delivery is occult precipitation:
// fog droplets carried by wind, impacting on rock, vegetation and epiphytes, and
// coalescing into flow. That mechanism is real and measured on Earth. The
// question this model asks is whether it is real *enough*.
//
// Capture side. Treat the massif as a filter standing in a moving fog stream. The
// vertical face presented to the wind intercepts a volume flux of air, each cubic
// metre of which carries a liquid-water content, and some fraction of that liquid
// is actually collected rather than swept past:
//
//   Q_in = LWC * v_wind * A_face * eta        [kg/s -> L/s]
//
// with A_face the windward cross-section (plateau width x the depth of the fog
// layer touching it) and eta the impaction efficiency. Plateau-surface capture is
// added on top at the measured cloud-forest areal rate, since a lush upper
// surface intercepts fog directly too:
//
//   Q_surface = fogRate * A_plateau
//
// Demand side. The reader sets the discharge they can see leaving the rim, and
// the plateau's own evapotranspiration is charged against the budget as well,
// because that forest is transpiring whatever it holds.
//
// The output is the ratio Q_in / Q_out. Above 1 the massif is solvent. Below it,
// the shortfall factor states exactly how far short fog interception falls — and
// on the discharges canon shows, it falls short by a lot, which is the honest
// verdict the chapter lands on.
//
// SOURCED (research note): the cataracts are Tier 1 canon, directly shown, and
// "mechanistically unsourced"; no upstream catchment, snowpack or river exists
// atop the peaks; the Survival Guide states only that the mist "condenses on
// other mountains... renewing the process", describing the outcome and not the
// mechanism; the recharge mechanism is ranked canon gap #1; measured cloud-forest
// fog deposition is 1.0-3.5 mm/day at Monteverde, 0.5-2.2 at Luquillo and 2.0-5.0
// in Hawaiian montane basins, contributing 15-50% of catchment yield; Mons
// Veritatis-class massifs exceed 16 km across; Pandora's air is ~1.2x denser than
// Earth's at 0.8 g; and the note's own closing verdict is that terrestrial fog
// rates are "insufficient to sustain the high-volume cataracts... without
// localized aerodynamic enhancement or extensive internal fracture storage".
//
// CHOSEN FOR ILLUSTRATION: the impaction efficiency range, the depth of the fog
// layer meeting the face, the plateau ET rate, and the discharge range offered.
// Canon gives no discharge figure at all, which is exactly why it is a dial.

/** Litres per cubic metre of air, per gram of liquid water — unit bookkeeping. */
const G_PER_KG = 1000;

export interface PerchedInputs {
  /** Plateau diameter, km — the massif's horizontal scale. */
  diameterKm: number;
  /** Fog liquid-water content, g/m^3. */
  lwcGm3: number;
  /** Wind speed through the fog layer, m/s. */
  windMs: number;
  /** Impaction efficiency of the windward face, 0-1. */
  efficiency: number;
  /** Observed discharge leaving the rim as cataracts, m^3/s. */
  dischargeM3s: number;
  /** Whether the inter-massif venturi enhancement is switched on. */
  enhanced: boolean;
}

export interface PerchedResult {
  /** Plateau area, m^2. */
  plateauM2: number;
  /** Windward cross-section presented to the fog stream, m^2. */
  faceM2: number;
  /** Capture on the windward face, m^3/s. */
  faceCaptureM3s: number;
  /** Direct fog capture on the plateau surface, m^3/s. */
  surfaceCaptureM3s: number;
  /** Total capture, m^3/s. */
  captureM3s: number;
  /** Plateau evapotranspiration charged against the budget, m^3/s. */
  transpirationM3s: number;
  /** Everything leaving: cataracts plus transpiration, m^3/s. */
  demandM3s: number;
  /** capture / demand. 1.0 balances. */
  coverage: number;
  /** Equivalent capture expressed as mm/day over the plateau, for comparison. */
  captureMmDay: number;
  verdict: "solvent" | "marginal" | "shortfall" | "impossible";
}

/** Depth of the fog layer in contact with the windward face, metres. */
const FOG_LAYER_M = 400;
/** Plateau evapotranspiration, mm/day — a wet tropical canopy's demand. */
const PLATEAU_ET_MM_DAY = 4;
/**
 * Wind speed multiplier when air is funnelled between adjacent massifs, and the
 * efficiency bonus that faster impaction buys. Both are the "localized
 * aerodynamic enhancement" the note names but never quantifies, so they are
 * clearly labelled as the speculative lever they are.
 */
const VENTURI_WIND = 2.2;
const VENTURI_EFFICIENCY = 1.35;

/** Measured cloud-forest areal fog deposition used for the plateau surface, mm/day. */
export const FOG_SURFACE_MM_DAY = 3.5;

/** Reference cloud-forest sites, for markers pinning the honest terrestrial range. */
export const FOG_REFERENCES: Array<{ id: string; mmDay: number }> = [
  { id: "luquillo", mmDay: 2.2 },
  { id: "monteverde", mmDay: 3.5 },
  { id: "hawaii", mmDay: 5.0 },
];

export function runPerchedBudget(input: PerchedInputs): PerchedResult {
  const diameterM = input.diameterKm * 1000;
  const plateauM2 = Math.PI * (diameterM / 2) ** 2;
  const faceM2 = diameterM * FOG_LAYER_M;

  const wind = input.windMs * (input.enhanced ? VENTURI_WIND : 1);
  const efficiency = Math.min(1, input.efficiency * (input.enhanced ? VENTURI_EFFICIENCY : 1));

  // g/m^3 * m/s * m^2 = g/s; divide by 1000 for kg/s, which for water is L/s,
  // and by another 1000 for m^3/s.
  const faceCaptureM3s = (input.lwcGm3 * wind * faceM2 * efficiency) / (G_PER_KG * G_PER_KG);

  const mmDayToM3s = (mmDay: number, areaM2: number) => ((mmDay / 1000) * areaM2) / 86400;
  const surfaceCaptureM3s = mmDayToM3s(FOG_SURFACE_MM_DAY, plateauM2);
  const transpirationM3s = mmDayToM3s(PLATEAU_ET_MM_DAY, plateauM2);

  const captureM3s = faceCaptureM3s + surfaceCaptureM3s;
  const demandM3s = input.dischargeM3s + transpirationM3s;
  const coverage = demandM3s > 0 ? captureM3s / demandM3s : 0;

  let verdict: PerchedResult["verdict"] = "impossible";
  if (coverage >= 1) verdict = "solvent";
  else if (coverage >= 0.5) verdict = "marginal";
  else if (coverage >= 0.1) verdict = "shortfall";

  return {
    plateauM2,
    faceM2,
    faceCaptureM3s,
    surfaceCaptureM3s,
    captureM3s,
    transpirationM3s,
    demandM3s,
    coverage,
    captureMmDay: plateauM2 > 0 ? (captureM3s * 86400 * 1000) / plateauM2 : 0,
    verdict,
  };
}

/** The discharge fog interception could actually sustain, m^3/s — the honest ceiling. */
export function sustainableDischarge(input: PerchedInputs): number {
  const r = runPerchedBudget(input);
  return Math.max(0, r.captureM3s - r.transpirationM3s);
}

export const DEFAULT_INPUTS: PerchedInputs = {
  diameterKm: 4,
  lwcGm3: 0.4,
  windMs: 8,
  efficiency: 0.2,
  dischargeM3s: 20,
  enhanced: false,
};
