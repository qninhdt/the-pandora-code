"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useId } from "react";
import {
  LOCK_ORDER,
  LOCK_STATES,
  type LockState,
  type Pairing,
} from "./infection-barrier-gauntlet-model";

// Six doors in a corridor. The visitor advances one door per attempt and stops at
// the first one that will not open. Cleared doors stand apart; the door that ends
// the chain stays shut and glows against it.

const W = 340;
const H = 118;
const TRACK_Y = 58;
const FIRST_X = 34;
const GAP = (W - FIRST_X - 22) / (LOCK_ORDER.length - 1);
const DOOR_H = 34;

const STATE_TONE: Record<LockState, string> = {
  clears: "var(--teal)",
  narrow: "var(--amber)",
  unknown: "var(--cyan)",
  blocked: "var(--magenta)",
};

interface ChainProps {
  pairing: Pairing;
  /** Doors the visitor has already opened. */
  cleared: number;
  /** Index of the door that stopped it, or null while still walking. */
  stoppedAt: number | null;
  ariaLabel: string;
  shortLabels: string[];
  startLabel: string;
  endLabel: string;
}

export function InfectionBarrierChain({
  pairing,
  cleared,
  stoppedAt,
  ariaLabel,
  shortLabels,
  startLabel,
  endLabel,
}: ChainProps) {
  const uid = useId();
  const states = LOCK_STATES[pairing];
  const visitorX = FIRST_X + Math.max(0, cleared - 0.5) * GAP;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={ariaLabel}>
      <GlowDefs idBase={uid} tones={["teal", "amber", "magenta", "cyan"]} />

      {/* the corridor the visitor walks */}
      <line
        x1={14}
        y1={TRACK_Y}
        x2={W - 12}
        y2={TRACK_Y}
        stroke="var(--border-strong)"
        strokeWidth={1.4}
        strokeOpacity={0.5}
        strokeDasharray="3 3"
      />
      <VizText x={14} y={TRACK_Y - 26} size="micro" tone="var(--subtle)">
        {startLabel}
      </VizText>
      <VizText x={W - 12} y={TRACK_Y - 26} size="micro" anchor="end" tone="var(--subtle)">
        {endLabel}
      </VizText>

      {LOCK_ORDER.map((id, i) => {
        const x = FIRST_X + i * GAP;
        const opened = i < cleared;
        const isStop = stoppedAt === i;
        const tone = opened
          ? STATE_TONE[states[id]]
          : isStop
            ? "var(--magenta)"
            : "var(--border-strong)";
        // An opened door splits into two leaves; a shut one stays whole.
        const split = opened ? 9 : 0;
        return (
          <g key={id}>
            <rect
              x={x - 2.2}
              y={TRACK_Y - DOOR_H / 2 - split}
              width={4.4}
              height={DOOR_H / 2}
              rx={2}
              fill={tone}
              opacity={opened ? 0.9 : 1}
              filter={isStop ? glowUrl(uid, "bloom") : undefined}
              style={{ transition: "y 0.3s ease, fill 0.3s ease" }}
            />
            <rect
              x={x - 2.2}
              y={TRACK_Y + split}
              width={4.4}
              height={DOOR_H / 2}
              rx={2}
              fill={tone}
              opacity={opened ? 0.9 : 1}
              filter={isStop ? glowUrl(uid, "bloom") : undefined}
              style={{ transition: "y 0.3s ease, fill 0.3s ease" }}
            />
            <VizText
              x={x}
              y={TRACK_Y + DOOR_H / 2 + 20}
              size="micro"
              anchor="middle"
              tone={opened || isStop ? tone : "var(--subtle)"}
            >
              {shortLabels[i]}
            </VizText>
          </g>
        );
      })}

      {/* the visitor: a single microbe working its way down the corridor */}
      <circle cx={visitorX} cy={TRACK_Y} r={11} fill={glowUrl(uid, "wash-cyan")} />
      <circle
        cx={visitorX}
        cy={TRACK_Y}
        r={4.2}
        fill={stoppedAt !== null ? "var(--magenta)" : "var(--cyan)"}
        filter={glowUrl(uid, "bloom")}
        style={{ transition: "cx 0.35s ease" }}
      />
    </svg>
  );
}
