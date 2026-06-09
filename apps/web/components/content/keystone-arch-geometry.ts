import { arcPoint } from "@/components/content/viz/dial";

// Geometry + coupled-collapse model behind KeystoneCascadeToggle. The arch is the
// chapter's own image: a semicircle of voussoir stones capped by the apex-predator
// keystone wedge. Removing the keystone past a tipping fraction collapses the arch,
// and the same removal drives a coupled food-web response — grazers released,
// vegetation crushed — interpolated continuously rather than snapped between two
// hardcoded endpoints.

export const ARCH = {
  cx: 160,
  cy: 190,
  ri: 68,
  ro: 108,
  n: 7, // odd → a single central keystone (index 3)
} as const;

export const KEYSTONE_INDEX = Math.floor(ARCH.n / 2);
const STEP = Math.PI / ARCH.n;

export interface Voussoir {
  index: number;
  isKeystone: boolean;
  /** Polygon points (inner-a0, inner-a1, outer-a1, outer-a0). */
  points: string;
  /** Centroid, used as the transform origin for the fall. */
  cxp: number;
  cyp: number;
  /** Mid-angle of the slice (π=left … 0=right). */
  mid: number;
}

function corner(r: number, a: number): string {
  const p = arcPoint(ARCH.cx, ARCH.cy, r, a);
  return `${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
}

// The static voussoir set — built once. Angles run 0 (right springer) → π (left).
export const VOUSSOIRS: Voussoir[] = Array.from({ length: ARCH.n }, (_, i) => {
  const a0 = i * STEP;
  const a1 = (i + 1) * STEP;
  const mid = (a0 + a1) / 2;
  const c = arcPoint(ARCH.cx, ARCH.cy, (ARCH.ri + ARCH.ro) / 2, mid);
  return {
    index: i,
    isKeystone: i === KEYSTONE_INDEX,
    points: `${corner(ARCH.ri, a0)} ${corner(ARCH.ri, a1)} ${corner(ARCH.ro, a1)} ${corner(ARCH.ro, a0)}`,
    cxp: c.x,
    cyp: c.y,
    mid,
  };
});

// smoothstep — eases the collapse so it accelerates past the tipping point.
function smooth(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export const TIPPING = 0.5; // keystone removal fraction at which the arch lets go

export interface CollapseState {
  removal: number; // 0 (intact) … 1 (gone)
  collapse: number; // 0 until tipping, then 0→1
  phase: "stable" | "tipping" | "collapsed";
}

export function collapseState(removal: number): CollapseState {
  const collapse = smooth((removal - TIPPING) / (1 - TIPPING));
  const phase = removal < TIPPING * 0.5 ? "stable" : collapse > 0.6 ? "collapsed" : "tipping";
  return { removal, collapse, phase };
}

// The keystone's own exit: it lifts straight out and fades as it is removed, fully
// gone by the tipping point (after which the rest of the arch falls).
export function keystoneTransform(removal: number): { dy: number; opacity: number } {
  const r = Math.min(1, removal / TIPPING);
  return { dy: -34 * r, opacity: 1 - r };
}

// A non-keystone stone's fall: side stones slide outward and rotate away; stones
// near the crown drop more steeply. Deterministic per index, scaled by collapse.
export function stoneTransform(v: Voussoir, collapse: number): string {
  if (collapse <= 0) return "";
  const dir = Math.cos(v.mid); // +right, −left, ~0 at crown
  const dx = dir * collapse * 46;
  const dy = collapse * (38 + 84 * collapse);
  const rot = -dir * collapse * 32;
  return `translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${rot.toFixed(1)} ${v.cxp.toFixed(1)} ${v.cyp.toFixed(1)})`;
}

// Coupled food-web response to apex removal. Grazers are released (nonlinear, they
// balloon once the check is gone); vegetation is crushed in proportion to the
// grazing pressure above the sustainable baseline. Returns fills in [0,1].
export function foodWeb(removal: number): { apex: number; grazer: number; plants: number } {
  const apex = 1 - removal;
  const grazer = 0.4 + 0.55 * smooth(removal);
  const plants = Math.max(0.06, 0.85 - 1.45 * (grazer - 0.4));
  return { apex, grazer, plants };
}
