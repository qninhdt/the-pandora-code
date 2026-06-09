"use client";

import { VizFigure } from "@/components/content/viz/viz-figure";
import { useTranslations } from "next-intl";

interface CirculationBandsProps {
  caption?: string;
  className?: string;
}

// A latitude band, expressed in degrees from the equator (symmetric across both
// hemispheres). `from`/`to` are absolute latitudes (0 = equator, 90 = pole).
interface Band {
  key: "rainforest" | "desert" | "temperate" | "polar";
  /** Absolute latitude where the band starts (closer to equator). */
  from: number;
  /** Absolute latitude where the band ends (closer to pole). */
  to: number;
}

interface World {
  /** Message key for the world name + spin descriptor. */
  nameKey: "earth" | "pandora";
  spinKey: "earthSpin" | "pandoraSpin";
  /** Latitude where the Hadley cell's air sinks (the dry, desert-making edge). */
  cellEdge: number;
  bands: Band[];
}

// Earth: fast spin → strong Coriolis → narrow Hadley cell sinking near 30°, so a
// thin equatorial rainforest and a broad subtropical desert belt.
const EARTH: World = {
  nameKey: "earth",
  spinKey: "earthSpin",
  cellEdge: 30,
  bands: [
    { key: "rainforest", from: 0, to: 10 },
    { key: "desert", from: 18, to: 34 },
    { key: "temperate", from: 38, to: 62 },
    { key: "polar", from: 68, to: 90 },
  ],
};

// Pandora: slower spin → weaker Coriolis → wider Hadley cell sinking near ~48°,
// so a broad rainforest belt and deserts suppressed and exiled to high latitudes.
const PANDORA: World = {
  nameKey: "pandora",
  spinKey: "pandoraSpin",
  cellEdge: 48,
  bands: [
    { key: "rainforest", from: 0, to: 22 },
    { key: "desert", from: 44, to: 53 },
    { key: "temperate", from: 56, to: 72 },
    { key: "polar", from: 78, to: 90 },
  ],
};

const TONE: Record<Band["key"], string> = {
  rainforest: "--teal",
  desert: "--amber",
  temperate: "--cyan",
  polar: "--subtle",
};

const WORLDS: World[] = [EARTH, PANDORA];
const BAND_KEYS: Band["key"][] = ["rainforest", "desert", "temperate", "polar"];

// Map an absolute latitude (0 equator, 90 pole) to a horizontal percent across a
// track that runs pole (left) → equator (centre) → pole (right).
function latToPct(signedLat: number): number {
  return ((signedLat + 90) / 180) * 100;
}

// Earth-vs-Pandora reading of atmospheric circulation: it makes the chapter's
// core mechanism visible - that rotation rate sets the width of the Hadley cell,
// and the cell's width places the rainforest and desert bands by latitude.
// Presentational (no client state); styled entirely from design tokens.
export function CirculationBands({ caption, className }: CirculationBandsProps) {
  const t = useTranslations("viz.circulationBands");

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption ?? t("takeaway")}
      tone="cyan"
      className={className}
    >
      <p className="font-sans text-xs leading-relaxed text-muted">{t("intro")}</p>

      <div className="mt-5 space-y-6">
        {WORLDS.map((world) => (
          <WorldRow key={world.nameKey} world={world} t={t} />
        ))}
      </div>

      {/* Shared legend */}
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5">
        {BAND_KEYS.map((key) => (
          <span key={key} className="flex items-center gap-1.5 font-sans text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{
                background: `var(${TONE[key]})`,
                boxShadow: `inset 0 0.5px 0 color-mix(in oklab, var(--foreground) 40%, transparent), 0 0 6px -1px color-mix(in oklab, var(${TONE[key]}) 80%, transparent)`,
              }}
            />
            <span className="text-muted">{t(key)}</span>
          </span>
        ))}
      </div>
    </VizFigure>
  );
}

