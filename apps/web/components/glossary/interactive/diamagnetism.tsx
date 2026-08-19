"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The quiet cousin of magnetism. Bring a magnet near matter and most of it barely
// answers: a ferromagnet lunges toward the field, but a diamagnet — graphite,
// water, living tissue — pushes weakly *away*, its electron orbits stirring up a
// faint opposing field. In ordinary stuff the effect is so slight it takes a huge
// magnet to lift a frog. A superconductor is the limiting case: a perfect
// diamagnet that expels the field completely and levitates in even a weak one.
// Pick a material, dial the field, and watch its response reverse and grow.
const MATERIALS = [
  { key: "iron", chi: 1, kind: "ferro" },
  { key: "graphite", chi: -0.14, kind: "dia" },
  { key: "water", chi: -0.05, kind: "dia" },
  { key: "superconductor", chi: -1, kind: "perfect" },
] as const;

type MatKey = (typeof MATERIALS)[number]["key"];

export default function Diamagnetism() {
  const t = useTranslations("viz.diamagnetism");
  const [matKey, setMatKey] = useState<MatKey>("graphite");
  const [field, setField] = useState(0.55); // 0..1 magnet field strength

  const mat = MATERIALS.find((m) => m.key === matKey) ?? MATERIALS[1];
  const attract = mat.chi > 0;
  const perfect = mat.kind === "perfect";

  // response magnitude → vertical displacement of the sample
  const respMag = Math.abs(mat.chi) * field;
  // ferro: sample rises toward magnet (up = toward centre). dia: sample sinks/pushed down.
  const gap = attract ? 22 - respMag * 10 : 22 + respMag * (perfect ? 14 : 9);

  const magY = 20;
  const sampleY = magY + gap;

  // field lines from the magnet. For a diamagnet they bend around the sample;
  // for perfect diamagnet they are fully excluded (arc high over it).
  const lines = Array.from({ length: 5 }, (_, i) => {
    const x = 24 + i * 13;
    const bend = attract ? 0 : respMag * (perfect ? 20 : 11);
    // control point pulled sideways/up to suggest exclusion
    const midY = (magY + sampleY) / 2 - bend;
    const dir = x < 50 ? -1 : 1;
    const midX = x + dir * bend * 0.8;
    return { x, midX, midY };
  });

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setMatKey("graphite");
        setField(0.55);
      }}
      allowFullscreen={false}
      caption={
        attract ? (
          <span className="text-magenta">{t("attracted")}</span>
        ) : perfect ? (
          <span className="text-teal">{t("expelled")}</span>
        ) : (
          <span className="text-cyan">{t("repelled")}</span>
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
          {/* the magnet at top */}
          <rect
            x="40"
            y={magY - 7}
            width="20"
            height="7"
            rx="1"
            fill="var(--magenta)"
            opacity="0.85"
          />
          <rect x="40" y={magY - 7} width="10" height="7" rx="1" fill="#5a6270" />
          <text
            x="45"
            y={magY - 2}
            textAnchor="middle"
            className="fill-void"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            N
          </text>
          <text
            x="55"
            y={magY - 2}
            textAnchor="middle"
            className="fill-void"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            S
          </text>

          {/* field lines reaching toward / bending around the sample */}
          {lines.map((ln, i) => (
            <path
              key={i}
              d={`M${ln.x} ${magY} Q ${ln.midX} ${ln.midY} 50 ${sampleY - 2}`}
              fill="none"
              stroke="var(--cyan)"
              strokeWidth="0.4"
              opacity={0.15 + field * 0.4}
              strokeDasharray={perfect ? "1.5 1.5" : undefined}
            />
          ))}

          {/* the sample */}
          <rect
            x="34"
            y={sampleY}
            width="32"
            height="12"
            rx="1.5"
            fill={attract ? "var(--magenta)" : perfect ? "var(--teal)" : "var(--cyan)"}
            opacity={perfect ? 0.35 : 0.28}
            stroke={attract ? "var(--magenta)" : perfect ? "var(--teal)" : "var(--cyan)"}
            strokeWidth="0.6"
          />
          {/* levitation shadow gap indicator for repelled samples */}
          {!attract && respMag > 0.05 && (
            <line
              x1="34"
              y1={sampleY + 13}
              x2="66"
              y2={sampleY + 13}
              stroke="var(--teal)"
              strokeWidth="0.4"
              strokeDasharray="1 1"
              opacity="0.5"
            />
          )}

          {/* response arrow on the sample */}
          <g transform={`translate(50 ${sampleY + 6})`}>
            {attract ? (
              <path
                d="M0 4 L0 -5 M-2 -2.5 L0 -5 L2 -2.5"
                stroke="var(--magenta)"
                strokeWidth="0.7"
                fill="none"
              />
            ) : (
              <path
                d="M0 -4 L0 5 M-2 2.5 L0 5 L2 2.5"
                stroke={perfect ? "var(--teal)" : "var(--cyan)"}
                strokeWidth="0.7"
                fill="none"
              />
            )}
          </g>
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout
            label={t("response")}
            value={attract ? t("pull") : t("push")}
            accent={attract ? "magenta" : perfect ? "teal" : "cyan"}
          />
          <Readout
            label={t("forceLabel")}
            value={`${Math.round(respMag * 100)}%`}
            accent="foreground"
          />
        </div>

        <div className="absolute inset-x-3 top-14 flex justify-center">
          <ControlTabs
            options={MATERIALS.map((m) => ({ value: m.key, label: t(m.key) }))}
            value={matKey}
            onChange={(v) => setMatKey(v as MatKey)}
            ariaLabel={t("material")}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12">
          <ControlSlider
            label={t("fieldStrength")}
            value={field}
            min={0}
            max={1}
            step={0.01}
            onChange={setField}
            display={`${Math.round(field * 100)}%`}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
