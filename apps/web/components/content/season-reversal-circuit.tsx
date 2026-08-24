"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Why twice a year, and not three times or nine.
//
// A Pandoran year runs about 481 Earth days. One circuit of the moon at a plausible
// riding speed takes a few weeks — so transit time is NOT what sets the rhythm.
// What sets it is the wind itself: like Earth's monsoon, the prevailing flow
// reverses twice per year, and a caravan that cannot fight the wind must leave on
// the reversal or wait for the next one. The reader turns the riding speed up and
// finds the circuit gets faster and faster while the departures stay stubbornly
// twice-yearly, with the leftover time spent moored and trading.

/** Circumference at the equator, kilometres (canon radius 0.75 R_Earth). */
const CIRCUMFERENCE_KM = 2 * Math.PI * 5723.5;
/** Pandoran year in Earth days: Polyphemus at ~1.23 AU around Alpha Centauri A. */
const YEAR_DAYS = 481;

type Cadence = "annual" | "semiannual" | "quarterly";

const CADENCE_REVERSALS: Record<Cadence, number> = {
  annual: 1,
  semiannual: 2,
  quarterly: 4,
};

const W = 260;
const H = 260;
const CX = W / 2;
const CY = H / 2;
const R_ORBIT = 96;

interface SeasonReversalCircuitProps {
  caption?: string;
  className?: string;
}

export function SeasonReversalCircuit({ caption, className }: SeasonReversalCircuitProps) {
  const t = useTranslations("viz.season-reversal");
  const uid = useId();
  const [speed, setSpeed] = useState(15);
  const [cadence, setCadence] = useState<Cadence>("semiannual");

  const reversals = CADENCE_REVERSALS[cadence];
  const transitDays = CIRCUMFERENCE_KM / ((speed * 86400) / 1000);
  const windowDays = YEAR_DAYS / reversals;
  const mooredDays = Math.max(0, windowDays - transitDays);
  const fits = transitDays <= windowDays;
  const dutyCycle = Math.min(1, transitDays / windowDays);

  const tone = fits ? "var(--teal)" : "var(--magenta)";
  const figureTone = fits ? "teal" : "magenta";

  // A ring split into one arc per wind season; the flying share of each arc is
  // drawn bright, the moored remainder dim.
  const arcs = Array.from({ length: reversals }, (_, i) => {
    const start = (i / reversals) * 2 * Math.PI - Math.PI / 2;
    const sweep = (2 * Math.PI) / reversals;
    const flying = sweep * dutyCycle;
    const point = (angle: number, r: number) =>
      `${CX + Math.cos(angle) * r} ${CY + Math.sin(angle) * r}`;
    const arcPath = (from: number, to: number) =>
      `M ${point(from, R_ORBIT)} A ${R_ORBIT} ${R_ORBIT} 0 ${to - from > Math.PI ? 1 : 0} 1 ${point(to, R_ORBIT)}`;
    return {
      key: i,
      moored: arcPath(start, start + sweep),
      flown: arcPath(start, start + flying),
      markX: CX + Math.cos(start) * (R_ORBIT + 16),
      markY: CY + Math.sin(start) * (R_ORBIT + 16),
    };
  });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(fits ? "hint.fits" : "hint.overruns")}
      caption={caption}
      tone={figureTone}
      className={className}
      controls={
        <SegmentedToggle
          options={(Object.keys(CADENCE_REVERSALS) as Cadence[]).map((value) => ({
            value,
            label: t(`cadence.${value}`),
          }))}
          value={cadence}
          onChange={setCadence}
          ariaLabel={t("cadenceControl")}
        />
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full md:w-1/2"
          role="img"
          aria-label={t("aria", { reversals })}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber"]} />

          {/* the star the whole system goes round, so the ring reads as a year */}
          <circle cx={CX} cy={CY} r={13} fill={glowUrl(uid, "wash-amber")} />
          <circle cx={CX} cy={CY} r={5} fill="var(--amber)" filter={glowUrl(uid, "bloom")} />
          <VizText x={CX} y={CY + 26} size="micro" tone="subtle" anchor="middle">
            {t("yearLabel", { n: YEAR_DAYS })}
          </VizText>

          {arcs.map((arc) => (
            <g key={arc.key}>
              <path d={arc.moored} fill="none" stroke="var(--border-strong)" strokeWidth={7} />
              <path
                d={arc.flown}
                fill="none"
                stroke={tone}
                strokeWidth={7}
                strokeLinecap="round"
                filter={glowUrl(uid, "bloom")}
              />
              <circle cx={arc.markX} cy={arc.markY} r={2.6} fill="var(--cyan)" />
            </g>
          ))}

          <VizText x={CX} y={H - 8} size="micro" tone="subtle" anchor="middle">
            {t("ringCaption")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-3 md:w-1/2">
          <VizSlider
            label={t("control.speed")}
            display={t("msValue", { n: speed })}
            min={2}
            max={45}
            step={1}
            value={speed}
            onChange={setSpeed}
            tone={tone}
          />
          <VizReadout
            label={t("readout.transit")}
            value={t("daysValue", { n: Math.round(transitDays) })}
            note={t("transitNote", { n: Math.round(CIRCUMFERENCE_KM).toLocaleString("en-US") })}
            tone={tone}
          />
          <VizReadout
            label={t("readout.window")}
            value={t("daysValue", { n: Math.round(windowDays) })}
            note={t("windowNote", { n: reversals })}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.moored")}
            value={fits ? t("daysValue", { n: Math.round(mooredDays) }) : t("noRoom")}
            note={t(fits ? "mooredNote" : "overrunNote")}
            tone={tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
