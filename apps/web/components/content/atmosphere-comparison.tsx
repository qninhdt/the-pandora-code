"use client";

import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useTranslations } from "next-intl";

interface AirSpec {
  /** Display name for this atmosphere, e.g. "Earth — sea level". */
  label: string;
  /** Total surface pressure in kilopascals. */
  totalKpa: number;
  /** Oxygen fraction, percent of the mixture. */
  o2Pct: number;
  /** Carbon dioxide fraction, percent of the mixture. */
  co2Pct: number;
}

interface AtmosphereComparisonProps {
  earth: AirSpec;
  pandora: AirSpec;
  caption?: string;
  className?: string;
}

// Format a kilopascal value: two decimals when below 1 (trace gases), one
// otherwise, so a 0.04 kPa trace and a 20.7 kPa reading both read cleanly.
function kpa(value: number): string {
  return value < 1 ? value.toFixed(2) : value.toFixed(1);
}

// Side-by-side reading of two atmospheres that makes the partial-pressure point
// visible: identical-looking oxygen percentages yield near-identical oxygen
// pressures, while the carbon-dioxide pressures diverge wildly. Presentational
// (no client state); styled entirely from design tokens.
export function AtmosphereComparison({
  earth,
  pandora,
  caption,
  className,
}: AtmosphereComparisonProps) {
  const t = useTranslations("viz.atmosphere");
  const airs = [earth, pandora];

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption ?? t("takeaway")}
      tone="teal"
      className={className}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {airs.map((air, i) => {
          const other = Math.max(0, 100 - air.o2Pct - air.co2Pct);
          const pO2 = (air.o2Pct / 100) * air.totalKpa;
          const pCO2 = (air.co2Pct / 100) * air.totalKpa;
          const segments = [
            { key: "o2", label: t("o2"), pct: air.o2Pct, tone: "--teal" },
            { key: "co2", label: t("co2"), pct: air.co2Pct, tone: "--amber" },
            { key: "other", label: t("other"), pct: other, tone: "--cyan" },
          ];

          return (
            <div key={i} className="rounded-xl border border-border bg-void/30 p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display text-sm font-700 text-foreground">{air.label}</p>
                <p className="font-sans text-xs uppercase tracking-wider text-subtle">
                  {t("total")}{" "}
                  <span className="tabular-nums text-muted">{kpa(air.totalKpa)} kPa</span>
                </p>
              </div>

              {/* Stacked composition bar — a glassy capsule; each segment carries
                  a vertical gradient + top inset highlight so the bar reads as a
                  lit object rather than a flat swatch strip */}
              <div
                className="mt-3 flex h-5 w-full overflow-hidden rounded-full border"
                role="img"
                aria-label={`${t("composition")}: ${t("o2")} ${air.o2Pct}%, ${t("co2")} ${air.co2Pct}%, ${t("other")} ${other.toFixed(1)}%`}
                style={{
                  borderColor: "color-mix(in oklab, var(--foreground) 12%, var(--border))",
                  boxShadow: "inset 0 1px 1px color-mix(in oklab, var(--void) 60%, transparent)",
                }}
              >
                {segments.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      width: `${Math.max(s.pct, s.pct > 0 ? 0.8 : 0)}%`,
                      background: `linear-gradient(to bottom, color-mix(in oklab, var(${s.tone}) 90%, var(--foreground)) 0%, var(${s.tone}) 42%, color-mix(in oklab, var(${s.tone}) 78%, var(--void)) 100%)`,
                      boxShadow:
                        "inset 0 1px 0 color-mix(in oklab, var(--foreground) 28%, transparent)",
                    }}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {segments.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5 font-sans text-xs">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        background: `var(${s.tone})`,
                        boxShadow: `inset 0 0.5px 0 color-mix(in oklab, var(--foreground) 45%, transparent), 0 0 6px -1px color-mix(in oklab, var(${s.tone}) 80%, transparent)`,
                      }}
                    />
                    <span className="text-muted">{s.label}</span>
                    <span className="tabular-nums text-subtle">{s.pct}%</span>
                  </span>
                ))}
              </div>

              {/* Partial pressures — the point of the whole figure */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <VizReadout label={t("po2")} value={`${kpa(pO2)} kPa`} tone="var(--teal)" tinted />
                <VizReadout
                  label={t("pco2")}
                  value={`${kpa(pCO2)} kPa`}
                  tone="var(--amber)"
                  tinted
                />
              </div>
            </div>
          );
        })}
      </div>
    </VizFigure>
  );
}
