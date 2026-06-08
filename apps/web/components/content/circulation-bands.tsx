import { cn } from "@/lib/utils";

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
  label: string;
  /** Short descriptor of spin speed, shown under the label. */
  spin: string;
  /** Latitude where the Hadley cell's air sinks (the dry, desert-making edge). */
  cellEdge: number;
  bands: Band[];
}

interface CirculationBandsProps {
  locale?: "vi" | "en";
  className?: string;
}

// Earth: fast spin → strong Coriolis → narrow Hadley cell sinking near 30°, so a
// thin equatorial rainforest and a broad subtropical desert belt.
const EARTH: Omit<World, "label" | "spin"> = {
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
const PANDORA: Omit<World, "label" | "spin"> = {
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

const STRINGS = {
  vi: {
    intro:
      "Cùng một định luật, hai tốc độ tự quay. Quay chậm hơn làm yếu hiệu ứng Coriolis, nới rộng hoàn lưu Hadley - nên dải mưa xích đạo phình ra và sa mạc bị đẩy về vĩ độ cao.",
    earth: "Trái Đất",
    pandora: "Pandora",
    earthSpin: "Quay nhanh · ngày ~24 h",
    pandoraSpin: "Quay chậm · ngày ~26 h",
    equator: "Xích đạo",
    pole: "Cực",
    rising: "Khí lên · mưa",
    sinking: "Khí chìm · khô",
    bands: {
      rainforest: "Rừng mưa",
      desert: "Sa mạc",
      temperate: "Ôn đới",
      polar: "Vùng lạnh",
    },
    takeaway:
      "Bề rộng vòng hoàn lưu quyết định vĩ độ của mọi khu rừng và sa mạc - và vì Pandora quay chậm, rừng mưa của nó trải rộng gần khắp hành tinh.",
  },
  en: {
    intro:
      "The same law, two spin speeds. A slower spin weakens the Coriolis effect and widens the Hadley cell - so the equatorial rain belt swells and the deserts are pushed to high latitudes.",
    earth: "Earth",
    pandora: "Pandora",
    earthSpin: "Fast spin · ~24 h day",
    pandoraSpin: "Slow spin · ~26 h day",
    equator: "Equator",
    pole: "Pole",
    rising: "Air rises · rain",
    sinking: "Air sinks · dry",
    bands: {
      rainforest: "Rainforest",
      desert: "Desert",
      temperate: "Temperate",
      polar: "Cold lands",
    },
    takeaway:
      "The width of the cell sets the latitude of every forest and desert - and because Pandora spins slowly, its rainforest spreads across almost the whole world.",
  },
} as const;

// Map an absolute latitude (0 equator, 90 pole) to a horizontal percent across a
// track that runs pole (left) → equator (centre) → pole (right).
function latToPct(signedLat: number): number {
  return ((signedLat + 90) / 180) * 100;
}

// Earth-vs-Pandora reading of atmospheric circulation: it makes the chapter's
// core mechanism visible - that rotation rate sets the width of the Hadley cell,
// and the cell's width places the rainforest and desert bands by latitude.
// Presentational (no client state); styled entirely from design tokens.
export function CirculationBands({ locale = "en", className }: CirculationBandsProps) {
  const t = STRINGS[locale];
  const worlds: World[] = [
    { ...EARTH, label: t.earth, spin: t.earthSpin },
    { ...PANDORA, label: t.pandora, spin: t.pandoraSpin },
  ];

  return (
    <figure className={cn("my-8 space-y-5", className)}>
      <p className="font-sans text-xs leading-relaxed text-muted">{t.intro}</p>

      <div className="space-y-6">
        {worlds.map((world) => (
          <WorldRow key={world.label} world={world} t={t} />
        ))}
      </div>

      {/* Shared legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {(Object.keys(TONE) as Band["key"][]).map((key) => (
          <span key={key} className="flex items-center gap-1.5 font-sans text-[0.7rem]">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: `color-mix(in oklab, var(${TONE[key]}) 75%, transparent)` }}
            />
            <span className="text-muted">{t.bands[key]}</span>
          </span>
        ))}
      </div>

      <figcaption className="font-sans text-xs text-subtle">{t.takeaway}</figcaption>
    </figure>
  );
}

function WorldRow({
  world,
  t,
}: {
  world: World;
  t: (typeof STRINGS)[keyof typeof STRINGS];
}) {
  const cellLeft = latToPct(-world.cellEdge);
  const cellRight = latToPct(world.cellEdge);
  const ariaBands = world.bands.map((b) => `${t.bands[b.key]} ${b.from}°–${b.to}°`).join(", ");

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-sm font-700 text-foreground">{world.label}</p>
        <p className="font-sans text-[0.65rem] uppercase tracking-wider text-subtle">
          {world.spin}
        </p>
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
          className="absolute -translate-x-1/2 font-sans text-[0.6rem] text-cyan"
          style={{ left: "50%", top: 0, color: "var(--cyan)" }}
          aria-hidden
        >
          ↑
        </span>
        {/* Sinking markers at the cell edges */}
        <span
          className="absolute -translate-x-1/2 font-sans text-[0.6rem]"
          style={{ left: `${cellLeft}%`, top: 0, color: "var(--amber)" }}
          aria-hidden
        >
          ↓
        </span>
        <span
          className="absolute -translate-x-1/2 font-sans text-[0.6rem]"
          style={{ left: `${cellRight}%`, top: 0, color: "var(--amber)" }}
          aria-hidden
        >
          ↓
        </span>
      </div>

      {/* Latitude track with biome bands */}
      <div
        className="relative h-6 w-full overflow-hidden rounded-md border border-border bg-void/40"
        role="img"
        aria-label={`${world.label}: ${ariaBands}`}
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
                background: `color-mix(in oklab, var(${TONE[b.key]}) 60%, transparent)`,
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
      <div className="mt-1 flex justify-between font-sans text-[0.6rem] uppercase tracking-wider text-subtle">
        <span>{t.pole}</span>
        <span className="flex items-center gap-1 text-cyan" style={{ color: "var(--cyan)" }}>
          {t.rising}
        </span>
        <span>{t.pole}</span>
      </div>
    </div>
  );
}
