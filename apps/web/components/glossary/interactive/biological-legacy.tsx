"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// What a catastrophe leaves behind is not debris — it is the template. Tidy the
// site and recovery starts from far less than the disturbance left it.
type Mode = "legacies" | "salvaged";

export default function BiologicalLegacy() {
  const t = useTranslations("viz.biological-legacy");
  const [mode, setMode] = useState<Mode>("legacies");

  const kept = mode === "legacies";
  const tone = kept ? "var(--teal)" : "var(--magenta)";
  const rate = kept ? 100 : 22;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMode("legacies")}
      allowFullscreen={false}
      caption={<span style={{ color: tone }}>{t(`verdict.${mode}`)}</span>}
    >
      <div className="absolute inset-0">
        <svg viewBox="0 0 100 78" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={t("title")}>
          {/* ash bed */}
          <rect x="8" y="46" width="84" height="10" fill="var(--muted)" opacity={0.18} />
          <line x1="8" y1="46" x2="92" y2="46" stroke="var(--border-strong)" strokeWidth="0.5" opacity={0.6} />

          {kept && (
            <g>
              {/* standing snag */}
              <line x1="24" y1="46" x2="24" y2="26" stroke="var(--muted)" strokeWidth="2.2" opacity={0.65} />
              {/* downed log */}
              <rect x="40" y="42" width="34" height="3.6" rx="1.6" fill="var(--muted)" opacity={0.6} />
              {/* buried root mound */}
              <path d="M78 46 Q84 50 88 46" stroke="var(--muted)" strokeWidth="1" fill="none" opacity={0.6} />
              {/* seedlings rooting along the log — the colonnade begins */}
              {[44, 51, 58, 65, 71].map((x, i) => (
                <line key={i} x1={x} y1="42" x2={x} y2={34 - (i % 2) * 3} stroke={tone} strokeWidth="0.9" strokeLinecap="round" opacity={0.85}
                  style={{ filter: `drop-shadow(0 0 2px ${tone})` }} />
              ))}
              {/* dead-wood community */}
              {[47, 56, 68].map((x, i) => (
                <circle key={i} cx={x} cy={41} r="1.1" fill="var(--amber)" opacity={0.85} />
              ))}
            </g>
          )}

          {!kept && (
            <g>
              {/* everything hauled away: bare ground, one struggling seedling */}
              <line x1="50" y1="46" x2="50" y2="41" stroke={tone} strokeWidth="0.8" strokeLinecap="round" opacity={0.7} />
              {[20, 34, 66, 80].map((x, i) => (
                <line key={i} x1={x - 3} y1="49" x2={x + 3} y2="49" stroke="var(--muted)" strokeWidth="0.4" opacity={0.3} />
              ))}
            </g>
          )}

          <text x="50" y="70" textAnchor="middle" style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}>{t("axis")}</text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout label={t("recovery")} value={`${rate}%`} accent={kept ? "teal" : "magenta"} />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "legacies", label: t("modes.legacies") },
              { value: "salvaged", label: t("modes.salvaged") },
            ]}
            value={mode}
            onChange={setMode}
            ariaLabel={t("title")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
