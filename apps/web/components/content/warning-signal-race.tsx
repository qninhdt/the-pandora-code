"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  CHANNELS,
  type ChannelKey,
  DIST_DEFAULT_EXP,
  DIST_MAX_EXP,
  DIST_MIN_EXP,
  formatDistance,
  formatDuration,
} from "./warning-signal-race-model";

interface WarningSignalRaceProps {
  caption?: string;
  className?: string;
}

// A warning is only a warning if it arrives first. The reader puts an attacked
// plant and an unattacked neighbour a chosen distance apart, picks the channel
// the alarm travels on, decides how long the neighbour has before the herbivore
// reaches it — and watches the message either make it or lose the race. The
// feeling to leave behind: the underground alarm is real, and it is so slow that
// it only ever wins across roughly the metre the original pot experiment used.
// Speeds and formatting live in warning-signal-race-model.ts.

const VIEW_W = 340;
const VIEW_H = 128;

export function WarningSignalRace({ caption, className }: WarningSignalRaceProps) {
  const t = useTranslations("viz.warningSignalRace");
  const uid = useId();

  const [channel, setChannel] = useState<ChannelKey>("spike");
  const [distExp, setDistExp] = useState(DIST_DEFAULT_EXP);
  const [deadlineHours, setDeadlineHours] = useState(6);

  const distance = 10 ** distExp; // metres between attacked plant and neighbour
  const speed = CHANNELS[channel].speed;
  const tone = CHANNELS[channel].tone;

  const travelSeconds = distance / speed;
  const deadlineSeconds = deadlineHours * 3600;
  const inTime = travelSeconds <= deadlineSeconds;

  // How far the alarm actually gets before the herbivore arrives, and where that
  // puts the message front on the drawn soil section.
  const reach = speed * deadlineSeconds;
  const frontFraction = Math.min(1, reach / distance);

  const plantX = 34;
  const neighbourX = VIEW_W - 34;
  const soilY = 74;
  const frontX = plantX + (neighbourX - plantX) * frontFraction;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      className={className}
      tone={inTime ? "teal" : "magenta"}
      hint={inTime ? t("hint.inTime") : t("hint.tooLate")}
      controls={
        <SegmentedToggle<ChannelKey>
          ariaLabel={t("channelLabel")}
          value={channel}
          onChange={setChannel}
          options={[
            { value: "streaming", label: t("channels.streaming"), tone: CHANNELS.streaming.tone },
            { value: "spike", label: t("channels.spike"), tone: CHANNELS.spike.tone },
            { value: "nerve", label: t("channels.nerve"), tone: CHANNELS.nerve.tone },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria", {
            distance: formatDistance(distance),
            reach: formatDistance(reach),
          })}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "magenta", "amber"]} />

          {/* the soil line the alarm has to cross */}
          <line
            x1={plantX}
            y1={soilY}
            x2={neighbourX}
            y2={soilY}
            stroke="var(--border)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          {/* how far the message actually travels before the deadline */}
          <line
            x1={plantX}
            y1={soilY}
            x2={frontX}
            y2={soilY}
            stroke={tone}
            strokeWidth={4}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "all 0.25s" }}
          />
          <circle cx={frontX} cy={soilY} r={4} fill={tone} filter={glowUrl(uid, "bloom")} />

          {/* attacked plant (left) and the naive neighbour (right) */}
          <circle cx={plantX} cy={soilY - 22} r={11} fill={glowUrl(uid, "wash-amber")} />
          <circle cx={plantX} cy={soilY - 22} r={7} fill="var(--amber)" fillOpacity={0.9} />
          <circle
            cx={neighbourX}
            cy={soilY - 22}
            r={11}
            fill={glowUrl(uid, inTime ? "wash-teal" : "wash-magenta")}
          />
          <circle
            cx={neighbourX}
            cy={soilY - 22}
            r={7}
            fill={inTime ? "var(--teal)" : "var(--magenta)"}
            fillOpacity={0.9}
          />

          <VizText x={plantX} y={soilY - 40} size="small" tone="amber" anchor="middle">
            {t("attacked")}
          </VizText>
          <VizText
            x={neighbourX}
            y={soilY - 40}
            size="small"
            tone={inTime ? "teal" : "magenta"}
            anchor="middle"
          >
            {t("neighbour")}
          </VizText>
          <VizText x={VIEW_W / 2} y={soilY + 20} size="small" tone={tone} anchor="middle" numeric>
            {t("frontLabel", { reach: formatDistance(reach) })}
          </VizText>
          <VizText x={VIEW_W / 2} y={VIEW_H - 8} size="micro" anchor="middle" numeric>
            {t("gapLabel", { distance: formatDistance(distance) })}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("travelLabel")}
            value={formatDuration(travelSeconds, (k, v) => t(`units.${k}`, v))}
            tone={tone}
            tinted
            note={t("travelNote")}
          />
          <VizReadout
            label={t("verdictLabel")}
            value={inTime ? t("verdict.inTime") : t("verdict.tooLate")}
            tone={inTime ? "var(--teal)" : "var(--magenta)"}
            tinted
          />
          <VizSlider
            label={t("distanceSlider")}
            display={formatDistance(distance)}
            min={DIST_MIN_EXP}
            max={DIST_MAX_EXP}
            step={0.05}
            value={distExp}
            onChange={setDistExp}
            tone={tone}
            className="mt-1"
          />
          <VizSlider
            label={t("deadlineSlider")}
            display={t("units.hours", { n: deadlineHours.toFixed(deadlineHours < 10 ? 1 : 0) })}
            min={0.5}
            max={48}
            step={0.5}
            value={deadlineHours}
            onChange={setDeadlineHours}
            tone="var(--amber)"
          />
        </div>
      </div>
    </VizFigure>
  );
}
