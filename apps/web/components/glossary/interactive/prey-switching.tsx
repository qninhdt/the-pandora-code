"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Frequency-dependent diet: preference for A rises with relative abundance
// (Murdoch switching). p_A = (c A²) / (c A² + B²) with c = preference bias.
export default function PreySwitching() {
  const t = useTranslations("viz.prey-switching");
  const [preyA, setPreyA] = useState(0.55);
  const [preyB, setPreyB] = useState(0.45);

  // normalize ambient densities for display ratios
  const { dietA, dietB } = useMemo(() => {
    const c = 1.0;
    const num = c * preyA * preyA;
    const den = num + preyB * preyB;
    const dA = den > 0 ? num / den : 0.5;
    return { dietA: dA, dietB: 1 - dA };
  }, [preyA, preyB]);

  // pie geometry
  const r = 18;
  const cx = 38;
  const cy = 42;
  const angleA = dietA * Math.PI * 2;
  const ax = cx + r * Math.sin(angleA);
  const ay = cy - r * Math.cos(angleA);
  const large = dietA > 0.5 ? 1 : 0;
  const pieA =
    dietA > 0.999
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
      : dietA < 0.001
        ? ""
        : `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${ax} ${ay} Z`;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setPreyA(0.55);
        setPreyB(0.45);
      }}
      allowFullscreen={false}
      caption={
        <span>
          {t("diet")} <span className="text-cyan">{(dietA * 100).toFixed(0)}%</span>
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
          {/* abundance bars */}
          <text
            x="78"
            y="24"
            textAnchor="middle"
            style={{ fontSize: 2.3, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            dens.
          </text>
          <rect
            x="70"
            y={60 - preyA * 32}
            width="8"
            height={preyA * 32}
            rx="1"
            fill="var(--cyan)"
            opacity="0.8"
          />
          <rect
            x="82"
            y={60 - preyB * 32}
            width="8"
            height={preyB * 32}
            rx="1"
            fill="var(--magenta)"
            opacity="0.8"
          />
          <text
            x="74"
            y="66"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            A
          </text>
          <text
            x="86"
            y="66"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            B
          </text>

          {/* diet pie */}
          <circle cx={cx} cy={cy} r={r} fill="var(--magenta)" opacity="0.75" />
          {pieA && <path d={pieA} fill="var(--cyan)" opacity="0.9" />}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
          />
          <text
            x={cx}
            y={cy + r + 8}
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("diet")}
          </text>

          {/* predator glyph */}
          <ellipse cx="38" cy="14" rx="6" ry="3.5" fill="var(--amber)" opacity="0.7" />
        </svg>

        <div className="absolute left-3 top-14">
          <Readout label={t("diet")} value={`${(dietA * 100).toFixed(0)}%`} accent="cyan" />
        </div>

        <div className="absolute inset-x-3 bottom-10 space-y-1.5">
          <ControlSlider
            label={t("preyA")}
            value={preyA}
            min={0.05}
            max={1}
            step={0.02}
            display={preyA.toFixed(2)}
            onChange={setPreyA}
            thumb="cyan"
          />
          <ControlSlider
            label={t("preyB")}
            value={preyB}
            min={0.05}
            max={1}
            step={0.02}
            display={preyB.toFixed(2)}
            onChange={setPreyB}
            thumb="magenta"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
