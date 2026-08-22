"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A hole is not built, it is waited for. Drag the tree's age and nothing happens
// for a century — then a small cavity opens, and only much later a large one.
export default function TreeHollow() {
  const t = useTranslations("viz.tree-hollow");
  const [age, setAge] = useState(350);

  const small = age >= 110;
  const large = age >= 220;
  const veryLarge = age >= 400;

  const r = !small ? 0 : veryLarge ? 8 : large ? 5.5 : 3;
  const tone = veryLarge ? "var(--cyan)" : large ? "var(--teal)" : small ? "var(--amber)" : "var(--muted)";
  const tenant = veryLarge ? "large" : large ? "medium" : small ? "small" : "none";

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setAge(350)}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{t(`verdict.${tenant}`)}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 78" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* trunk cross-section */}
          <rect x="30" y="12" width="40" height="46" rx="3" fill="var(--void)" stroke="var(--border-strong)" strokeWidth="0.6" />
          {/* growth rings hint at accumulated age */}
          {[6, 12, 17].map((inset, i) => (
            <rect key={i} x={30 + inset} y={12 + inset * 0.7} width={40 - inset * 2} height={46 - inset * 1.4} rx="2"
              fill="none" stroke="var(--border)" strokeWidth="0.25" opacity={0.5} />
          ))}

          {/* the cavity, and the softened wood around its edge */}
          {r > 0 && (
            <g>
              <circle cx="50" cy="35" r={r + 2.5} fill="var(--muted)" opacity={0.25} />
              <circle cx="50" cy="35" r={r} fill="var(--void)" stroke={tone} strokeWidth="0.7" opacity={0.95}
                style={{ filter: `drop-shadow(0 0 4px ${tone})` }} />
              {r >= 5.5 && (
                <g>
                  <circle cx={48} cy={34} r="1" fill="var(--amber)" opacity={0.9} />
                  <circle cx={52} cy={34} r="1" fill="var(--amber)" opacity={0.9} />
                </g>
              )}
            </g>
          )}

          <text x="50" y="70" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("axis")}</text>
        </svg>
        <div className="absolute right-3 top-14 flex flex-col gap-1.5">
          <Readout label={t("cavity")} value={r === 0 ? t("none") : t(`sizes.${tenant}`)} accent={veryLarge ? "cyan" : large ? "teal" : "amber"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("age")}
            value={age}
            min={0}
            max={600}
            step={10}
            onChange={setAge}
            display={t("yearsValue", { n: Math.round(age) })}
            thumb={small ? "cyan" : "magenta"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
