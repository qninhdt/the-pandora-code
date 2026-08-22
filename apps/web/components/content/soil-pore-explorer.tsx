"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Moisture = "dry" | "moist" | "saturated";

const STATES: Record<Moisture, { water: number; oxygen: number; microbes: number; tone: string }> =
  {
    dry: { water: 18, oxygen: 92, microbes: 4, tone: "var(--amber)" },
    moist: { water: 58, oxygen: 64, microbes: 11, tone: "var(--teal)" },
    saturated: { water: 94, oxygen: 12, microbes: 8, tone: "var(--cyan)" },
  };

const MICROBE_POINTS = [
  [84, 112],
  [109, 92],
  [132, 123],
  [158, 84],
  [187, 109],
  [216, 77],
  [238, 121],
  [272, 95],
  [299, 127],
  [329, 83],
  [354, 114],
];

interface SoilPoreExplorerProps {
  caption?: string;
  className?: string;
}

// Moisture changes a pore twice: it reconnects microbial habitats, then—once
// the pore floods—cuts oxygen diffusion. The best decomposition conditions sit
// between isolation and anoxia rather than at either extreme.
export function SoilPoreExplorer({ caption, className }: SoilPoreExplorerProps) {
  const t = useTranslations("viz.soilPoreExplorer");
  const uid = useId();
  const [moisture, setMoisture] = useState<Moisture>("moist");
  const state = STATES[moisture];

  const options: { value: Moisture; label: string; tone: string }[] = [
    { value: "dry", label: t("state.dry"), tone: "var(--amber)" },
    { value: "moist", label: t("state.moist"), tone: "var(--teal)" },
    { value: "saturated", label: t("state.saturated"), tone: "var(--cyan)" },
  ];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${moisture}`)}
      caption={caption}
      tone="teal"
      className={className}
      controls={
        <SegmentedToggle
          options={options}
          value={moisture}
          onChange={setMoisture}
          ariaLabel={t("controlLabel")}
        />
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg
          viewBox="0 0 430 210"
          className="w-full md:w-3/5"
          role="img"
          aria-label={t(`aria.${moisture}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />
          <rect x="8" y="8" width="414" height="194" rx="26" fill="var(--depth)" />

          {/* Mineral grains define the pore; the dark channel between them is habitat. */}
          <path
            d="M25 31 C73 3 126 24 145 55 C161 81 132 107 95 105 C62 104 29 83 25 31Z"
            fill="var(--stone)"
            opacity="0.46"
          />
          <path
            d="M272 24 C326 4 396 28 407 69 C414 98 375 116 329 105 C289 96 254 60 272 24Z"
            fill="var(--stone)"
            opacity="0.38"
          />
          <path
            d="M18 154 C53 115 118 116 156 143 C181 161 162 199 117 202 L37 202 C16 188 8 174 18 154Z"
            fill="var(--stone)"
            opacity="0.42"
          />
          <path
            d="M252 154 C293 120 370 122 416 158 L422 202 L263 202 C238 191 232 172 252 154Z"
            fill="var(--stone)"
            opacity="0.44"
          />

          {/* A water film thickens until it fills the pore and excludes oxygen. */}
          <path
            d="M50 132 C104 105 151 132 205 104 C258 77 315 111 382 87 L382 176 C316 151 270 178 205 154 C145 132 101 166 50 147Z"
            fill="var(--cyan)"
            opacity={0.08 + state.water / 180}
            filter={moisture === "moist" ? glowUrl(uid, "bloom") : undefined}
          />
          {moisture === "saturated" ? (
            <path
              d="M38 65 C109 39 159 73 215 54 C276 34 340 54 394 73 L394 177 C325 157 271 179 207 156 C141 133 90 166 38 145Z"
              fill="var(--cyan)"
              opacity="0.36"
            />
          ) : null}

          {MICROBE_POINTS.slice(0, state.microbes).map(([x, y], index) => (
            <g key={`${x}-${y}`} opacity={moisture === "dry" ? 0.5 : 0.95}>
              <ellipse
                cx={x}
                cy={y}
                rx={index % 2 === 0 ? 7 : 4}
                ry={index % 2 === 0 ? 3.5 : 6}
                fill={index % 3 === 0 ? "var(--magenta)" : "var(--teal)"}
                transform={`rotate(${index * 23} ${x} ${y})`}
              />
              {index % 2 === 0 ? (
                <path
                  d={`M${x + 5} ${y} q10 -7 17 1`}
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth="1.2"
                  opacity="0.7"
                />
              ) : null}
            </g>
          ))}

          <g opacity={state.oxygen / 100}>
            {[72, 124, 181, 238, 296, 352].map((x) => (
              <g key={x}>
                <circle cx={x} cy="48" r="3" fill="var(--mist)" opacity="0.8" />
                <path
                  d={`M${x} 54 v28`}
                  stroke="var(--mist)"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                  opacity="0.55"
                />
              </g>
            ))}
          </g>

          <VizText x={58} y={188} size="small" tone="var(--stone)">
            {t("grain")}
          </VizText>
          <VizText x={184} y={147} size="small" tone="var(--cyan)">
            {t("waterFilm")}
          </VizText>
          <VizText x={318} y={48} size="small" tone="var(--mist)">
            {t("oxygen")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 md:w-2/5">
          <VizReadout label={t("readout.water")} value={`${state.water}%`} tone={state.tone} />
          <VizReadout
            label={t("readout.oxygen")}
            value={t(`oxygenLevel.${moisture}`)}
            tone={moisture === "saturated" ? "var(--magenta)" : "var(--cyan)"}
          />
          <VizReadout
            label={t("readout.connectivity")}
            value={t(`connectivity.${moisture}`)}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.turnover")}
            value={t(`turnover.${moisture}`)}
            note={t(`verdict.${moisture}`)}
            tone={state.tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
