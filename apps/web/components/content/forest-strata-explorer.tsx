"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

interface ForestStrataExplorerProps {
  caption?: string;
  className?: string;
}

// A forest is not one habitat but a stack of them, sorted by height. What makes
// each stratum a different place to live is the steep vertical gradient in
// light: the canopy intercepts sunlight first and each layer below lives on the
// leftovers. Light falls off through foliage by Beer-Lambert extinction,
//   I(z) = I0 * exp(-k * LAI(z))
// where LAI accumulates as you descend through leafy layers. By the floor of a
// closed forest only ~1-2% of canopy-top light survives. We model cumulative
// leaf area down the profile and plot the surviving light as a curve beside the
// four strata; clicking a stratum reads its light budget, microclimate, and the
// Pandoran tenant that lives at that height.
const K = 0.55; // canopy extinction coefficient (typical broadleaf ~0.4-0.7)

interface Stratum {
  // fraction of total height (0 = floor, 1 = emergent top)
  top: number; // upper edge of the band
  bottom: number;
  lai: number; // leaf-area added crossing THIS band from above
  en: { zone: string; climate: string; pandora: string };
  vi: { zone: string; climate: string; pandora: string };
}

// Bands ordered top -> bottom. LAI accumulates downward, so light at the bottom
// of each band = exp(-K * sum(lai above and including a share of this band)).
const STRATA: Stratum[] = [
  {
    top: 1.0,
    bottom: 0.78,
    lai: 0.4,
    en: { zone: "Emergent crowns", climate: "Full sun, fierce wind, wide temperature swings.", pandora: "Mountain banshee (ikran) — roosts and launches from the top." },
    vi: { zone: "Tán vượt tầng", climate: "Nắng trọn vẹn, gió dữ, nhiệt độ dao động mạnh.", pandora: "Ikran (mountain banshee) — đậu và lao mình từ trên đỉnh." },
  },
  {
    top: 0.78,
    bottom: 0.45,
    lai: 3.6,
    en: { zone: "Canopy", climate: "Bright but sheltered; the dense roof that takes the light first.", pandora: "Prolemuris and arboreal foragers moving crown to crown." },
    vi: { zone: "Tầng tán", climate: "Sáng nhưng kín gió; mái lá dày hứng ánh sáng đầu tiên.", pandora: "Prolemuris và các loài kiếm ăn trên cây, chuyền từ tán này sang tán khác." },
  },
  {
    top: 0.45,
    bottom: 0.18,
    lai: 1.8,
    en: { zone: "Understory", climate: "Shaded, still, humid; saplings strain for the leftovers.", pandora: "The Na'vi pathways and mid-height forest life." },
    vi: { zone: "Tầng dưới tán", climate: "Râm mát, lặng gió, ẩm; cây non vươn mình giành phần ánh sáng thừa.", pandora: "Lối đi của người Na'vi và sự sống ở tầm trung của khu rừng." },
  },
  {
    top: 0.18,
    bottom: 0.0,
    lai: 0.6,
    en: { zone: "Forest floor", climate: "Dim and damp — as little as 1–2% of the light up top.", pandora: "Hexapede browsing; viperwolf and thanator hunting the gloom." },
    vi: { zone: "Nền rừng", climate: "Tối và ẩm — chỉ còn 1–2% lượng sáng trên đỉnh.", pandora: "Hexapede gặm lá; viperwolf và thanator săn mồi trong bóng tối." },
  },
];

// cumulative LAI from the top down to a given band index (inclusive).
function laiAbove(i: number): number {
  let s = 0;
  for (let j = 0; j <= i; j++) s += STRATA[j].lai;
  return s;
}
// surviving light fraction (%) at the BOTTOM of band i.
function lightAt(i: number): number {
  return Math.exp(-K * laiAbove(i)) * 100;
}

const W = 300;
const H = 240;
const COL_LEFT = 16; // forest column left edge
const COL_W = 124;
const COL_X = COL_LEFT + COL_W; // right edge of the column (= 140)
const PAD_T = 12;
const PAD_B = 22;

