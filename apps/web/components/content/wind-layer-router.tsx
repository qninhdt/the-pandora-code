"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  MAX_ALTITUDE_KM,
  MIN_ALTITUDE_KM,
  groundTrack,
  profileSamples,
  windAt,
} from "./wind-layer-router-model";

// Two panels, one argument. Left: the wind staff — the whole column at once, each
// barb pointing where that layer flows, so the reversal between the low easterlies
// and the jet aloft is visible before the reader touches anything. Right: the
// ground track that one chosen level produces over a month of drifting. Move the
// altitude and the destination changes, which is the entire thesis: with no engine,
// height is the rudder.
const W = 200;
const H = 250;
const STAFF_X = 74;
const STAFF_TOP = 22;
const STAFF_BOT = 214;
const BARB_LEN = 30;

const MAP_W = 240;
const MAP_H = 250;
const MAP_PAD = 22;

const SAMPLES = profileSamples(16);
const DRIFT_DAYS = 30;

const zToY = (z: number) =>
  STAFF_BOT -
  ((z - MIN_ALTITUDE_KM) / (MAX_ALTITUDE_KM - MIN_ALTITUDE_KM)) * (STAFF_BOT - STAFF_TOP);

const TONE_BY_STRATUM = {
  surface: "var(--subtle)",
  trade: "var(--teal)",
  middle: "var(--subtle)",
  westerly: "var(--cyan)",
  jet: "var(--amber)",
} as const;

const FIGURE_TONE_BY_STRATUM = {
  surface: "teal",
  trade: "teal",
  middle: "cyan",
  westerly: "cyan",
  jet: "amber",
} as const;

interface WindLayerRouterProps {
  caption?: string;
  className?: string;
}

