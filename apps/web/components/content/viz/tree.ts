// Shared tree/cladogram geometry. The bilateral-lattice-tree and
// character-matrix-cladogram both drew identical right-angle "elbow" branch
// connectors; this centralizes the path builder and the tip-spacing helper.

export interface TreePoint {
  x: number;
  y: number;
}

// A right-angle connector from a parent node to a child node: horizontal out to
// the child's x, then vertical to the child's y. Rendered as an open path so the
// elbow reads as a clean phylogenetic branch.
export function branchPath(parent: TreePoint, child: TreePoint): string {
  return `M ${parent.x} ${parent.y} H ${child.x} V ${child.y}`;
}

// A smoothly curved connector variant (quadratic elbow) for a softer look — the
// midpoint x is the corner the curve bends around.
export function branchCurve(parent: TreePoint, child: TreePoint): string {
  const midX = (parent.x + child.x) / 2;
  return `M ${parent.x} ${parent.y} C ${midX} ${parent.y} ${midX} ${child.y} ${child.x} ${child.y}`;
}

// Evenly distribute `count` tips across [top, bottom], returning each tip's y
// center. Replaces the hand-tuned fractional offsets the trees hardcoded.
export function tipYs(count: number, top: number, bottom: number): number[] {
  if (count <= 1) return [(top + bottom) / 2];
  const step = (bottom - top) / (count - 1);
  return Array.from({ length: count }, (_, i) => top + i * step);
}
