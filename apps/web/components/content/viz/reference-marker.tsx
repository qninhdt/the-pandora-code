"use client";

import { VizText } from "./viz-svg-text";

interface ReferenceMarkerProps {
  /** SVG x of the marker centre. */
  x: number;
  /** SVG y of the marker centre. */
  y: number;
  label: string;
  /** CSS color (var or hex) for ring + label. Defaults to muted. */
  tone?: string;
  /** Hollow ring (reference) vs filled dot (live value). */
  hollow?: boolean;
  /** Label offset from the dot. */
  dx?: number;
  dy?: number;
}

// A plotted reference point on a diagram: a small ring/dot plus a label. Replaces
// the per-component `Marker` locals in Whittaker / Habitable. The label uses the
// shared SVG type scale so reference points read consistently across figures.
export function ReferenceMarker({
  x,
  y,
  label,
  tone = "var(--muted)",
  hollow = true,
  dx = 8,
  dy = -7,
}: ReferenceMarkerProps) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* soft halo so the point reads as a glowing node, not a flat pin */}
      <circle r={11} fill={tone} opacity={0.14} style={{ filter: "blur(2px)" }} />
      <circle
        r={5.5}
        fill={hollow ? "var(--void)" : tone}
        style={{ stroke: tone }}
        strokeWidth={2}
      />
      {!hollow ? <circle r={2} fill="var(--void)" opacity={0.5} /> : null}
      <VizText x={dx} y={dy} size="small" tone={tone} style={{ paintOrder: "stroke" }}>
        {label}
      </VizText>
    </g>
  );
}
