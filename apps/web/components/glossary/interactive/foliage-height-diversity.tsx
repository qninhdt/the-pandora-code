"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Shannon-like FHD from vertical leaf-mass distribution.
function fhdIndex(layers: number[]) {
  const total = layers.reduce((a, b) => a + b, 0) || 1;
  let h = 0;
  for (const m of layers) {
    if (m <= 0) continue;
    const p = m / total;
    h -= p * Math.log(p);
  }
  return h / Math.log(layers.length); // 0..1 normalized
}

export default function FoliageHeightDiversity() {
  const t = useTranslations("viz.foliage-height-diversity");
  const [low, setLow] = useState(0.3);
  const [mid, setMid] = useState(0.55);
  const [high, setHigh] = useState(0.4);

  const layers = useMemo(() => [low, mid, high], [low, mid, high]);
  const fhd = fhdIndex(layers);
  const niches = Math.round(2 + fhd * 6);
  const even = fhd > 0.85;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => {
        setLow(0.3);
        setMid(0.55);
        setHigh(0.4);
      }}
      allowFullscreen={false}
      caption={
        <span className={even ? "text-teal" : "text-amber"}>
          {even ? t("even") : t("clumped")} · FHD {fhd.toFixed(2)}
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
          <line x1="24" y1="20" x2="24" y2="72" stroke="var(--border-strong)" strokeWidth="0.5" />
          <line x1="24" y1="72" x2="88" y2="72" stroke="var(--border-strong)" strokeWidth="0.5" />
          {/* histogram bars: high / mid / low from top */}
          {[
            { m: high, y: 24, c: "var(--amber)", label: "H" },
            { m: mid, y: 40, c: "var(--teal)", label: "M" },
            { m: low, y: 56, c: "var(--cyan)", label: "L" },
          ].map((row) => (
            <g key={row.label}>
              <rect
                x="26"
                y={row.y}
                width={8 + row.m * 50}
                height="10"
                fill={row.c}
                opacity={0.55}
                rx="1"
              />
              <text
                x="20"
                y={row.y + 7}
                textAnchor="end"
                style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}
              >
                {row.label}
              </text>
            </g>
          ))}
          {/* niche glyphs */}
          {Array.from({ length: niches }).map((_, i) => (
            <circle
              key={i}
              cx={30 + (i % 5) * 10}
              cy={80}
              r="2"
              fill={i % 2 === 0 ? "var(--magenta)" : "var(--amber)"}
              opacity={0.5 + fhd * 0.5}
            />
          ))}
          <text
            x="50"
            y="90"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("niches")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("fhd")} value={fhd.toFixed(2)} accent="teal" />
        </div>
        <div className="absolute inset-x-3 bottom-10 space-y-1.5">
          <ControlSlider
            label={`${t("layer")} H`}
            value={high}
            min={0.05}
            max={1}
            step={0.01}
            display={`${Math.round(high * 100)}%`}
            onChange={setHigh}
            thumb="amber"
          />
          <ControlSlider
            label={`${t("layer")} M`}
            value={mid}
            min={0.05}
            max={1}
            step={0.01}
            display={`${Math.round(mid * 100)}%`}
            onChange={setMid}
            thumb="teal"
          />
          <ControlSlider
            label={`${t("layer")} L`}
            value={low}
            min={0.05}
            max={1}
            step={0.01}
            display={`${Math.round(low * 100)}%`}
            onChange={setLow}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
