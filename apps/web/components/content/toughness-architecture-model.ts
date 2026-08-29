// Crack-path geometry and toughening arithmetic behind ToughnessArchitectureLab.
//
// Nacre is roughly 95% aragonite — the same brittle mineral as chalky shell — yet
// it absorbs on the order of a thousand times more energy before it breaks. None
// of that comes from a better ingredient. It comes from where the ingredient is
// put.
//
// A crack in a monolithic brittle solid runs straight, on the plane of maximum
// tensile stress, and every millimetre it travels is free. Break the solid into
// platelets and the crack must detour around each one. Deflecting it off the
// straight plane costs driving force —
//
//   K_eff = K_I cos^3(theta / 2)
//
// so a crack forced onto a 60-degree zigzag arrives at the next interface with
// only a fraction of the force it started with. Add mineral bridges that stay
// intact behind the tip and they pull the crack faces shut. Stack the platelet
// layers at a steadily rotating angle — a Bouligand twist, the mantis shrimp's
// club — and the crack can no longer find any single plane to follow at all: it
// must corkscrew, and the surface it creates grows faster than the distance it
// advances.
//
// The measured energy ratios are literature values, not outputs of the geometry
// above: nacre's roughly thousandfold gain over plain aragonite is an experimental
// result, and no two-term model reproduces it honestly. So this module computes
// what geometry really does give — path tortuosity and the shielding factor — and
// reports the measured toughness ratio alongside it as the empirical fact it is.

export type Architecture = "monolithic" | "platelets" | "bridged" | "bouligand";

export const ARCHITECTURES: Architecture[] = ["monolithic", "platelets", "bridged", "bouligand"];

export interface ArchitectureSpec {
  key: Architecture;
  /** Deflection angle the crack is forced through at each interface, degrees. */
  deflectionDeg: number;
  /** Detours per unit of straight-line advance — how often the crack must turn. */
  turnsPerSpan: number;
  /** Out-of-plane corkscrewing, which multiplies fracture surface again. */
  twistFactor: number;
  /**
   * Energy absorbed before fracture, relative to the same mineral cast as one
   * solid block. The endpoints are measured: plain aragonite sits near
   * 0.001-0.01 kJ/m^2 while real nacre reaches 0.8-1.5 kJ/m^2, the roughly
   * thousandfold gap the chapter quotes. The two middle rungs decompose that
   * gap by mechanism, in line with the toughening literature — they are
   * attributions, not separate specimen measurements.
   */
  energyRatio: number;
  tone: "magenta" | "amber" | "cyan" | "teal";
}

export const SPECS: Record<Architecture, ArchitectureSpec> = {
  monolithic: {
    key: "monolithic",
    deflectionDeg: 0,
    turnsPerSpan: 0,
    twistFactor: 1,
    energyRatio: 1,
    tone: "magenta",
  },
  platelets: {
    key: "platelets",
    deflectionDeg: 55,
    turnsPerSpan: 8,
    twistFactor: 1,
    energyRatio: 40,
    tone: "amber",
  },
  bridged: {
    key: "bridged",
    deflectionDeg: 62,
    turnsPerSpan: 10,
    twistFactor: 1,
    energyRatio: 1000,
    tone: "cyan",
  },
  bouligand: {
    key: "bouligand",
    deflectionDeg: 68,
    turnsPerSpan: 12,
    twistFactor: 3.4,
    energyRatio: 2600,
    tone: "teal",
  },
};

/**
 * Fraction of the applied stress intensity that survives one deflection.
 * K_eff = K_I cos^3(theta/2): a straight crack keeps all of it, a 60-degree
 * turn keeps a little over half.
 */
export function deflectionEfficiency(deflectionDeg: number): number {
  const half = (deflectionDeg * Math.PI) / 180 / 2;
  return Math.cos(half) ** 3;
}

export interface ToughnessResult {
  /** Drawn crack path length divided by straight-line distance across the block. */
  tortuosity: number;
  /** Share of the far-field driving force still reaching the crack tip, 0-1. */
  tipDriveShare: number;
  /** Extra fracture surface from corkscrewing out of the drawing plane. */
  twistFactor: number;
  /** Measured energy-to-break, relative to the monolithic mineral. */
  energyRatio: number;
}

export function toughness(arch: Architecture): ToughnessResult {
  const spec = SPECS[arch];
  return {
    // Measured off the same path the figure draws, so the readout and the
    // picture can never disagree.
    tortuosity: pathLength(crackPath(arch, 1, 300, 90)) / 300,
    tipDriveShare: deflectionEfficiency(spec.deflectionDeg),
    twistFactor: spec.twistFactor,
    energyRatio: spec.energyRatio,
  };
}

export interface PathPoint {
  x: number;
  y: number;
}

/**
 * The crack path drawn across a box of the given size, advanced to `progress`
 * (0-1). Monolithic runs dead straight; the layered architectures zigzag, and
 * the Bouligand stack drifts off the mid-line as it corkscrews.
 */
export function crackPath(
  arch: Architecture,
  progress: number,
  width: number,
  height: number,
): PathPoint[] {
  const spec = SPECS[arch];
  const midY = height / 2;
  const reach = Math.max(0, Math.min(1, progress)) * width;
  if (reach <= 0) return [{ x: 0, y: midY }];
  if (spec.turnsPerSpan === 0) {
    return [
      { x: 0, y: midY },
      { x: reach, y: midY },
    ];
  }

  const segments = spec.turnsPerSpan * 2;
  const dx = width / segments;
  // Zigzag amplitude follows the deflection angle: a sharper turn climbs further
  // off the straight plane before it comes back.
  const amp = Math.tan((spec.deflectionDeg * Math.PI) / 180 / 2) * dx;
  const points: PathPoint[] = [{ x: 0, y: midY }];

  for (let i = 1; i <= segments; i++) {
    const x = i * dx;
    if (x > reach) break;
    // Twisting architectures wander off the mid-line instead of returning to it.
    const drift = spec.twistFactor > 1 ? Math.sin(i * 0.7) * height * 0.14 : 0;
    const y = midY + (i % 2 === 1 ? -amp : amp) + drift;
    points.push({ x, y: Math.max(4, Math.min(height - 4, y)) });
  }

  const last = points[points.length - 1];
  if (last.x < reach) points.push({ x: reach, y: last.y });
  return points;
}

/** Total drawn length of a path, for the "how far the crack actually travelled" readout. */
export function pathLength(points: PathPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}