function WorldRow({
  world,
  t,
}: {
  world: World;
  t: ReturnType<typeof useTranslations>;
}) {
  const cellLeft = latToPct(-world.cellEdge);
  const cellRight = latToPct(world.cellEdge);
  const ariaBands = world.bands.map((b) => `${t(b.key)} ${b.from}°–${b.to}°`).join(", ");

  return (
    <div className="rounded-xl border border-border bg-void/30 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-sm font-700 text-foreground">{t(world.nameKey)}</p>
        <p className="font-sans text-xs uppercase tracking-wider text-subtle">{t(world.spinKey)}</p>
      </div>

      {/* Hadley-cell bracket: spans equator → sinking edge on both sides */}
      <div className="relative mt-4 h-5">
        <div
          className="absolute top-1.5 h-2 rounded-full"
          style={{
            left: `${cellLeft}%`,
            width: `${cellRight - cellLeft}%`,
            background: "color-mix(in oklab, var(--cyan) 22%, transparent)",
            borderInline: "1px dashed color-mix(in oklab, var(--cyan) 55%, transparent)",
          }}
        />
        {/* Rising marker at the equator */}
        <span
          className="absolute -translate-x-1/2 font-sans text-xs"
          style={{ left: "50%", top: 0, color: "var(--cyan)" }}
          aria-hidden
        >
          ↑
        </span>
        {/* Sinking markers at the cell edges */}
        <span
          className="absolute -translate-x-1/2 font-sans text-xs"
          style={{ left: `${cellLeft}%`, top: 0, color: "var(--amber)" }}
          aria-hidden
        >
          ↓
        </span>
        <span
          className="absolute -translate-x-1/2 font-sans text-xs"
          style={{ left: `${cellRight}%`, top: 0, color: "var(--amber)" }}
          aria-hidden
        >
          ↓
        </span>
      </div>

      {/* Latitude track with biome bands */}
      <div
        className="relative h-7 w-full overflow-hidden rounded-md border"
        role="img"
        aria-label={`${t(world.nameKey)}: ${ariaBands}`}
        style={{
          borderColor: "color-mix(in oklab, var(--foreground) 10%, var(--border))",
          background: "var(--void)",
          boxShadow: "inset 0 1px 2px color-mix(in oklab, var(--void) 70%, transparent)",
        }}
      >
        {world.bands.flatMap((b) => {
          // Mirror each band into both hemispheres.
          const south = { left: latToPct(-b.to), right: latToPct(-b.from) };
          const north = { left: latToPct(b.from), right: latToPct(b.to) };
          return [south, north].map((seg, i) => (
            <div
              key={`${b.key}-${i}`}
              className="absolute inset-y-0"
              style={{
                left: `${seg.left}%`,
                width: `${seg.right - seg.left}%`,
                // vertical gradient + top inset highlight gives each climate band
                // the depth of a lit zone rather than a flat painted block; the
                // rainforest belt gets an extra inner bloom to read as the wettest.
                background: `linear-gradient(to bottom, color-mix(in oklab, var(${TONE[b.key]}) 78%, transparent) 0%, color-mix(in oklab, var(${TONE[b.key]}) 58%, transparent) 55%, color-mix(in oklab, var(${TONE[b.key]}) 46%, var(--void)) 100%)`,
                boxShadow: `inset 0 1px 0 color-mix(in oklab, var(--foreground) 20%, transparent)${
                  b.key === "rainforest"
                    ? `, inset 0 0 14px color-mix(in oklab, var(${TONE[b.key]}) 55%, transparent)`
                    : ""
                }`,
              }}
            />
          ));
        })}
        {/* Equator line */}
        <div
          className="absolute inset-y-0 w-px"
          style={{
            left: "50%",
            background: "color-mix(in oklab, var(--foreground) 70%, transparent)",
          }}
        />
      </div>

      {/* Axis labels */}
      <div className="mt-1.5 flex justify-between font-sans text-xs uppercase tracking-wider text-subtle">
        <span>{t("pole")}</span>
        <span style={{ color: "var(--cyan)" }}>{t("rising")}</span>
        <span>{t("pole")}</span>
      </div>
    </div>
  );
}
