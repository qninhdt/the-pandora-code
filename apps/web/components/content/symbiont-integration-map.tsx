"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Where Spider sits among Earth's endosymbioses. A scatter on two axes the
// chapter names: acquisition mode (inherited from a parent, left → acquired
// fresh from the environment, right) and integration depth (a removable tenant,
// bottom → a permanent, obligate part of the body, top). Six real partnerships
// plus the Pandoran mycelium; selecting one reveals what it teaches. Spider is
// the outlier — acquired horizontally like the squid's partner, yet integrated
// as deeply and as fast as nothing on the plate. Static data, deterministic SSR.

interface Case {
  key: string;
  // 0 = inherited (vertical), 1 = acquired fresh (horizontal)
  acquisition: number;
  // 0 = removable tenant, 1 = permanent organelle / obligate body part
  depth: number;
  pandoran?: boolean;
}

// Scientific-data array may live in code (viz contract); labels come from i18n.
const CASES: Case[] = [
  { key: "mitochondrion", acquisition: 0.08, depth: 0.98 },
  { key: "buchnera", acquisition: 0.12, depth: 0.82 },
  { key: "paulinella", acquisition: 0.2, depth: 0.9 },
  { key: "symbiodinium", acquisition: 0.62, depth: 0.4 },
  { key: "vibrio", acquisition: 0.9, depth: 0.35 },
  { key: "oophila", acquisition: 0.72, depth: 0.55 },
  { key: "spider", acquisition: 0.88, depth: 0.92, pandoran: true },
];

const W = 360;
const H = 300;
const PAD = 40;

const px = (a: number) => PAD + a * (W - PAD * 2);
const py = (d: number) => H - PAD - d * (H - PAD * 2);

export function SymbiontIntegrationMap({ className }: { className?: string }) {
  const t = useTranslations("viz.symbiontIntegrationMap");
  const uid = useId();
  const [sel, setSel] = useState("spider");
  const active = CASES.find((c) => c.key === sel) ?? CASES[0];
  const tone = active.pandoran ? "var(--magenta)" : "var(--cyan)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={active.pandoran ? "magenta" : "cyan"}
      hint={t("hint")}
      className={className}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta"]} />
          <rect
            x={PAD}
            y={PAD}
            width={W - PAD * 2}
            height={H - PAD * 2}
            fill={glowUrl(uid, "grid")}
          />

          {/* axes */}
          <line
            x1={PAD}
            y1={H - PAD}
            x2={W - PAD}
            y2={H - PAD}
            stroke="var(--border-strong)"
            strokeWidth={0.8}
          />
          <line
            x1={PAD}
            y1={PAD}
            x2={PAD}
            y2={H - PAD}
            stroke="var(--border-strong)"
            strokeWidth={0.8}
          />

          <VizText x={PAD} y={H - 14} size="micro" tone="subtle">
            {t("axisInherited")}
          </VizText>
          <VizText x={W - PAD} y={H - 14} size="micro" tone="subtle" anchor="end">
            {t("axisAcquired")}
          </VizText>
          <VizText
            x={14}
            y={H - PAD}
            size="micro"
            tone="subtle"
            transform={`rotate(-90 14 ${H - PAD})`}
          >
            {t("axisTenant")}
          </VizText>
          <VizText
            x={14}
            y={PAD + 4}
            size="micro"
            tone="subtle"
            transform={`rotate(-90 14 ${PAD + 4})`}
          >
            {t("axisPermanent")}
          </VizText>

          {CASES.map((c) => {
            const on = c.key === sel;
            const hue = c.pandoran ? "var(--magenta)" : "var(--cyan)";
            return (
              <g key={c.key} onClick={() => setSel(c.key)} style={{ cursor: "pointer" }}>
                <circle
                  cx={px(c.acquisition)}
                  cy={py(c.depth)}
                  r={on ? 9 : 6}
                  fill={hue}
                  opacity={on ? 1 : 0.55}
                  stroke={on ? "var(--foreground)" : "var(--border-strong)"}
                  strokeWidth={on ? 1.2 : 0.6}
                  filter={on ? glowUrl(uid, "bloom") : undefined}
                />
                <VizText
                  x={px(c.acquisition)}
                  y={py(c.depth) - (on ? 13 : 10)}
                  size="micro"
                  tone={c.pandoran ? "magenta" : on ? "cyan" : "subtle"}
                  anchor="middle"
                >
                  {t(`case.${c.key}.short`)}
                </VizText>
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("selectedLabel")}
            value={t(`case.${active.key}.name`)}
            tone={tone}
            tinted
          />
          <p className="rounded-lg border border-border bg-void/30 px-3 py-2 font-serif text-sm leading-relaxed text-muted">
            {t(`case.${active.key}.note`)}
          </p>
          <p className="font-sans text-[0.7rem] uppercase tracking-wider text-subtle">
            {active.pandoran ? t("spiderNote") : t("earthNote")}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
