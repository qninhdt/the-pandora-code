"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Organs ride different log-log slopes against body mass. Drag mass; each organ
// tracks its own exponent — the signature of allometry, not isometry.
const ORGANS = [
  { key: "lung", b: 1.0, color: "var(--cyan)" },
  { key: "heart", b: 0.98, color: "var(--teal)" },
  { key: "brain", b: 0.75, color: "var(--amber)" },
  { key: "bone", b: 1.1, color: "var(--magenta)" },
] as const;

export default function Allometry() {
  const t = useTranslations("viz.allometry");
  const [logM, setLogM] = useState(1.5); // log10 kg ~ 0.5..3
  const mass = 10 ** logM;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setLogM(1.5)}
      allowFullscreen={false}
      caption={
        <span className="text-muted">
          {t("mass")}: {mass.toFixed(1)} kg
        </span>
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
          {/* axes */}
          <line x1="16" y1="78" x2="88" y2="78" stroke="var(--border-strong)" strokeWidth="0.6" />
          <line x1="16" y1="78" x2="16" y2="18" stroke="var(--border-strong)" strokeWidth="0.6" />
          <text
            x="52"
            y="90"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("mass")} (log)
          </text>
          <text
            x="10"
            y="48"
            textAnchor="middle"
            transform="rotate(-90 10 48)"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("organ")}
          </text>

          {ORGANS.map((o) => {
            // line from logM=0.5..3 mapped to x 16..88, y from organ size
            const x1 = 16;
            const x2 = 88;
            const m1 = 0.5;
            const m2 = 3;
            const yAt = (lm: number) => {
              const size = lm * o.b; // relative log size
              return 78 - ((size - 0.3) / 3.2) * 56;
            };
            const cx = 16 + ((logM - 0.5) / 2.5) * 72;
            const cy = yAt(logM);
            return (
              <g key={o.key}>
                <line
                  x1={x1}
                  y1={yAt(m1)}
                  x2={x2}
                  y2={yAt(m2)}
                  stroke={o.color}
                  strokeWidth="0.8"
                  opacity="0.7"
                />
                <circle cx={cx} cy={cy} r="2.4" fill={o.color} />
                <text
                  x="90"
                  y={yAt(2.2) + 1}
                  style={{ fontSize: 2.2, fontFamily: "monospace", fill: o.color }}
                >
                  {t(o.key)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("slope")}
            value={ORGANS.map((o) => o.b.toFixed(2)).join(" · ")}
            accent="cyan"
          />
        </div>

        <div className="absolute inset-x-4 bottom-11">
          <ControlSlider
            label={t("mass")}
            value={logM}
            min={0.5}
            max={3}
            step={0.05}
            display={`${mass.toFixed(1)} kg`}
            onChange={setLogM}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
