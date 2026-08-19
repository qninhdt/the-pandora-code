"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Onnes's cliff. An ordinary metal's resistance eases down smoothly as you cool
// it; a superconductor's does not. Slide the temperature marker down the axis and
// the resistance tracks the material's curve — then, the instant you cross the
// critical temperature Tc, it does not ease to a small value but falls off a
// cliff to a flat, exact zero. Each material has its own Tc: mercury needs liquid
// helium, YBCO reaches liquid nitrogen, and unobtanium's whole fantasy is to push
// that same cliff all the way up to a warm Pandoran afternoon.
const MATERIALS = [
  { key: "mercury", tc: 0.08, kelvin: "4.2 K", color: "var(--cyan)" },
  { key: "ybco", tc: 0.42, kelvin: "92 K", color: "var(--teal)" },
  { key: "unobtanium", tc: 0.85, kelvin: "297 K", color: "var(--amber)" },
] as const;

type MatKey = (typeof MATERIALS)[number]["key"];

export default function CriticalTemperature() {
  const t = useTranslations("viz.critical-temperature");
  const [matKey, setMatKey] = useState<MatKey>("ybco");
  const [temp, setTemp] = useState(0.6); // 0..1 along the axis

  const mat = MATERIALS.find((m) => m.key === matKey) ?? MATERIALS[1];
  const tc = mat.tc;
  const superconducting = temp <= tc;

  // resistance model: above Tc, roughly linear in T (ordinary metal); at/below Tc,
  // exactly zero. Normalised 0..1 for the plot.
  const resistance = superconducting ? 0 : Math.min(1, ((temp - tc) / (1 - tc)) * 0.85 + 0.12);

  // build the resistance curve as a path across the plotting box
  const X0 = 14;
  const X1 = 92;
  const Y0 = 78; // zero-resistance baseline
  const YT = 20; // top
  const tx = (v: number) => X0 + v * (X1 - X0);
  const ry = (r: number) => Y0 - r * (Y0 - YT);

  let curve = `M${X0} ${Y0}`; // start at cold end, zero
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const v = i / steps;
    const r = v <= tc ? 0 : Math.min(1, ((v - tc) / (1 - tc)) * 0.85 + 0.12);
    curve += `L${tx(v).toFixed(1)} ${ry(r).toFixed(1)}`;
  }

  const markerX = tx(temp);
  const markerY = ry(resistance);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setMatKey("ybco");
        setTemp(0.6);
      }}
      allowFullscreen={false}
      caption={
        superconducting ? (
          <span className="text-teal">{t("zeroResistance")}</span>
        ) : (
          <span className="text-muted">{t("ordinaryMetal")}</span>
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
          {/* axes */}
          <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--border-strong)" strokeWidth="0.5" />
          <line x1={X0} y1={Y0} x2={X0} y2={YT} stroke="var(--border-strong)" strokeWidth="0.5" />
          <text
            x={(X0 + X1) / 2}
            y="88"
            textAnchor="middle"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("axisTemp")}
          </text>
          <text
            x="6"
            y={(Y0 + YT) / 2}
            textAnchor="middle"
            transform={`rotate(-90 6 ${(Y0 + YT) / 2})`}
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("axisResistance")}
          </text>

          {/* Tc vertical marker */}
          <line
            x1={tx(tc)}
            y1={Y0}
            x2={tx(tc)}
            y2={YT}
            stroke={mat.color}
            strokeWidth="0.5"
            strokeDasharray="2 1.5"
            opacity="0.6"
          />
          <text
            x={tx(tc)}
            y={YT - 2}
            textAnchor="middle"
            style={{ fontSize: 3.4, fontFamily: "monospace", fill: mat.color }}
          >
            Tc
          </text>

          {/* superconducting floor shading (left of Tc) */}
          <rect
            x={X0}
            y={Y0 - 1.5}
            width={tx(tc) - X0}
            height="1.5"
            fill="var(--teal)"
            opacity="0.5"
          />

          {/* the resistance curve */}
          <path d={curve} fill="none" stroke={mat.color} strokeWidth="1.4" />

          {/* live temperature marker */}
          <line
            x1={markerX}
            y1={Y0}
            x2={markerX}
            y2={YT}
            stroke="var(--foreground)"
            strokeWidth="0.4"
            opacity="0.35"
          />
          <circle cx={markerX} cy={markerY} r="2.4" fill="var(--foreground)" />
          <circle
            cx={markerX}
            cy={markerY}
            r="4"
            fill="none"
            stroke={superconducting ? "var(--teal)" : mat.color}
            strokeWidth="0.6"
            opacity="0.7"
          />
        </svg>

        <div className="absolute right-3 top-16 flex flex-col items-end gap-1.5">
          <Readout label={t("tcLabel")} value={mat.kelvin} accent="amber" />
          <Readout
            label={t("resistanceLabel")}
            value={superconducting ? "0" : resistance.toFixed(2)}
            accent={superconducting ? "teal" : "foreground"}
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
            label={t("temperature")}
            value={temp}
            min={0}
            max={1}
            step={0.01}
            onChange={setTemp}
            display={superconducting ? t("belowTc") : t("aboveTc")}
            thumb={superconducting ? "teal" : "cyan"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
