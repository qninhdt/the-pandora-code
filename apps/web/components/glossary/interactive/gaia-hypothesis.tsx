"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// A living world holding three planetary variables — temperature, chemistry,
// oxygen — steady, drawn as concentric regulation rings breathing around a
// living core. Toggle "life off" and the rings stop regulating: they drift and
// collapse to the dead, static equilibrium of a bare rock (Mars/Venus). The
// lens for reading Pandora: can a planet *be* alive, not merely carry life?
type Mode = "alive" | "dead";
const RINGS = [
  { key: "temperature", r: 20, color: "var(--amber)" },
  { key: "chemistry", r: 28, color: "var(--teal)" },
  { key: "oxygen", r: 36, color: "var(--cyan)" },
];

export default function GaiaHypothesis() {
  const t = useTranslations("viz.gaia-hypothesis");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [mode, setMode] = useState<Mode>("alive");
  const phase = useRef(0);
  const decay = useRef(1); // 1 = fully regulated, 0 = collapsed
  const force = useState(0)[1];

  useRafLoop(
    (dt) => {
      phase.current += dt;
      const target = mode === "alive" ? 1 : 0;
      decay.current += (target - decay.current) * dt * 1.4;
      force((n) => (n + 1) % 1_000_000);
    },
    { active: inView },
  );

  const alive = mode === "alive";
  const reg = decay.current; // regulation health 0..1

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("alive")}
      allowFullscreen={false}
      caption={
        <span>
          {t("regulation")}:{" "}
          <span className={reg > 0.5 ? "text-teal" : "text-muted"}>
            {reg > 0.5 ? t("held") : t("collapsed")}
          </span>
        </span>
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* the living core */}
          <circle
            cx="50"
            cy="50"
            r="11"
            fill={alive ? "url(#gaia-core)" : "#1a1610"}
            stroke={alive ? "var(--teal)" : "var(--border-strong)"}
            strokeWidth="0.5"
          />
          <defs>
            <radialGradient id="gaia-core" cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#2bd4a8" stopOpacity={0.5 * reg + 0.1} />
              <stop offset="100%" stopColor="#0a2a24" />
            </radialGradient>
          </defs>

          {/* regulation rings — breathe when alive, drift & fade when dead */}
          {RINGS.map((ring, idx) => {
            // each ring's radius oscillates (regulation) scaled by health
            const breath = Math.sin(phase.current * (1.2 + idx * 0.3)) * 2.4 * reg;
            const rr = ring.r + breath;
            const op = 0.15 + reg * 0.55;
            return (
              <g key={ring.key}>
                <circle
                  cx="50"
                  cy="50"
                  r={rr}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={0.6 + reg * 0.8}
                  opacity={op}
                  strokeDasharray={reg < 0.4 ? "2 3" : "none"}
                />
                {/* a regulated marker orbiting each ring */}
                <circle
                  cx={50 + Math.cos(phase.current * (0.8 + idx * 0.25)) * rr}
                  cy={50 + Math.sin(phase.current * (0.8 + idx * 0.25)) * rr}
                  r={1.4 + reg}
                  fill={ring.color}
                  opacity={0.3 + reg * 0.6}
                />
              </g>
            );
          })}

          {/* dead-equilibrium hint: flat static ring when collapsed */}
          {reg < 0.4 && (
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="var(--muted)"
              strokeWidth="0.3"
              strokeDasharray="1 2"
              opacity="0.4"
            />
          )}
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          {RINGS.map((ring) => (
            <Readout
              key={ring.key}
              label={t(ring.key)}
              value={reg > 0.5 ? t("steady") : t("drifting")}
              accent={reg > 0.5 ? "teal" : "cyan"}
            />
          ))}
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <ControlTabs
            ariaLabel={t("mode")}
            options={[
              { value: "alive", label: t("lifeOn") },
              { value: "dead", label: t("lifeOff") },
            ]}
            value={mode}
            onChange={(v) => setMode(v as Mode)}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
