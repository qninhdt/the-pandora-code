"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

type GasKey = "o2" | "ch4" | "co2";

interface GasSpec {
  key: GasKey;
  color: string;
  // Wavelength positions (0..1) of this gas's absorption bands.
  bands: number[];
}

const GASES: GasSpec[] = [
  { key: "o2", color: "var(--cyan)", bands: [0.18, 0.46] },
  { key: "ch4", color: "var(--magenta)", bands: [0.62, 0.78, 0.9] },
  { key: "co2", color: "var(--amber)", bands: [0.34, 0.7] },
];

// O₂ + CH₄ together is the disequilibrium signature: they react away unless
// life keeps replenishing both. A living world holds both at once.
const LIVING_GASES: Record<GasKey, boolean> = { o2: true, ch4: true, co2: true };
const DEAD_GASES: Record<GasKey, boolean> = { o2: false, ch4: false, co2: true };

function Atmosphere({
  label,
  living,
  gases,
  t,
}: {
  label: string;
  living: boolean;
  gases: Record<GasKey, boolean>;
  t: (k: string) => string;
}) {
  const hasDisequilibrium = gases.o2 && gases.ch4;

  return (
    <div className="flex flex-1 flex-col items-center gap-3">
      <span className="font-mono text-[11px] uppercase tracking-wider text-muted">
        {label}
      </span>
      <div className="relative">
        <svg viewBox="0 0 120 120" className="size-28" aria-hidden>
          <title>{label}</title>
          {/* atmosphere halo */}
          {hasDisequilibrium && (
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--teal)"
              strokeWidth="1.5"
              opacity="0.5"
              className="animate-pulse"
            />
          )}
          <circle
            cx="60"
            cy="60"
            r="44"
            fill={living ? "color-mix(in oklab, var(--teal) 28%, var(--void))" : "color-mix(in oklab, var(--stone, #8a93a8) 18%, var(--void))"}
            stroke={hasDisequilibrium ? "var(--teal)" : "var(--border-strong)"}
            strokeWidth="2"
          />
          {living && (
            <>
              <circle cx="48" cy="52" r="7" fill="color-mix(in oklab, var(--teal) 45%, transparent)" />
              <circle cx="72" cy="64" r="9" fill="color-mix(in oklab, var(--cyan) 35%, transparent)" />
              <circle cx="58" cy="78" r="5" fill="color-mix(in oklab, var(--teal) 40%, transparent)" />
            </>
          )}
        </svg>
      </div>
      <div
        className={`rounded-md border px-2 py-1 text-center font-mono text-[9px] leading-tight ${
          hasDisequilibrium
            ? "border-teal/50 bg-teal/10 text-teal"
            : "border-border/40 bg-void/50 text-muted"
        }`}
      >
        {hasDisequilibrium ? t("imbalance") : t("balanced")}
      </div>
    </div>
  );
}

export default function Biosignature() {
  const t = useTranslations("viz.biosignature");
  const [livingGases, setLivingGases] = useState<Record<GasKey, boolean>>(LIVING_GASES);

  const toggle = (k: GasKey) =>
    setLivingGases((g) => ({ ...g, [k]: !g[k] }));

  const spectrum = useMemo(() => {
    // Build absorption dips for whichever gases are present on the living world.
    const active = GASES.filter((g) => livingGases[g.key]);
    return active.flatMap((g) => g.bands.map((b) => ({ x: b, color: g.color })));
  }, [livingGases]);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      aspectRatio="16/10"
    >
      <div className="flex h-full w-full flex-col gap-3 p-4 pt-16">
        <div className="flex flex-1 items-start justify-around gap-4">
          <Atmosphere label={t("dead")} living={false} gases={DEAD_GASES} t={t} />
          <Atmosphere label={t("living")} living gases={livingGases} t={t} />
        </div>

        {/* Spectral fingerprint of the living world */}
        <div className="relative h-12 w-full overflow-hidden rounded-lg border border-border/40 bg-void/60">
          <div className="absolute inset-0 bg-gradient-to-r from-magenta/20 via-cyan/20 to-amber/20" />
          {spectrum.map((line, i) => (
            <div
              key={`${line.x}-${i}`}
              className="absolute top-0 h-full w-[3px]"
              style={{
                left: `${line.x * 100}%`,
                background: line.color,
                boxShadow: `0 0 8px ${line.color}`,
              }}
            />
          ))}
          <span className="absolute bottom-1 left-2 font-mono text-[8px] uppercase tracking-wider text-muted">
            {t("spectrum")}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {GASES.map((g) => (
              <button
                key={g.key}
                type="button"
                onClick={() => toggle(g.key)}
                className={`rounded-md border px-2 py-1 font-mono text-[10px] transition-colors ${
                  livingGases[g.key]
                    ? "text-foreground"
                    : "border-border/40 text-muted opacity-50"
                }`}
                style={
                  livingGases[g.key]
                    ? { borderColor: g.color, color: g.color }
                    : undefined
                }
              >
                {t(g.key)}
              </button>
            ))}
          </div>
          <Readout
            label="O₂+CH₄"
            value={livingGases.o2 && livingGases.ch4 ? "✓" : "—"}
            accent={livingGases.o2 && livingGases.ch4 ? "teal" : "foreground"}
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
