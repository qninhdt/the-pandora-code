"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

interface NichePartitionExplorerProps {
  caption?: string;
  className?: string;
}

// Scientific data stays in code: three vertical layers of a forest, each a
// distinct niche held by a distinct herbivore — the relief valve competitive
// exclusion forces open. Click a band to see the Pandoran tenant, its Earth
// analogue, and how it feeds.
interface Band {
  y: number; // top of band in viewBox units
  h: number;
  vi: { zone: string; pandora: string; earth: string; how: string };
  en: { zone: string; pandora: string; earth: string; how: string };
}

const BANDS: Band[] = [
  {
    y: 8,
    h: 56,
    en: {
      zone: "High foliage",
      pandora: "Hammerhead titanothere",
      earth: "Giraffe",
      how: "Reaches the high leaves no one else can crop.",
    },
    vi: {
      zone: "Tán lá cao",
      pandora: "Hammerhead titanothere",
      earth: "Hươu cao cổ",
      how: "Vươn tới lá cao mà không loài nào khác chạm được.",
    },
  },
  {
    y: 64,
    h: 56,
    en: {
      zone: "Mid-canopy",
      pandora: "Direhorse herd",
      earth: "Browsing antelope",
      how: "Strips foliage at mid-height, moving in herds.",
    },
    vi: {
      zone: "Tầng giữa",
      pandora: "Bầy direhorse",
      earth: "Linh dương ăn lá",
      how: "Tỉa lá ở tầm trung, di chuyển theo bầy.",
    },
  },
  {
    y: 120,
    h: 54,
    en: {
      zone: "Ground shoots",
      pandora: "Hexapede",
      earth: "Gazelle",
      how: "Crops tender understorey shoots near the floor.",
    },
    vi: {
      zone: "Chồi mặt đất",
      pandora: "Hexapede",
      earth: "Linh dương gazelle",
      how: "Gặm chồi non dưới tầng thấp gần mặt đất.",
    },
  },
];

const W = 200;
const H = 182;

export function NichePartitionExplorer({ caption, className }: NichePartitionExplorerProps) {
  const uid = useId();
  const t = useTranslations("viz.nichePartition");
  const locale = useLocale() as "vi" | "en";
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? BANDS[selected][locale] : null;

  return (
    <VizFigure title={t("title")} caption={caption} className={className} hint={t("hint")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-1/2"
          role="img"
          aria-label={t("title")}
        >
          <GlowDefs idBase={uid} />
          {/* a couple of trunks for context */}
          {[40, 150].map((x) => (
            <line
              key={x}
              x1={x}
              y1={4}
              x2={x}
              y2={H - 4}
              stroke="var(--border-strong)"
              strokeWidth={6}
              strokeLinecap="round"
              strokeOpacity={0.5}
            />
          ))}
          {BANDS.map((b, i) => {
            const isOn = selected === i;
            return (
              <g
                key={b.en.zone}
                onClick={() => setSelected(isOn ? null : i)}
                style={{ cursor: "pointer" }}
                // biome-ignore lint/a11y/useSemanticElements: an SVG <g> cannot be a native <button>; button role is the correct ARIA mapping for a clickable band
                role="button"
                aria-pressed={isOn}
                aria-label={b[locale].zone}
              >
                <rect
                  x={6}
                  y={b.y}
                  width={W - 12}
                  height={b.h - 6}
                  rx={8}
                  fill={
                    isOn
                      ? "color-mix(in oklab, var(--teal) 16%, transparent)"
                      : "color-mix(in oklab, var(--cyan) 5%, transparent)"
                  }
                  stroke={isOn ? "var(--teal)" : "var(--border)"}
                  strokeWidth={isOn ? 2 : 1}
                  style={{ transition: "all 0.2s ease" }}
                  filter={isOn ? glowUrl(uid, "bloom") : undefined}
                />
                {/* inset top highlight gives the selected stratum depth */}
                {isOn ? (
                  <rect
                    x={8}
                    y={b.y + 2}
                    width={W - 16}
                    height={(b.h - 6) / 2}
                    rx={6}
                    fill="color-mix(in oklab, var(--teal) 14%, transparent)"
                    pointerEvents="none"
                  />
                ) : null}
                <VizText
                  x={14}
                  y={b.y + 17}
                  size="small"
                  tone={isOn ? "teal" : "subtle"}
                  weight={700}
                >
                  {b[locale].zone}
                </VizText>
                {/* a small feeding marker at the band's height */}
                <circle
                  cx={W - 24}
                  cy={b.y + (b.h - 6) / 2}
                  r={6}
                  fill={isOn ? "var(--teal)" : "var(--subtle)"}
                  fillOpacity={isOn ? 0.95 : 0.5}
                  filter={isOn ? glowUrl(uid, "bloom") : undefined}
                />
              </g>
            );
          })}
        </svg>

        <div className="flex flex-col justify-center gap-2 sm:w-1/2">
          {active ? (
            <>
              <div
                className="rounded-lg border px-3 py-3"
                style={{
                  borderColor: "color-mix(in oklab, var(--teal) 45%, transparent)",
                  background: "color-mix(in oklab, var(--teal) 10%, var(--void))",
                  boxShadow:
                    "inset 0 1px 0 0 color-mix(in oklab, var(--teal) 25%, transparent), 0 4px 18px -10px color-mix(in oklab, var(--teal) 70%, transparent)",
                }}
              >
                <p className="font-sans text-xs uppercase tracking-wider text-subtle">
                  {t("pandoraLabel")}
                </p>
                <p className="font-display text-sm font-700 text-foreground">{active.pandora}</p>
                <p className="mt-2 font-sans text-xs text-muted">{active.how}</p>
              </div>
              <VizReadout label={t("earthLabel")} value={active.earth} tone="var(--teal)" tinted />
            </>
          ) : (
            <p className="font-sans text-sm text-subtle">{t("prompt")}</p>
          )}
        </div>
      </div>
    </VizFigure>
  );
}