export function ForestStrataExplorer({ caption, className }: ForestStrataExplorerProps) {
  const uid = useId();
  const t = useTranslations("viz.forestStrata");
  const locale = useLocale() as "vi" | "en";
  const [sel, setSel] = useState<number | null>(null);
  const active = sel !== null ? STRATA[sel] : null;

  const yFor = (frac: number) => PAD_T + (1 - frac) * (H - PAD_T - PAD_B);
  // light curve: sample top->floor, x mapped from light% into a side gauge.
  const gaugeX0 = COL_X + 20;
  const gaugeW = W - gaugeX0 - 10;
  const lightX = (pct: number) => gaugeX0 + (pct / 100) * gaugeW;

  // Build a light-fall polyline: 100% at canopy top, dropping at each band base.
  const pts: string[] = [`${lightX(100).toFixed(1)},${yFor(1).toFixed(1)}`];
  STRATA.forEach((s, i) => {
    pts.push(`${lightX(lightAt(i)).toFixed(1)},${yFor(s.bottom).toFixed(1)}`);
  });
  const lightPath = `M ${pts.join(" L ")}`;

  return (
    <VizFigure title={t("title")} hint={t("hint")} caption={caption} className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full sm:w-3/5" role="img" aria-label={t("title")}>
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber"]} />

          {/* trunk for context */}
          <line x1={COL_X - COL_W / 2} y1={PAD_T} x2={COL_X - COL_W / 2} y2={H - PAD_B} stroke="var(--border-strong)" strokeWidth={6} strokeLinecap="round" strokeOpacity={0.4} />

          {STRATA.map((s, i) => {
            const isOn = sel === i;
            const y = yFor(s.top);
            const h = yFor(s.bottom) - y;
            // band brightness tracks the light reaching its midpoint.
            const lightMid = (i === 0 ? 100 : lightAt(i - 1) + lightAt(i)) / (i === 0 ? 1 : 2);
            const a = 0.05 + (lightMid / 100) * 0.34;
            return (
              <g
                key={s.en.zone}
                onClick={() => setSel(isOn ? null : i)}
                style={{ cursor: "pointer" }}
                // biome-ignore lint/a11y/useSemanticElements: SVG <g> can't be a native button; role=button is the right ARIA mapping
                role="button"
                aria-pressed={isOn}
                aria-label={s[locale].zone}
              >
                <rect
                  x={COL_X - COL_W}
                  y={y}
                  width={COL_W}
                  height={h - 2}
                  rx={6}
                  fill={isOn ? "color-mix(in oklab, var(--teal) 22%, transparent)" : `color-mix(in oklab, var(--cyan) ${Math.round(a * 100)}%, transparent)`}
                  stroke={isOn ? "var(--teal)" : "var(--border)"}
                  strokeWidth={isOn ? 2 : 1}
                  style={{ transition: "all 0.2s ease" }}
                  filter={isOn ? glowUrl(uid, "bloom") : undefined}
                />
                <VizText x={COL_X - COL_W + 8} y={y + 14} size="small" tone={isOn ? "teal" : "subtle"} weight={700}>
                  {s[locale].zone}
                </VizText>
              </g>
            );
          })}

          {/* light gauge axis + curve */}
          <line x1={gaugeX0} y1={PAD_T} x2={gaugeX0} y2={H - PAD_B} stroke="var(--border)" strokeWidth={1} strokeOpacity={0.5} />
          <path d={lightPath} fill="none" stroke="var(--amber)" strokeWidth={2.5} filter={glowUrl(uid, "bloom")} />
          {/* light node at each band base */}
          {STRATA.map((s, i) => (
            <g key={`l-${s.en.zone}`}>
              <circle cx={lightX(lightAt(i))} cy={yFor(s.bottom)} r={sel === i ? 4 : 2.5} fill="var(--amber)" filter={sel === i ? glowUrl(uid, "bloom-strong") : undefined} />
            </g>
          ))}
          <VizText x={gaugeX0 + 2} y={PAD_T + 8} size="micro" tone="amber" numeric>100%</VizText>
          <VizTick x={gaugeX0 + gaugeW / 2} y={H - PAD_B + 12} anchor="middle">{t("lightAxis")}</VizTick>
        </svg>

        <div className="flex flex-col justify-center gap-2 sm:w-2/5">
          {active ? (
            <>
              <VizReadout
                label={t("lightLabel")}
                value={`${lightAt(sel as number).toFixed(lightAt(sel as number) < 10 ? 1 : 0)}%`}
                note={t("lightNote")}
                tone="var(--amber)"
                tinted
              />
              <div
                className="rounded-lg border px-3 py-3"
                style={{
                  borderColor: "color-mix(in oklab, var(--teal) 45%, transparent)",
                  background: "color-mix(in oklab, var(--teal) 10%, var(--void))",
                }}
              >
                <p className="font-sans text-xs uppercase tracking-wider text-subtle">{t("climateLabel")}</p>
                <p className="mt-1 font-sans text-sm text-muted">{active[locale].climate}</p>
              </div>
              <VizReadout label={t("tenantLabel")} value={active[locale].pandora} tone="var(--teal)" tinted />
            </>
          ) : (
            <p className="font-sans text-sm text-subtle">{t("prompt")}</p>
          )}
        </div>
      </div>
    </VizFigure>
  );
}
