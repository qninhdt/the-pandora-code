"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

interface LatencyHorizonProps {
  caption?: string;
  className?: string;
}

// Capacity is not the only ceiling; delay is the other one, and it is the one that
// decides what kind of mind a planet can have. The reader sets the conduction
// speed of the cable and how long a piece of coordination is allowed to take, and
// the figure draws the latency horizon: the patch of the moon that can be reached
// inside that deadline. Everything outside the glowing cap is, for that deadline,
// a separate world. The number to feel is the last readout — how many
// latency-isolated regions the moon divides into. One region is a planetary mind;
// thousands are a mosaic of strangers that happen to be wired together.

/** Pandora's mean radius in metres (canon: 0.75 Earth radii). */
const RADIUS_M = 5.7235e6;
/** Farthest surface separation: half the great circle. */
const MAX_SEPARATION_M = Math.PI * RADIUS_M;

// Conduction speeds are the measured biological range: bare fibres crawl at about
// a metre a second, the fattest myelinated axons reach ~120 m/s. Nothing
// electrochemical goes faster, so the slider spans the whole real envelope.
const SPEED_MIN = 1;
const SPEED_MAX = 120;
const SPEED_DEFAULT = 100;

// Deadlines the reader can hold the network to, in seconds.
const DEADLINES = {
  reflex: { seconds: 1, tone: "var(--magenta)" },
  day: { seconds: 26 * 3600, tone: "var(--cyan)" }, // one Pandoran day
  season: { seconds: 90 * 86400, tone: "var(--teal)" },
} as const;

type DeadlineKey = keyof typeof DEADLINES;

const VIEW = 200;

function formatDistance(m: number): string {
  if (m < 1000) return `${m.toFixed(0)} m`;
  return `${Math.round(m / 1000).toLocaleString()} km`;
}

function formatDuration(
  seconds: number,
  unit: (key: string, vals: Record<string, string>) => string,
): string {
  if (seconds < 60) return unit("seconds", { n: seconds.toFixed(seconds < 10 ? 1 : 0) });
  if (seconds < 3600) return unit("minutes", { n: (seconds / 60).toFixed(1) });
  if (seconds < 86400) return unit("hours", { n: (seconds / 3600).toFixed(1) });
  if (seconds < 31557600) return unit("days", { n: (seconds / 86400).toFixed(1) });
  return unit("years", { n: (seconds / 31557600).toFixed(1) });
}

export function LatencyHorizon({ caption, className }: LatencyHorizonProps) {
  const t = useTranslations("viz.latencyHorizon");
  const uid = useId();

  const [speed, setSpeed] = useState(SPEED_DEFAULT);
  const [deadline, setDeadline] = useState<DeadlineKey>("day");

  const deadlineSeconds = DEADLINES[deadline].seconds;
  const tone = DEADLINES[deadline].tone;

  // How far a signal gets inside the deadline, measured along the surface.
  const reach = Math.min(speed * deadlineSeconds, MAX_SEPARATION_M);
  // Time for one signal to cross the moon end to end.
  const crossingSeconds = MAX_SEPARATION_M / speed;

  // A spherical cap of surface radius `reach` covers 2πR²(1 − cos(reach/R)); the
  // whole moon is 4πR². The ratio is how many latency-isolated regions the moon
  // divides into at this deadline — the topological consequence of slow cable.
  const capFraction = (1 - Math.cos(reach / RADIUS_M)) / 2;
  const regions = Math.max(1, Math.round(1 / capFraction));
  const wholeMoon = regions <= 1;

  // Drawn as a disc of the moon with the reachable cap glowing on it.
  const cx = VIEW / 2;
  const cy = VIEW / 2;
  const moonR = 74;
  // Cap drawn at true angular scale, so a 1-second horizon is honestly invisible.
  const capR = Math.max(1, moonR * Math.sin(Math.min(reach / RADIUS_M, Math.PI / 2)));

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={wholeMoon ? "teal" : "magenta"}
      hint={wholeMoon ? t("hint.whole") : t("hint.fragmented", { n: regions.toLocaleString() })}
      controls={
        <SegmentedToggle<DeadlineKey>
          ariaLabel={t("deadlineLabel")}
          value={deadline}
          onChange={setDeadline}
          options={[
            { value: "reflex", label: t("deadlines.reflex"), tone: DEADLINES.reflex.tone },
            { value: "day", label: t("deadlines.day"), tone: DEADLINES.day.tone },
            { value: "season", label: t("deadlines.season"), tone: DEADLINES.season.tone },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${VIEW} ${VIEW}`}
          className="mx-auto w-2/3 sm:w-2/5"
          role="img"
          aria-label={t("aria", {
            reach: formatDistance(reach),
            regions: regions.toLocaleString(),
          })}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta"]} />

          {/* the moon: everything outside the glowing cap is out of touch */}
          <circle
            cx={cx}
            cy={cy}
            r={moonR}
            fill="color-mix(in oklab, var(--void) 70%, transparent)"
            stroke="var(--border-strong)"
            strokeWidth={1.2}
          />
          <circle cx={cx} cy={cy} r={moonR} fill={glowUrl(uid, "grid")} opacity={0.25} />

          {/* the latency horizon — the patch one signal can reach in time */}
          <circle
            cx={cx}
            cy={cy}
            r={capR}
            fill={tone}
            fillOpacity={0.3}
            stroke={tone}
            strokeWidth={1.4}
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "r 0.25s" }}
          />
          <circle cx={cx} cy={cy} r={2.4} fill={tone} filter={glowUrl(uid, "bloom")} />

          <VizText x={cx} y={cy - moonR - 10} size="small" anchor="middle">
            {t("moonLabel")}
          </VizText>
          <VizText x={cx} y={cy + moonR + 18} size="small" tone={tone} anchor="middle" numeric>
            {t("horizonLabel", { reach: formatDistance(reach) })}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-3/5">
          <VizReadout
            label={t("crossingLabel")}
            value={formatDuration(crossingSeconds, (k, v) => t(`units.${k}`, v))}
            tone="var(--amber)"
            tinted
            note={t("crossingNote")}
          />
          <VizReadout
            label={t("regionsLabel")}
            value={wholeMoon ? t("oneRegion") : regions.toLocaleString()}
            tone={wholeMoon ? "var(--teal)" : "var(--magenta)"}
            tinted
            note={t("regionsNote")}
          />
          <VizSlider
            label={t("speedSlider")}
            display={t("speedValue", { n: speed.toFixed(0) })}
            min={SPEED_MIN}
            max={SPEED_MAX}
            step={1}
            value={speed}
            onChange={setSpeed}
            tone={tone}
            className="mt-1"
          />
          <p className="font-sans text-xs leading-relaxed text-subtle">
            {t("speedNote", { max: SPEED_MAX })}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
