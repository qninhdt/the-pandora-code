"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { type TrackKey, type TrackResult } from "./taphonomic-clock-dial-model";

// Five survival horizons on one logarithmic time axis spanning a day to a
// billion years — the only scale on which soft tissue and carbon fibre can
// appear in the same picture. Each track is a bar ending at its horizon. When
// surface exposure truncates a track, the lost span is drawn as a dimmed ghost
// continuing past the cut with a hard magenta stop where the weathering ceiling
// landed, so the reader sees exactly what late burial threw away.

const W = 360;
const ROW_H = 24;
const LABEL_W = 92;
const TRACK_X = LABEL_W;
const TRACK_W = W - LABEL_W - 12;

/** Axis runs 10⁻³ yr (about a day) to 10⁹ yr. */
const MIN_LOG = -3;
const MAX_LOG = 9;

function logPos(years: number): number {
  const l = Math.log10(Math.max(1e-4, years));
  return Math.max(0, Math.min(1, (l - MIN_LOG) / (MAX_LOG - MIN_LOG)));
}

const TONE: Record<TrackKey, string> = {
  softTissue: "var(--magenta)",
  dna: "var(--amber)",
  collagen: "var(--cyan)",
  apatite: "var(--teal)",
  carbonFibre: "var(--teal)",
};

interface TracksProps {
  uid: string;
  tracks: TrackResult[];
  /** Weathering ceiling in years, drawn as the burial-race marker. */
  ceiling: number;
  labels: {
    aria: string;
    track: Record<TrackKey, string>;
    ceiling: string;
    axis: string;
  };
}

export function TaphonomicClockTracks({ uid, tracks, ceiling, labels }: TracksProps) {
  const height = tracks.length * ROW_H + 44;
  const ceilingX = TRACK_X + logPos(ceiling) * TRACK_W;

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      className="w-full"
      role="img"
      aria-label={labels.aria}
      style={{ maxHeight: 250 }}
    >
      <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan", "amber"]} />

      {/* decade gridlines every three decades keeps the axis readable */}
      {Array.from({ length: (MAX_LOG - MIN_LOG) / 3 + 1 }, (_, i) => {
        const exp = MIN_LOG + i * 3;
        const x = TRACK_X + ((exp - MIN_LOG) / (MAX_LOG - MIN_LOG)) * TRACK_W;
        return (
          <g key={exp}>
            <line
              x1={x}
              y1={14}
              x2={x}
              y2={tracks.length * ROW_H + 16}
              stroke="var(--border)"
              strokeWidth={0.5}
              strokeDasharray="2 3"
            />
            <VizTick x={x} y={10}>
              {`10${exp < 0 ? "⁻³" : exp === 0 ? "⁰" : exp === 3 ? "³" : exp === 6 ? "⁶" : "⁹"}`}
            </VizTick>
          </g>
        );
      })}

      {/* the burial race: everything left of this line is still on the surface */}
      <line
        x1={ceilingX}
        y1={16}
        x2={ceilingX}
        y2={tracks.length * ROW_H + 18}
        stroke="var(--magenta)"
        strokeWidth={1}
        strokeDasharray="3 2"
        opacity={0.8}
      />

      {tracks.map((track, i) => {
        const y = 20 + i * ROW_H;
        const tone = TONE[track.key];
        const end = logPos(track.horizon) * TRACK_W;
        const ghostEnd = logPos(track.chemicalHorizon) * TRACK_W;
        return (
          <g key={track.key}>
            <VizText x={LABEL_W - 8} y={y + 10} anchor="end">
              {labels.track[track.key]}
            </VizText>
            {/* what late burial cost, drawn as a dim continuation */}
            {track.truncated ? (
              <rect
                x={TRACK_X + end}
                y={y + 2}
                width={Math.max(1, ghostEnd - end)}
                height={9}
                rx={2}
                fill={tone}
                opacity={0.16}
              />
            ) : null}
            <rect
              x={TRACK_X}
              y={y + 2}
              width={Math.max(1.5, end)}
              height={9}
              rx={2}
              fill={tone}
              opacity={0.75}
              filter={track.key === "carbonFibre" ? glowUrl(uid, "bloom") : undefined}
            />
            {track.truncated ? (
              <line
                x1={TRACK_X + end}
                y1={y}
                x2={TRACK_X + end}
                y2={y + 13}
                stroke="var(--magenta)"
                strokeWidth={1.4}
              />
            ) : null}
          </g>
        );
      })}

      <VizText x={ceilingX + 3} y={height - 18} size="micro" tone="magenta">
        {labels.ceiling}
      </VizText>
      <VizText x={TRACK_X} y={height - 5} size="micro">
        {labels.axis}
      </VizText>
    </svg>
  );
}
