"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlSlider } from "./shared/control-slider";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Continuous water column under tension; overpull → cavitation bubble.
export default function CohesionTension() {
  const t = useTranslations("viz.cohesion-tension");
  const [pull, setPull] = useState(0.45);
  const cavitated = pull > 0.78;
  const columnH = cavitated ? 28 + pull * 10 : 18 + pull * 52;
  const topY = 78 - columnH;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setPull(0.45)}
      allowFullscreen={false}
      caption={
        <span className={cavitated ? "text-magenta" : "text-cyan"}>
          {cavitated ? t("cavitation") : t("intact")}
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* trunk outline */}
          <rect x="42" y="22" width="16" height="56" fill="var(--surface)" stroke="var(--cyan)" strokeWidth="0.8" rx="1" />
          {/* leaves / crown */}
          <ellipse cx="50" cy="18" rx="18" ry="10" fill="var(--teal)" opacity={0.35 + pull * 0.35} />
          {/* soil */}
          <rect x="20" y="78" width="60" height="8" fill="var(--surface)" opacity={0.7} />
          {/* water column */}
          <rect
            x="46"
            y={topY}
            width="8"
            height={columnH}
            fill="var(--cyan)"
            opacity={cavitated ? 0.35 : 0.7}
          />
          {/* vapor escape at leaves */}
          {!cavitated &&
            [0, 1, 2].map((i) => (
              <circle
                key={i}
                cx={42 + i * 8}
                cy={14 - pull * 4}
                r={1 + pull}
                fill="var(--cyan)"
                opacity={0.25 + pull * 0.4}
              />
            ))}
          {/* cavitation bubble */}
          {cavitated && (
            <g>
              <ellipse cx="50" cy="48" rx="5" ry="7" fill="var(--void)" stroke="var(--magenta)" strokeWidth="1" />
              <text x="50" y="50" textAnchor="middle" style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--magenta)" }}>
                {t("cavitation")}
              </text>
              {/* broken segments */}
              <rect x="46" y="22" width="8" height="18" fill="var(--cyan)" opacity={0.25} />
              <rect x="46" y="58" width="8" height="20" fill="var(--cyan)" opacity={0.55} />
            </g>
          )}
          {/* tension arrows */}
          <path d={`M60 ${topY + 4} L68 ${topY + 4}`} stroke="var(--amber)" strokeWidth="0.7" />
          <path d={`M60 74 L68 74`} stroke="var(--amber)" strokeWidth="0.7" />
          <text x="70" y={topY + 5} style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--amber)" }}>
            {t("tension")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("column")}
            value={cavitated ? "—" : `${Math.round(columnH)}`}
            unit={cavitated ? undefined : "m"}
            accent={cavitated ? "magenta" : "cyan"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlSlider
            label={t("pull")}
            value={pull}
            min={0.1}
            max={1}
            step={0.01}
            display={`${Math.round(pull * 100)}%`}
            onChange={setPull}
            thumb={cavitated ? "magenta" : "cyan"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
