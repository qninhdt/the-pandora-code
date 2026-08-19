"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// One gene, many unrelated jobs. Sonic hedgehog grows limbs — but also patterns
// the brain, the spinal cord and the teeth. That many-rolled nature is exactly why
// mutating a master gene's coding sequence is so dangerous: fix one thing and you
// break several at once. Toggle the gene and every trait it touches dims together —
// which is why evolution usually edits a regulatory switch for one tissue rather
// than risk the gene itself and its whole radiating web of effects.
const TRAITS = [
  { key: "brain", angle: -110 },
  { key: "limbs", angle: -55 },
  { key: "spine", angle: 0 },
  { key: "teeth", angle: 55 },
  { key: "eyes", angle: 110 },
];

export default function Pleiotropy() {
  const t = useTranslations("viz.pleiotropy");
  const [on, setOn] = useState(true);

  const gx = 26;
  const gy = 50;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setOn(true)}
      allowFullscreen={false}
      caption={
        on ? (
          <span>
            <span className="text-cyan">{TRAITS.length}</span> {t("traitsExpressed")}
          </span>
        ) : (
          <span className="text-magenta">{t("allDimmed")}</span>
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
          {/* radiating arrows to each trait */}
          {TRAITS.map((tr) => {
            const rad = (tr.angle * Math.PI) / 180;
            const ex = gx + Math.cos(rad) * 52;
            const ey = gy + Math.sin(rad) * 40;
            return (
              <g key={tr.key}>
                <line
                  x1={gx}
                  y1={gy}
                  x2={ex}
                  y2={ey}
                  stroke={on ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth={on ? 0.9 : 0.4}
                  opacity={on ? 0.6 : 0.25}
                />
                {/* trait node */}
                <circle
                  cx={ex}
                  cy={ey}
                  r={on ? 5 : 3.4}
                  fill={on ? "var(--cyan)" : "var(--surface)"}
                  opacity={on ? 0.8 : 0.3}
                  stroke={on ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth="0.5"
                />
                <text
                  x={ex}
                  y={ey + 9}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.8,
                    fontFamily: "monospace",
                    fill: on ? "var(--cyan)" : "var(--muted)",
                    opacity: on ? 0.9 : 0.4,
                  }}
                >
                  {t(tr.key)}
                </text>
              </g>
            );
          })}

          {/* the single pleiotropic gene */}
          <circle
            cx={gx}
            cy={gy}
            r="7"
            fill={on ? "var(--amber)" : "var(--surface)"}
            stroke={on ? "var(--amber)" : "var(--magenta)"}
            strokeWidth="0.7"
            opacity={on ? 0.95 : 0.5}
          />
          <text
            x={gx}
            y={gy + 1}
            textAnchor="middle"
            style={{
              fontSize: 2.6,
              fontFamily: "monospace",
              fill: on ? "var(--void)" : "var(--muted)",
            }}
          >
            {t("geneShort")}
          </text>
          <text
            x={gx}
            y={gy - 11}
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("oneGene")}
          </text>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("traitsHit")}
            value={on ? "0" : `${TRAITS.length}`}
            accent={on ? "teal" : "magenta"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setOn((v) => !v)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md transition-colors"
            style={{
              borderColor: on ? "var(--amber)" : "var(--magenta)",
              color: on ? "var(--amber)" : "var(--magenta)",
              background: on
                ? "color-mix(in oklab, var(--amber) 12%, transparent)"
                : "color-mix(in oklab, var(--magenta) 12%, transparent)",
            }}
          >
            {on ? t("knockOut") : t("restoreGene")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
