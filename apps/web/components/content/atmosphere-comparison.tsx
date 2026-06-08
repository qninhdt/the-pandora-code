import { cn } from "@/lib/utils";

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
  locale?: "vi" | "en";
  className?: string;
}

const STRINGS = {
  vi: {
    composition: "Thành phần",
    total: "Tổng áp suất",
    po2: "Áp suất oxy (pO₂)",
    pco2: "Áp suất CO₂ (pCO₂)",
    o2: "Oxy",
    co2: "CO₂",
    other: "Khí khác",
    takeaway: "Cùng một lực đẩy oxy — nhưng áp suất CO₂ chênh nhau một trời một vực.",
  },
  en: {
    composition: "Composition",
    total: "Total pressure",
    po2: "Oxygen pressure (pO₂)",
    pco2: "CO₂ pressure (pCO₂)",
    o2: "Oxygen",
    co2: "CO₂",
    other: "Other gases",
    takeaway: "The same oxygen push — but a world of difference in CO₂ pressure.",
  },
} as const;

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
  locale = "en",
  className,
}: AtmosphereComparisonProps) {
  const t = STRINGS[locale];
  const airs = [earth, pandora];

  return (
    <div className={cn("my-8 space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        {airs.map((air, i) => {
          const other = Math.max(0, 100 - air.o2Pct - air.co2Pct);
          const pO2 = (air.o2Pct / 100) * air.totalKpa;
          const pCO2 = (air.co2Pct / 100) * air.totalKpa;
          const segments = [
            { key: "o2", label: t.o2, pct: air.o2Pct, tone: "--teal" },
            { key: "co2", label: t.co2, pct: air.co2Pct, tone: "--amber" },
            { key: "other", label: t.other, pct: other, tone: "--cyan" },
          ];

          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm"
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-display text-sm font-700 text-foreground">{air.label}</p>
                <p className="font-sans text-[0.65rem] uppercase tracking-wider text-subtle">
                  {t.total} <span className="tabular-nums text-muted">{kpa(air.totalKpa)} kPa</span>
                </p>
              </div>

              {/* Stacked composition bar */}
              <div
                className="mt-3 flex h-4 w-full overflow-hidden rounded-full border border-border"
                role="img"
                aria-label={`${t.composition}: ${t.o2} ${air.o2Pct}%, ${t.co2} ${air.co2Pct}%, ${t.other} ${other.toFixed(1)}%`}
              >
                {segments.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      width: `${Math.max(s.pct, s.pct > 0 ? 0.8 : 0)}%`,
                      background: `color-mix(in oklab, var(${s.tone}) 70%, transparent)`,
                    }}
                  />
                ))}
              </div>

              {/* Legend */}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {segments.map((s) => (
                  <span key={s.key} className="flex items-center gap-1.5 font-sans text-[0.7rem]">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: `var(${s.tone})` }}
                    />
                    <span className="text-muted">{s.label}</span>
                    <span className="tabular-nums text-subtle">{s.pct}%</span>
                  </span>
                ))}
              </div>

              {/* Partial pressures — the point of the whole figure */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Readout label={t.po2} value={`${kpa(pO2)} kPa`} tone="--teal" />
                <Readout label={t.pco2} value={`${kpa(pCO2)} kPa`} tone="--amber" />
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-sans text-xs text-subtle">{t.takeaway}</p>
    </div>
  );
}

function Readout({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 px-3 py-2">
      <p className="font-sans text-[0.6rem] uppercase tracking-wider text-subtle">{label}</p>
      <p
        className="mt-0.5 font-display text-xl font-800 tabular-nums"
        style={{
          color: `var(${tone})`,
          textShadow: `0 0 16px color-mix(in oklab, var(${tone}) 40%, transparent)`,
        }}
      >
        {value}
      </p>
    </div>
  );
}
