"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Soil that never touched the ground. Run the centuries and the mat thickens on
// the limb, until it has its own fauna a hundred metres up.
export default function CanopySoil() {
  const t = useTranslations("viz.canopy-soil");
  const [years, setYears] = useState(400);

  // Saturating accumulation toward ~30 cm; slow, and it starts from nothing.
  const depth = 30 * (1 - Math.exp(-years / 260));
  const fauna = depth < 4 ? 0 : depth < 12 ? 2 : depth < 22 ? 5 : 8;
  const tone = depth > 20 ? "var(--cyan)" : depth > 8 ? "var(--teal)" : "var(--muted)";

  const matH = (depth / 30) * 13;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setYears(400)}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{fauna === 0 ? t("verdictBare") : t("verdictLiving")}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 78" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* the host trunk at the left, the limb running out from it */}
          <rect x="12" y="14" width="7" height="46" fill="var(--muted)" opacity={0.35} />
          <rect x="19" y="40" width="66" height="4" fill="var(--muted)" opacity={0.5} rx="1" />

          {/* the accumulating mat, sitting on the limb */}
          <rect x="24" y={40 - matH} width="56" height={matH} fill={tone} opacity={0.55} rx="1"
            style={{ filter: matH > 6 ? `drop-shadow(0 0 4px ${tone})` : undefined }} />

          {/* the host's own roots descending into its garden */}
          {matH > 5 &&
            [30, 44, 58, 70].map((x, i) => (
              <line key={i} x1={x} y1={44} x2={x + 2} y2={44 + 6} stroke="var(--cyan)" strokeWidth="0.4" opacity={0.6} />
            ))}

          {/* the fauna that only exists once the mat is deep enough */}
          {Array.from({ length: fauna }, (_, i) => (
            <circle key={i} cx={28 + i * 6.4} cy={40 - matH * 0.5} r="1.1" fill="var(--amber)" opacity={0.85} />
          ))}

          <text x="50" y="70" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("axis")}</text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("depth")} value={depth.toFixed(1)} unit="cm" accent={depth > 20 ? "cyan" : "teal"} />
          <Readout label={t("fauna")} value={fauna} accent="amber" />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("time")}
            value={years}
            min={0}
            max={800}
            step={10}
            onChange={setYears}
            display={t("yearsValue", { n: Math.round(years) })}
            thumb="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
