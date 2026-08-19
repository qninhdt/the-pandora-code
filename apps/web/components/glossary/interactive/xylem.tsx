"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Hagen–Poiseuille: flow ∝ r^4; wider vessels → faster flow, higher cavitation risk.
export default function Xylem() {
  const t = useTranslations("viz.xylem");
  const [diameter, setDiameter] = useState(0.45); // normalized radius proxy

  const { flow, risk } = useMemo(() => {
    const r = 0.3 + diameter * 1.4;
    const flowRaw = Math.pow(r, 4);
    const flowNorm = Math.min(1, flowRaw / Math.pow(1.7, 4));
    // cavitation risk rises steeply with diameter
    const riskNorm = Math.min(1, Math.pow(diameter, 1.6) * 1.15);
    return { flow: flowNorm, risk: riskNorm };
  }, [diameter]);

  const critical = risk > 0.72;
  const vesselR = 1.2 + diameter * 4;
  const vessels = [0, 1, 2, 3, 4];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setDiameter(0.45)}
      allowFullscreen={false}
      caption={
        <span className={critical ? "text-magenta" : "text-cyan"}>
          {critical ? t("critical") : t("safe")} · Q∝r⁴
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* bundle outline */}
          <rect x="28" y="18" width="44" height="54" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="0.8" rx="2" />
          {/* vessels */}
          {vessels.map((i) => {
            const x = 36 + i * 7;
            return (
              <g key={i}>
                <rect
                  x={x - vesselR}
                  y="22"
                  width={vesselR * 2}
                  height="46"
                  fill="var(--cyan)"
                  opacity={0.15 + flow * 0.35}
                  rx={vesselR}
                />
                {/* rising water columns */}
                <rect
                  x={x - vesselR * 0.55}
                  y={68 - flow * 40}
                  width={vesselR * 1.1}
                  height={flow * 40}
                  fill="var(--cyan)"
                  opacity={0.55 + flow * 0.35}
                />
                {critical && i % 2 === 0 && (
                  <ellipse cx={x} cy="40" rx={vesselR * 0.7} ry={vesselR} fill="var(--void)" stroke="var(--magenta)" strokeWidth="0.5" opacity={0.85} />
                )}
              </g>
            );
          })}
          {/* flow arrow */}
          <path d="M78 60 L78 30" stroke="var(--amber)" strokeWidth="1" markerEnd="url(#xy-arrow)" opacity={0.5 + flow * 0.5} />
          <defs>
            <marker id="xy-arrow" markerWidth="4" markerHeight="4" refX="2" refY="2" orient="auto">
              <path d="M0 0 L4 2 L0 4 Z" fill="var(--amber)" />
            </marker>
          </defs>
          <text x="82" y="46" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--amber)" }}>
            {t("flow")}
          </text>
        </svg>
        <div className="absolute left-3 top-14 space-y-1">
          <Readout label={t("flow")} value={`${Math.round(flow * 100)}%`} accent="cyan" />
          <Readout label={t("risk")} value={`${Math.round(risk * 100)}%`} accent={critical ? "magenta" : "amber"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("diameter")}
            value={diameter}
            min={0.1}
            max={1}
            step={0.01}
            display={`${(10 + diameter * 90).toFixed(0)} µm`}
            onChange={setDiameter}
            thumb={critical ? "magenta" : "cyan"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
