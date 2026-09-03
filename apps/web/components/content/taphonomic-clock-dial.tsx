"use client";

import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  ALLENTOFT_HALFLIFE,
  ALLENTOFT_TEMP_C,
  TRACKS,
  type TrackKey,
  dnaHalfLife,
  evaluateTracks,
  formatYears,
  weatheringCeiling,
} from "./taphonomic-clock-dial-model";
import { TaphonomicClockTracks } from "./taphonomic-clock-dial-tracks";

// Death starts five clocks, and they do not run at the same speed or answer to
// the same things. Warmth accelerates chemistry; acid attacks mineral
// specifically; and how long a body lies on the surface decides whether either
// of those ever matters. Three presets put the reader in a real place — a
// Pandoran forest floor, a sulfide-charged lake bottom, a cold high basin — and
// the sliders let them break it. What should land: the burial clock is the one
// that governs. Lose that race and every material's own patient half-life is
// simply never consulted. Kinetics and sourcing live in
// ./taphonomic-clock-dial-model.ts.

type PresetId = "forestFloor" | "anoxicLake" | "coldBasin";

const PRESETS: Record<PresetId, { tempC: number; ph: number; burialDelayYr: number }> = {
  forestFloor: { tempC: 27, ph: 4.5, burialDelayYr: 40 },
  anoxicLake: { tempC: 22, ph: 7.2, burialDelayYr: 0.5 },
  coldBasin: { tempC: 6, ph: 7.8, burialDelayYr: 2 },
};

const PRESET_IDS: PresetId[] = ["forestFloor", "anoxicLake", "coldBasin"];

interface TaphonomicClockDialProps {
  caption?: string;
  className?: string;
}

export function TaphonomicClockDial({ caption, className }: TaphonomicClockDialProps) {
  const uid = useId();
  const t = useTranslations("viz.taphonomicClockDial");

  const [preset, setPreset] = useState<PresetId>("forestFloor");
  const [tempC, setTempC] = useState(PRESETS.forestFloor.tempC);
  const [ph, setPh] = useState(PRESETS.forestFloor.ph);
  const [burialDelayYr, setBurialDelayYr] = useState(PRESETS.forestFloor.burialDelayYr);

  function applyPreset(id: PresetId) {
    setPreset(id);
    setTempC(PRESETS[id].tempC);
    setPh(PRESETS[id].ph);
    setBurialDelayYr(PRESETS[id].burialDelayYr);
  }

  const tracks = useMemo(
    () => evaluateTracks({ tempC, ph, burialDelayYr }),
    [tempC, ph, burialDelayYr],
  );
  const ceiling = weatheringCeiling(tempC);
  const buriedInTime = burialDelayYr < ceiling;

  const halfLife = dnaHalfLife(tempC);
  const truncatedCount = tracks.filter((tr) => tr.truncated).length;

  // Name the longest-surviving track: the one thing a dig would actually find.
  const survivor = tracks.reduce((best, tr) => (tr.horizon > best.horizon ? tr : best));
  const survivorSpan = formatYears(survivor.horizon);

  const tone = buriedInTime ? "var(--teal)" : "var(--magenta)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={buriedInTime ? "teal" : "magenta"}
      hint={t(buriedInTime ? "hint.buried" : "hint.exposed", { n: truncatedCount })}
      caption={caption}
      className={className}
      controls={
        <SegmentedToggle<PresetId>
          ariaLabel={t("presetControl")}
          value={preset}
          onChange={applyPreset}
          options={PRESET_IDS.map((id) => ({
            value: id,
            label: t(`preset.${id}`),
            tone: id === "forestFloor" ? "var(--magenta)" : "var(--teal)",
          }))}
        />
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="sm:w-3/5">
          <TaphonomicClockTracks
            uid={uid}
            tracks={tracks}
            ceiling={ceiling}
            labels={{
              aria: t("aria", {
                survivor: t(`track.${survivor.key}`),
                span: `${survivorSpan.value} ${t(`unit.${survivorSpan.unit}`)}`,
              }),
              track: TRACKS.reduce(
                (acc, key) => ({ ...acc, [key]: t(`track.${key}`) }),
                {} as Record<TrackKey, string>,
              ),
              ceiling: t("ceilingMarker"),
              axis: t("axis"),
            }}
          />
        </div>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.survivor")}
            value={t(`track.${survivor.key}`)}
            note={t("readout.survivorNote", {
              span: `${survivorSpan.value} ${t(`unit.${survivorSpan.unit}`)}`,
            })}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.dnaHalfLife")}
            value={
              halfLife >= 1
                ? t("yrValue", { n: Math.round(halfLife).toLocaleString("en-US") })
                : t("yrValue", { n: halfLife.toPrecision(2) })
            }
            note={t("readout.dnaHalfLifeNote")}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("readout.race")}
            value={t(buriedInTime ? "readout.won" : "readout.lost")}
            note={t("readout.raceNote", {
              n: ceiling >= 1 ? Math.round(ceiling).toString() : ceiling.toPrecision(2),
            })}
            tone={tone}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-3">
        <VizSlider
          label={t("slider.temp")}
          display={t("degValue", { n: tempC.toFixed(0) })}
          min={-10}
          max={40}
          step={1}
          value={tempC}
          onChange={setTempC}
          tone="var(--amber)"
        />
        <VizSlider
          label={t("slider.ph")}
          display={ph.toFixed(1)}
          min={3.5}
          max={9}
          step={0.1}
          value={ph}
          onChange={setPh}
          tone="var(--teal)"
        />
        <VizSlider
          label={t("slider.burialDelay")}
          display={
            burialDelayYr < 1
              ? t("monthsValue", { n: Math.round(burialDelayYr * 12) })
              : t("yrValue", { n: burialDelayYr.toFixed(0) })
          }
          min={0}
          max={60}
          step={0.5}
          value={burialDelayYr}
          onChange={setBurialDelayYr}
          tone="var(--magenta)"
        />
      </div>

      <p className="mt-3 font-sans text-xs leading-relaxed text-subtle">
        {t("calibrationNote", { halfLife: ALLENTOFT_HALFLIFE, temp: ALLENTOFT_TEMP_C })}
      </p>
    </VizFigure>
  );
}
