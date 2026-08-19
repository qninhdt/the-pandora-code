"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Flux pinning, seen from the outside. Once the threads are pinned, the disc is
// not resting on the field — it is sewn into it, fixed at whatever position and
// tilt you left it. The uncanny proof: rotate the whole magnet track and the disc
// rides with it, locked at the same gap and angle, until at full inversion it
// hangs *underneath* the track, suspended against gravity, refusing to fall. It
// is not balancing — a balanced magnet would slide off the instant you tipped it.
// It is locked, rigid in three dimensions, hands-off and powerless.
export default function QuantumLocking() {
  const t = useTranslations("viz.quantum-locking");
  const [angle, setAngle] = useState(0); // 0..180 degrees, track rotation

  const rad = (angle * Math.PI) / 180;
  const cx = 50;
  const cy = 50;
  // track centre stays put; disc sits at a fixed offset along the track's normal
  const gap = 15;
  // normal direction of the track (starts pointing up: disc above track)
  const nx = Math.sin(rad);
  const ny = -Math.cos(rad);
  const discX = cx + nx * gap;
  const discY = cy + ny * gap;
  const inverted = angle > 135;

  // track endpoints (a bar centred at cx,cy, rotated by angle)
  const half = 26;
  const tx = Math.cos(rad);
  const ty = Math.sin(rad);
  const t1 = { x: cx - tx * half, y: cy - ty * half };
  const t2 = { x: cx + tx * half, y: cy + ty * half };

  // three flux threads from track to disc, keeping their relative geometry
  const threads = [-1, 0, 1].map((o) => {
    const ax = cx + tx * o * 9;
    const ay = cy + ty * o * 9;
    const bx = discX + tx * o * 6;
    const by = discY + ty * o * 6;
    return { ax, ay, bx, by };
  });

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAngle(0)}
      allowFullscreen={false}
      caption={
        inverted ? (
          <span className="text-teal">{t("hangsBeneath")}</span>
        ) : angle > 45 ? (
          <span className="text-cyan">{t("lockedTilt")}</span>
        ) : (
          <span className="text-cyan">{t("lockedAbove")}</span>
        )
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* gravity reference */}
          <g transform="translate(90 12)" opacity="0.5">
            <line x1="0" y1="0" x2="0" y2="8" stroke="var(--muted)" strokeWidth="0.4" />
            <path d="M-1.4 5.5 L0 8 L1.4 5.5" fill="none" stroke="var(--muted)" strokeWidth="0.4" />
            <text
              x="0"
              y="-1.5"
              textAnchor="middle"
              className="fill-muted"
              style={{ fontSize: 2.6, fontFamily: "monospace" }}
            >
              g
            </text>
          </g>

          {/* the magnet track */}
          <line
            x1={t1.x}
            y1={t1.y}
            x2={t2.x}
            y2={t2.y}
            stroke="var(--magenta)"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.75"
          />
          <line
            x1={t1.x}
            y1={t1.y}
            x2={t2.x}
            y2={t2.y}
            stroke="var(--magenta)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.4"
          />

          {/* flux threads holding the disc to the track */}
          {threads.map((th, i) => (
            <line
              key={i}
              x1={th.ax}
              y1={th.ay}
              x2={th.bx}
              y2={th.by}
              stroke="var(--cyan)"
              strokeWidth="0.7"
              opacity="0.65"
            />
          ))}

          {/* the locked disc, tilted with the track */}
          <g transform={`translate(${discX} ${discY}) rotate(${angle})`}>
            <ellipse
              cx="0"
              cy="0"
              rx="12"
              ry="4.5"
              fill="var(--surface)"
              stroke="var(--teal)"
              strokeWidth="0.7"
            />
            <ellipse cx="0" cy="0" rx="12" ry="4.5" fill="var(--teal)" opacity="0.18" />
          </g>

          {/* cold vapour drifting straight down regardless of track angle */}
          {Array.from({ length: 4 }, (_, i) => (
            <circle
              key={i}
              cx={discX - 6 + i * 4}
              cy={discY + 8 + (i % 2) * 3}
              r="0.8"
              fill="#cfe6f5"
              opacity="0.14"
            />
          ))}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("trackAngle")} value={`${Math.round(angle)}°`} accent="foreground" />
          <Readout label={t("hold")} value={t("rigid")} accent="teal" />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("rotateTrack")}
            value={angle}
            min={0}
            max={180}
            step={1}
            onChange={setAngle}
            display={inverted ? t("inverted") : angle > 45 ? t("tilted") : t("upright")}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
