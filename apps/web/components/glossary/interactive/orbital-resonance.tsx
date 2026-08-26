"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Legend } from "./shared/legend";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

const CX = 50;
const CY = 50;
const GIANT_R = 9;

type RatioKey = "laplace" | "two-one" | "off";

interface RatioSpec {
  key: RatioKey;
  // Period multipliers for the three moons (inner = fastest).
  speeds: [number, number, number];
  locked: boolean;
}

// Inner:middle:outer angular-speed ratios. Laplace 4:2:1 is the real Galilean
// lock; "two-one" is a clean 2:1 cascade; "off" uses irrational-ish ratios so
// the pattern never closes — visibly drifting chaos.
const RATIOS: Record<RatioKey, RatioSpec> = {
  laplace: { key: "laplace", speeds: [4, 2, 1], locked: true },
  "two-one": { key: "two-one", speeds: [3, 2, 1], locked: true },
  off: { key: "off", speeds: [3.7, 1.91, 1], locked: false },
};

const MOON_RADII: [number, number, number] = [18, 27, 36];
const MOON_COLORS = ["var(--cyan)", "var(--teal)", "var(--magenta)"];

export default function OrbitalResonance() {
  const t = useTranslations("viz.orbital-resonance");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [ratio, setRatio] = useState<RatioKey>("laplace");
  const [isPlaying, setIsPlaying] = useState(true);

  const anglesRef = useRef<[number, number, number]>([0, 0, 0]);
  const [, force] = useState(0);

  const spec = RATIOS[ratio];

  useRafLoop(
    (dt) => {
      const a = anglesRef.current;
      for (let i = 0; i < 3; i++) {
        a[i] += spec.speeds[i] * dt * 0.5;
      }
      force((n) => (n + 1) % 1000000);
    },
    { active: isPlaying && inView },
  );

  const angles = anglesRef.current;
  const positions = MOON_RADII.map((r, i) => ({
    x: CX + Math.cos(angles[i]) * r,
    y: CY + Math.sin(angles[i]) * r * 0.92,
    r,
  }));

  // Conjunction detector: when inner & middle align on the locked ratios.
  const conjunction =
    spec.locked &&
    Math.abs(Math.sin(angles[0] - angles[1])) < 0.08 &&
    Math.cos(angles[0] - angles[1]) > 0;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying((p) => !p)}
      onReset={() => {
        anglesRef.current = [0, 0, 0];
      }}
      caption={
        <span style={{ color: spec.locked ? "var(--teal)" : "var(--amber)" }}>
          {spec.locked ? t("locked") : t("chaotic")}
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <radialGradient id="res-giant" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3a5fa8" />
              <stop offset="70%" stopColor="#1d2f5a" />
              <stop offset="100%" stopColor="var(--void)" />
            </radialGradient>
          </defs>

          {/* orbit rings */}
          {MOON_RADII.map((r) => (
            <ellipse
              key={r}
              cx={CX}
              cy={CY}
              rx={r}
              ry={r * 0.92}
              fill="none"
              stroke="var(--border-strong)"
              strokeWidth="0.3"
              opacity="0.5"
            />
          ))}

          {/* central gas giant */}
          <circle cx={CX} cy={CY} r={GIANT_R + 4} fill="var(--cyan)" opacity="0.05" />
          <circle cx={CX} cy={CY} r={GIANT_R} fill="url(#res-giant)" />

          {/* resonance tug lines when locked */}
          {spec.locked &&
            positions.map((p, i) => (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={p.x}
                y2={p.y}
                stroke={MOON_COLORS[i]}
                strokeWidth="0.3"
                opacity={conjunction ? 0.5 : 0.15}
              />
            ))}

          {/* conjunction flash */}
          {conjunction && (
            <circle
              cx={CX}
              cy={CY}
              r={GIANT_R + 6}
              fill="none"
              stroke="var(--teal)"
              strokeWidth="0.6"
              opacity="0.6"
            />
          )}

          {/* moons */}
          {positions.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={3 - i * 0.5}
              fill={MOON_COLORS[i]}
              opacity="0.95"
            />
          ))}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("ratio")}
            value={ratio === "laplace" ? "4:2:1" : ratio === "two-one" ? "2:1" : "—"}
            accent={spec.locked ? "teal" : "amber"}
          />
        </div>

        <div className="absolute left-3 top-16">
          <Legend
            vertical
            items={[
              { color: MOON_COLORS[0], label: t("inner") },
              { color: MOON_COLORS[2], label: t("outer") },
            ]}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <ControlTabs<RatioKey>
            ariaLabel={t("ratio")}
            value={ratio}
            onChange={setRatio}
            options={[
              { value: "laplace", label: "4:2:1" },
              { value: "two-one", label: "2:1" },
              { value: "off", label: "✕" },
            ]}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
