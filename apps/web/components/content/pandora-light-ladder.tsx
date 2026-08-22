"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type World = "earth" | "pandora";

interface PandoraLightLadderProps {
  caption?: string;
  className?: string;
}

// The lux ladder, log-scaled, with the clock-relevant thresholds marked. Earth's
// night runs eight orders of magnitude below its day — the crispest signal in
// nature. Pandora's night is floored by planetshine and, for part of the year, by
// a companion star, while its celebrated ground glow sits far below the level any
// clock can read. Illuminance values are representative Earth photometry; the
// Pandoran entries are approximate and flagged as such in the caption.
interface Rung {
  key: string;
  lux: number;
  world: World | "both";
  tone: "cyan" | "teal" | "amber" | "magenta";
}

const RUNGS: Rung[] = [
  { key: "sunlight", lux: 100000, world: "both", tone: "amber" },
  { key: "overcast", lux: 1000, world: "both", tone: "amber" },
  { key: "indoor", lux: 200, world: "both", tone: "cyan" },
  { key: "twilight", lux: 10, world: "both", tone: "cyan" },
  { key: "companionStar", lux: 30, world: "pandora", tone: "magenta" },
  { key: "planetshine", lux: 1.5, world: "pandora", tone: "magenta" },
  { key: "fullMoon", lux: 0.25, world: "earth", tone: "teal" },
  { key: "starlight", lux: 0.001, world: "earth", tone: "teal" },
  { key: "groundGlow", lux: 0.0002, world: "pandora", tone: "teal" },
];

// Thresholds that decide whether a light level can act on a clock at all.
const THRESHOLDS: { key: string; lux: number }[] = [
  { key: "melatonin", lux: 10 },
  { key: "sublux", lux: 0.1 },
];

const LUX_MIN = 0.0001;
const LUX_MAX = 200000;

const W = 440;
const H = 232;
const PAD_L = 20;
const PAD_R = 20;
const AXIS_Y = 168;
const PLOT_W = W - PAD_L - PAD_R;

// Log position along the ladder.
function xForLux(lux: number): number {
  const lo = Math.log10(LUX_MIN);
  const hi = Math.log10(LUX_MAX);
  return PAD_L + ((Math.log10(lux) - lo) / (hi - lo)) * PLOT_W;
}

function formatLux(lux: number): string {
  if (lux >= 1000) return `${(lux / 1000).toFixed(0)}k`;
  if (lux >= 1) return `${lux}`;
  return lux.toExponential(0).replace("e-", "e−");
}

export function PandoraLightLadder({ caption, className }: PandoraLightLadderProps) {
  const t = useTranslations("viz.lightLadder");
  const idBase = useId();
  const [world, setWorld] = useState<World>("pandora");

  const visible = RUNGS.filter((r) => r.world === "both" || r.world === world);
  // Stagger labels up the plot so neighbouring rungs never collide.
  const sorted = [...visible].sort((a, b) => a.lux - b.lux);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={world === "pandora" ? "teal" : "cyan"}
      caption={caption ?? t("caption")}
      hint={t("hint")}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("worldLabel")}
          value={world}
          onChange={setWorld}
          options={[
            { value: "earth", label: t("earth"), tone: "var(--cyan)" },
            { value: "pandora", label: t("pandora"), tone: "var(--teal)" },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("aria")}>
        <GlowDefs idBase={idBase} tones={["cyan", "teal", "amber", "magenta"]} />

        {/* The band a clock can actually read, above the sub-lux floor */}
        <rect
          x={xForLux(0.1)}
          y={26}
          width={xForLux(LUX_MAX) - xForLux(0.1)}
          height={AXIS_Y - 26}
          fill="var(--cyan)"
          opacity={0.06}
        />

        {/* Thresholds */}
        {THRESHOLDS.map((th) => (
          <g key={th.key}>
            <line
              x1={xForLux(th.lux)}
              y1={22}
              x2={xForLux(th.lux)}
              y2={AXIS_Y}
              stroke="var(--amber)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.7}
            />
            <VizText x={xForLux(th.lux)} y={18} size="micro" tone="amber" anchor="middle">
              {t(`thresholds.${th.key}`)}
            </VizText>
          </g>
        ))}

        {/* Rungs */}
        {sorted.map((r, i) => {
          const x = xForLux(r.lux);
          const y = AXIS_Y - 14 - (i % 5) * 26;
          return (
            <g key={r.key}>
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={AXIS_Y}
                stroke={`var(--${r.tone})`}
                strokeWidth={1}
                opacity={0.45}
              />
              <circle
                cx={x}
                cy={AXIS_Y}
                r={3.4}
                fill={`var(--${r.tone})`}
                filter={glowUrl(idBase, "bloom")}
              />
              <VizText
                x={x}
                y={y - 2}
                size="micro"
                tone={r.tone}
                anchor={x > W - 90 ? "end" : x < 70 ? "start" : "middle"}
              >
                {t(`rungs.${r.key}`)}
              </VizText>
              <VizText
                x={x}
                y={y + 7}
                size="micro"
                anchor={x > W - 90 ? "end" : x < 70 ? "start" : "middle"}
                numeric
              >
                {formatLux(r.lux)}
              </VizText>
            </g>
          );
        })}

        {/* Log axis */}
        <line
          x1={PAD_L}
          y1={AXIS_Y}
          x2={W - PAD_R}
          y2={AXIS_Y}
          stroke="var(--border)"
          strokeWidth={1}
        />
        {[0.0001, 0.01, 1, 100, 10000].map((tick) => (
          <g key={tick}>
            <line
              x1={xForLux(tick)}
              y1={AXIS_Y}
              x2={xForLux(tick)}
              y2={AXIS_Y + 5}
              stroke="var(--border)"
            />
            <VizText x={xForLux(tick)} y={AXIS_Y + 16} size="micro" anchor="middle" numeric>
              {formatLux(tick)}
            </VizText>
          </g>
        ))}
        <VizText x={W - PAD_R} y={AXIS_Y + 30} size="micro" anchor="end">
          {t("axisLabel")}
        </VizText>
        <VizText x={PAD_L} y={AXIS_Y + 30} size="micro">
          {t("darkerLabel")}
        </VizText>
      </svg>
    </VizFigure>
  );
}
