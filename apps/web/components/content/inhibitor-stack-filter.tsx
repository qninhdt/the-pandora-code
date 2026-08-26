"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Barren ground is not one problem but a stack of independent filters, each of
// which alone can stop a seedling. The reader toggles each filter off (imagines
// it relieved) and watches the compound establishment probability climb. The
// point: relieving any single inhibitor barely helps, because the survivors must
// clear ALL of them at once — which is why volcanic barrens stay barren for
// decades even where one obstacle eases. Multiplicative gates; strings translate.

type FilterId = "nitrogen" | "toxicity" | "crust" | "thermal" | "erosion";

// Fraction of germinants that survive THIS gate when the inhibitor is active.
// Product across active gates = compound establishment probability.
const PASS_WHEN_ACTIVE: Record<FilterId, number> = {
  nitrogen: 0.28,
  toxicity: 0.45,
  crust: 0.4,
  thermal: 0.5,
  erosion: 0.35,
};

const ORDER: FilterId[] = ["nitrogen", "toxicity", "crust", "thermal", "erosion"];

interface InhibitorStackFilterProps {
  caption?: string;
  className?: string;
}

export function InhibitorStackFilter({ caption, className }: InhibitorStackFilterProps) {
  const t = useTranslations("viz.inhibitor-stack");
  const uid = useId();
  // true = inhibitor still active (gate closed); false = relieved (gate open).
  const [active, setActive] = useState<Record<FilterId, boolean>>({
    nitrogen: true,
    toxicity: true,
    crust: true,
    thermal: true,
    erosion: true,
  });

  const survival = ORDER.reduce((p, id) => (active[id] ? p * PASS_WHEN_ACTIVE[id] : p), 1);
  const activeCount = ORDER.filter((id) => active[id]).length;
  const survivalPct = survival * 100;

  const tone =
    survivalPct < 5 ? "var(--magenta)" : survivalPct < 30 ? "var(--amber)" : "var(--teal)";
  const figTone: "cyan" | "teal" | "magenta" | "amber" =
    survivalPct < 5 ? "magenta" : survivalPct < 30 ? "amber" : "teal";

  // A single germinant walking the gauntlet: bar of 100 seedlings narrowing.
  const barW = 300;
  const barH = 22;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={activeCount === 0 ? t("hint.clear") : t("hint.active", { n: activeCount })}
      caption={caption}
      tone={figTone}
      className={className}
    >
      <div className="flex flex-col gap-4">
        {/* gauntlet bar */}
        <svg
          viewBox="0 0 320 70"
          className="w-full"
          role="img"
          aria-label={t("aria", { pct: survivalPct.toFixed(1) })}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />
          <rect x="10" y="24" width={barW} height={barH} rx="6" fill="var(--depth)" />
          <rect
            x="10"
            y="24"
            width={Math.max(2, barW * survival)}
            height={barH}
            rx="6"
            fill={tone}
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "width 0.4s ease" }}
          />
          <text
            x="10"
            y="16"
            className="font-sans"
            style={{ fill: "var(--subtle)", fontSize: 8.5 }}
          >
            {t("barStart")}
          </text>
          <text
            x={310}
            y="16"
            textAnchor="end"
            className="font-sans tabular-nums"
            style={{ fill: tone, fontSize: 8.5 }}
          >
            {t("barEnd", { pct: survivalPct.toFixed(survivalPct < 1 ? 2 : 0) })}
          </text>
        </svg>

        {/* filter toggles */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ORDER.map((id) => {
            const on = active[id];
            return (
              <button
                key={id}
                type="button"
                aria-pressed={on}
                onClick={() => setActive((s) => ({ ...s, [id]: !s[id] }))}
                className="rounded-lg border px-3 py-2 text-left transition-all duration-200"
                style={{
                  borderColor: on
                    ? "color-mix(in oklab, var(--magenta) 40%, transparent)"
                    : "color-mix(in oklab, var(--teal) 40%, transparent)",
                  background: on
                    ? "color-mix(in oklab, var(--magenta) 8%, var(--void))"
                    : "color-mix(in oklab, var(--teal) 8%, var(--void))",
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-700 text-foreground">
                    {t(`filter.${id}.name`)}
                  </span>
                  <span
                    className="font-sans text-[0.65rem] uppercase tracking-wider"
                    style={{ color: on ? "var(--magenta)" : "var(--teal)" }}
                  >
                    {on ? t("state.active") : t("state.relieved")}
                  </span>
                </div>
                <p className="mt-1 font-sans text-xs text-muted">{t(`filter.${id}.detail`)}</p>
              </button>
            );
          })}
        </div>

        <VizReadout
          label={t("readout.survival")}
          value={`${survivalPct.toFixed(survivalPct < 1 ? 2 : survivalPct < 10 ? 1 : 0)}%`}
          note={activeCount === 0 ? t("verdict.clear") : t("verdict.gated", { n: activeCount })}
          tone={tone}
          tinted
        />
      </div>
    </VizFigure>
  );
}
