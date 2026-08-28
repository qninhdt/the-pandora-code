// ─────────────────────────────────────────────────────────────────────
// THE MODEL — why a basin's two long margins are not each other's mirror
//
// Wind stress gathers surface water into a closed, basin-scale gyre. If
// the planet's rotation gripped the water equally everywhere, that loop
// would be symmetric: two identical long margins, water crawling around
// both. It is not. Because rotation's grip changes with latitude,
// conservation of planetary vorticity crowds the return flow against the
// basin's western margin — western intensification (Stommel 1948; Munk
// 1950). The western limb ends up narrow, deep and fast; the eastern limb
// broad, shallow and slow.
//
// The loop is a rounded-rectangle basin traversed at a limb-dependent
// speed. Drifters are spaced by equal transit *time*, not by distance, so
// a fast limb genuinely thins its traffic out and a slow limb bunches up.
// The asymmetry becomes something the reader watches rather than reads.
//
// Everything here is relative. Canon gives no Pandoran current speeds, and
// the mechanism is visible without borrowing Earth's, so no absolute
// velocity is asserted anywhere.
// ─────────────────────────────────────────────────────────────────────

export type Limb = "equatorward" | "west" | "poleward" | "east";

export const LIMBS: Limb[] = ["equatorward", "west", "poleward", "east"];

interface Sample {
  x: number;
  y: number;
  limb: Limb;
  /** Cumulative transit time from the loop's start, in arbitrary units. */
  time: number;
}

/** Basin geometry in the figure's viewBox. */
export const BASIN = { cx: 156, cy: 112, a: 96, b: 66 };

const SQUARENESS = 3.4; // superellipse exponent: 2 = ellipse, higher = rounded box
const STEPS = 480;

/** Relative along-limb speed. The western limb is the one rotation crowds. */
export function limbSpeed(limb: Limb, asymmetry: number): number {
  if (limb === "west") return 1 + 3.6 * asymmetry;
  if (limb === "east") return 1 - 0.5 * asymmetry;
  return 1;
}

/** Relative stream width — the inverse trade the same asymmetry forces. */
export function limbWidth(limb: Limb, asymmetry: number): number {
  if (limb === "west") return 6.5 - 4 * asymmetry;
  if (limb === "east") return 6.5 + 8 * asymmetry;
  return 6.5;
}

function superellipse(t: number): { x: number; y: number } {
  const c = Math.cos(t);
  const s = Math.sin(t);
  const p = 2 / SQUARENESS;
  return {
    x: BASIN.cx + BASIN.a * Math.sign(c) * Math.abs(c) ** p,
    y: BASIN.cy + BASIN.b * Math.sign(s) * Math.abs(s) ** p,
  };
}

// Which limb a point belongs to: whichever axis it lies further out along.
function limbAt(x: number, y: number): Limb {
  const fx = (x - BASIN.cx) / BASIN.a;
  const fy = (y - BASIN.cy) / BASIN.b;
  if (Math.abs(fx) >= Math.abs(fy)) return fx < 0 ? "west" : "east";
  return fy > 0 ? "equatorward" : "poleward";
}

export interface GyreLoop {
  /** One SVG polyline per limb, so each is stroked at its own width. */
  limbPaths: Record<Limb, string>;
  /** Total time for one circuit at the current asymmetry. */
  circuitTime: number;
  /** Time spent on each limb, as a fraction of the circuit. */
  limbShare: Record<Limb, number>;
  samples: Sample[];
}

/**
 * Build the loop. `clockwise` sets the circulation sense — subtropical gyres
 * turn clockwise in the northern hemisphere and anticlockwise in the southern
 * — while the western margin stays the intensified one either way.
 */
export function buildGyreLoop(asymmetry: number, clockwise: boolean): GyreLoop {
  const raw: { x: number; y: number; limb: Limb }[] = [];
  for (let i = 0; i <= STEPS; i += 1) {
    const t = Math.PI / 2 + (2 * Math.PI * i) / STEPS;
    const p = superellipse(clockwise ? -t : t);
    raw.push({ ...p, limb: limbAt(p.x, p.y) });
  }

  const samples: Sample[] = [];
  const spent: Record<Limb, number> = { equatorward: 0, west: 0, poleward: 0, east: 0 };
  let time = 0;
  raw.forEach((p, i) => {
    if (i > 0) {
      const prev = raw[i - 1];
      const dt = Math.hypot(p.x - prev.x, p.y - prev.y) / limbSpeed(p.limb, asymmetry);
      time += dt;
      spent[p.limb] += dt;
    }
    samples.push({ ...p, time });
  });

  const limbPaths: Record<Limb, string> = { equatorward: "", west: "", poleward: "", east: "" };
  let current: Limb | null = null;
  for (const s of samples) {
    const starting = s.limb !== current;
    limbPaths[s.limb] +=
      `${starting ? `${limbPaths[s.limb] ? " " : ""}M` : "L"}${s.x.toFixed(1)},${s.y.toFixed(1)}`;
    current = s.limb;
  }

  const limbShare = { ...spent };
  for (const limb of LIMBS) limbShare[limb] = time > 0 ? spent[limb] / time : 0;

  return { limbPaths, circuitTime: time, limbShare, samples };
}

/** Where a drifter sits after `fraction` of one full circuit. */
export function positionAt(loop: GyreLoop, fraction: number): { x: number; y: number } {
  const wrapped = ((fraction % 1) + 1) % 1;
  const target = wrapped * loop.circuitTime;
  let lo = 0;
  let hi = loop.samples.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (loop.samples[mid].time < target) lo = mid + 1;
    else hi = mid;
  }
  const b = loop.samples[lo];
  const a = loop.samples[Math.max(0, lo - 1)];
  const span = b.time - a.time;
  const f = span > 0 ? (target - a.time) / span : 0;
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}