export function WindLayerRouter({ caption, className }: WindLayerRouterProps) {
  const t = useTranslations("viz.wind-layer-router");
  const uid = useId();
  const [altitude, setAltitude] = useState(1.5);

  const wind = windAt(altitude);
  const track = groundTrack(altitude, DRIFT_DAYS);
  const tone = TONE_BY_STRATUM[wind.stratum];

  // Fit the track into the map box, keeping a sane scale when the drift is tiny.
  const spanLon = Math.max(Math.abs(track.points[track.points.length - 1].lon), 40);
  const lonToX = (lon: number) => MAP_W / 2 + (lon / spanLon) * (MAP_W / 2 - MAP_PAD);
  const latToY = (lat: number) => MAP_H / 2 - (lat / 30) * (MAP_H / 2 - MAP_PAD);
  const trackPath = track.points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${lonToX(p.lon).toFixed(1)} ${latToY(p.lat).toFixed(1)}`)
    .join(" ");
  const end = track.points[track.points.length - 1];

  const circuitText =
    Math.abs(track.circuits) < 0.02
      ? t("nowhere")
      : t(track.circuits > 0 ? "circuitsEast" : "circuitsWest", {
          n: Math.abs(track.circuits).toFixed(2),
        });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${wind.stratum}`)}
      caption={caption}
      tone={FIGURE_TONE_BY_STRATUM[wind.stratum]}
      className={className}
      controls={
        <div className="w-40">
          <VizSlider
            label={t("control")}
            display={t("kmValue", { n: altitude.toFixed(1) })}
            min={MIN_ALTITUDE_KM}
            max={MAX_ALTITUDE_KM}
            step={0.25}
            value={altitude}
            onChange={setAltitude}
            tone={tone}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full md:w-2/5"
          role="img"
          aria-label={t("staffAria")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber"]} />

          {/* the column itself */}
          <line
            x1={STAFF_X}
            y1={STAFF_TOP}
            x2={STAFF_X}
            y2={STAFF_BOT}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* one barb per sampled level: direction by rotation, strength by length */}
          {SAMPLES.map((s) => {
            const y = zToY(s.z);
            const rad = (s.heading * Math.PI) / 180;
            const len = 6 + (s.speed / 42) * BARB_LEN;
            const active = Math.abs(s.z - altitude) < 0.45;
            return (
              <g key={s.z}>
                <line
                  x1={STAFF_X}
                  y1={y}
                  x2={STAFF_X + Math.sin(rad) * len}
                  y2={y - Math.cos(rad) * len}
                  stroke={TONE_BY_STRATUM[s.stratum]}
                  strokeWidth={active ? 2.4 : 1.2}
                  strokeOpacity={active ? 1 : 0.4}
                  strokeLinecap="round"
                  filter={active ? glowUrl(uid, "bloom") : undefined}
                />
                <circle
                  cx={STAFF_X}
                  cy={y}
                  r={active ? 2.6 : 1.4}
                  fill={TONE_BY_STRATUM[s.stratum]}
                />
              </g>
            );
          })}

          {/* the reader's chosen level */}
          <line
            x1={12}
            y1={zToY(altitude)}
            x2={W - 8}
            y2={zToY(altitude)}
            stroke={tone}
            strokeOpacity={0.4}
            strokeDasharray="3 4"
            strokeWidth={1}
          />
          <VizText x={12} y={zToY(altitude) - 5} size="micro" tone={tone}>
            {t(`stratum.${wind.stratum}`)}
          </VizText>

          <VizText x={12} y={STAFF_BOT + 16} size="micro" tone="subtle">
            {t("groundLabel")}
          </VizText>
          <VizText x={12} y={STAFF_TOP - 8} size="micro" tone="subtle">
            {t("tropopauseLabel")}
          </VizText>
          <VizText x={W - 8} y={H - 4} size="micro" tone="subtle" anchor="end">
            {t("staffCaption")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-3 md:w-3/5">
          <svg
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="w-full"
            role="img"
            aria-label={t("mapAria", { days: DRIFT_DAYS })}
          >
            <rect
              x={MAP_PAD}
              y={MAP_PAD}
              width={MAP_W - MAP_PAD * 2}
              height={MAP_H - MAP_PAD * 2}
              fill={glowUrl(uid, "grid")}
            />
            {/* the equator, and the meridian the caravan launches from */}
            <line
              x1={MAP_PAD}
              y1={latToY(0)}
              x2={MAP_W - MAP_PAD}
              y2={latToY(0)}
              stroke="var(--border-strong)"
              strokeWidth={1}
            />
            <line
              x1={lonToX(0)}
              y1={MAP_PAD}
              x2={lonToX(0)}
              y2={MAP_H - MAP_PAD}
              stroke="var(--border)"
              strokeWidth={1}
            />
            <path d={trackPath} fill="none" stroke={tone} strokeWidth={2.4} strokeLinecap="round" />
            <circle cx={lonToX(0)} cy={latToY(0)} r={3.4} fill="var(--foreground)" />
            <circle
              cx={lonToX(end.lon)}
              cy={latToY(end.lat)}
              r={5}
              fill={tone}
              filter={glowUrl(uid, "bloom")}
            />
            <VizText x={MAP_PAD} y={latToY(0) - 5} size="micro" tone="subtle">
              {t("equator")}
            </VizText>
            <VizText x={MAP_W - MAP_PAD} y={MAP_H - 6} size="micro" tone="subtle" anchor="end">
              {t("mapCaption", { days: DRIFT_DAYS })}
            </VizText>
          </svg>

          <div className="grid gap-2 sm:grid-cols-3">
            <VizReadout
              label={t("readout.heading")}
              value={t("degValue", { n: Math.round(wind.heading) })}
              tone={tone}
            />
            <VizReadout
              label={t("readout.speed")}
              value={t("msValue", { n: wind.speed.toFixed(1) })}
              tone={tone}
            />
            <VizReadout label={t("readout.arrival")} value={circuitText} tone={tone} tinted />
          </div>
        </div>
      </div>
    </VizFigure>
  );
}
