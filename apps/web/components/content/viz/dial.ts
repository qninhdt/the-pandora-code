// Shared radial geometry for dial/clock/gauge figures (Froude gait dial, eclipse
// day clock, confidence dial). Each of these was re-deriving the same
// angle→point and arc-path math inline; this centralizes it.

export interface Point {
  x: number;
  y: number;
}

// Point on a circle. Angle in radians, measured counter-clockwise from the
// positive x-axis, with y growing downward (SVG convention) — so we subtract the
// sine term to put 0 at 3 o'clock and π/2 at 12 o'clock.
export function arcPoint(cx: number, cy: number, r: number, angleRad: number): Point {
  return { x: cx + r * Math.cos(angleRad), y: cy - r * Math.sin(angleRad) };
}

// Map a 0..1 fraction onto an angular sweep [startRad, endRad].
export function angleForFraction(fraction: number, startRad: number, endRad: number): number {
  const f = Math.min(1, Math.max(0, fraction));
  return startRad + (endRad - startRad) * f;
}

// SVG arc path between two angles on a circle. `sweepFlag` follows the SVG arc
// flag (1 = clockwise in screen space). Used for gauge tracks and sweeps.
export function arcPath(
  cx: number,
  cy: number,
  r: number,
  startRad: number,
  endRad: number,
  sweepFlag: 0 | 1 = 1,
): string {
  const a = arcPoint(cx, cy, r, startRad);
  const b = arcPoint(cx, cy, r, endRad);
  const largeArc = Math.abs(endRad - startRad) > Math.PI ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} ${sweepFlag} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

// Common half-circle gauge sweep: 180° (left) → 0° (right), the dial used by the
// Froude gait figure.
export const GAUGE_START = Math.PI;
export const GAUGE_END = 0;
