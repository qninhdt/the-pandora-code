"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlTabs } from "./shared/control-tabs";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Time-givers, ranked by how loudly they speak to a clock. Light dominates on
// Earth; temperature and feeding work more weakly; an unreliable cue barely counts.
type Cue = "light" | "temperature" | "feeding";

const STRENGTH: Record<Cue, number> = { light: 1, temperature: 0.45, feeding: 0.3 };
const TONE: Record<Cue, string> = {
  light: "var(--amber)",
  temperature: "var(--cyan)",
  feeding: "var(--teal)",
};

export default function Zeitgeber() {
  const t = useTranslations("viz.zeitgeber");
  const [cue, setCue] = useState<Cue>("light");

  const s = STRENGTH[cue];
  const tone = TONE[cue];

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setCue("light")}
      allowFullscreen={false}
      caption={
        <span style={{ color: tone }}>
          {t(`cues.${cue}`)} — {(s * 100).toFixed(0)}%
        </span>
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 78"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* The cue arriving */}
          <circle
            cx="24"
            cy="40"
            r={4 + s * 5}
            fill={tone}
            opacity={0.9}
            style={{ filter: `drop-shadow(0 0 ${3 + s * 9}px ${tone})` }}
          />
          {/* Signal reaching the clock, thickness tracks cue strength */}
          <line
            x1="32"
            y1="40"
            x2="66"
            y2="40"
            stroke={tone}
            strokeWidth={0.4 + s * 2}
            opacity={0.6 + s * 0.4}
          />
          {/* The clock face, nudged into register by a strong cue */}
          <circle
            cx="76"
            cy="40"
            r="13"
            fill="var(--void)"
            stroke="var(--border-strong)"
            strokeWidth="0.6"
          />
          <line
            x1="76"
            y1="40"
            x2={76 + Math.sin((1 - s) * 1.9) * 9}
            y2={40 - Math.cos((1 - s) * 1.9) * 9}
            stroke={tone}
            strokeWidth="1.1"
            style={{ filter: `drop-shadow(0 0 3px ${tone})` }}
          />
          <line
            x1="76"
            y1="40"
            x2="76"
            y2="29"
            stroke="var(--border)"
            strokeWidth="0.4"
            strokeDasharray="1.5 1.5"
          />
          <text
            x="50"
            y="70"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
          >
            {t("axis")}
          </text>
        </svg>
        <div className="absolute right-3 top-14">
          <Readout
            label={t("strength")}
            value={`${(s * 100).toFixed(0)}%`}
            accent={cue === "light" ? "amber" : cue === "temperature" ? "cyan" : "teal"}
          />
        </div>
        <div className="absolute inset-x-3 bottom-10">
          <ControlTabs
            options={[
              { value: "light", label: t("cues.light") },
              { value: "temperature", label: t("cues.temperature") },
              { value: "feeding", label: t("cues.feeding") },
            ]}
            value={cue}
            onChange={setCue}
            ariaLabel={t("title")}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
