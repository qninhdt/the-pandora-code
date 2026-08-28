"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import {
  DEFAULT_HOST_JUP,
  DISK_MASS_RATIO,
  type FormationRoute,
  PANDORA_MASS_EARTH,
  REFERENCE_SYSTEMS,
  massBudget,
  referenceRatio,
} from "./satellite-mass-budget-model";

// The chapter's crux, made arguable. Three real satellite systems sit on a line
// near one ten-thousandth of their host's mass; Pandora sits an order of magnitude
// above it and will not come down for any believable Polyphemus. The reader can
// try — push the host mass to the top of the slider and the shortfall barely
// moves — and then pick which escape route they find least unreasonable. Strings
// from i18n.

interface SatelliteMassBudgetProps {
  caption?: string;
  className?: string;
}

const VIEW_W = 340;
const VIEW_H = 176;
const PLOT_X = 40;
const PLOT_W = VIEW_W - PLOT_X - 14;
const PLOT_TOP = 16;
const PLOT_BOTTOM = 130;

// Log axes both ways: host mass spans two decades, ratio spans three. The host
// range stops at six Jupiters — already generous against a canonically
// Jupiter-class Polyphemus, and short of the deuterium-burning line where a
// "planet" stops being one. The readout states what mass would actually be needed.
const HOST_MIN = 0.03;
const HOST_MAX = 6;
const RATIO_MIN = 1e-5;
const RATIO_MAX = 1e-2;

const xForHost = (jup: number) =>
  PLOT_X +
  ((Math.log10(jup) - Math.log10(HOST_MIN)) / (Math.log10(HOST_MAX) - Math.log10(HOST_MIN))) *
    PLOT_W;

const yForRatio = (ratio: number) => {
  const clamped = Math.min(RATIO_MAX, Math.max(RATIO_MIN, ratio));
  return (
    PLOT_BOTTOM -
    ((Math.log10(clamped) - Math.log10(RATIO_MIN)) /
      (Math.log10(RATIO_MAX) - Math.log10(RATIO_MIN))) *
      (PLOT_BOTTOM - PLOT_TOP)
  );
};

const HOST_TICKS = [0.03, 0.1, 1, 10];
const RATIO_TICKS = [1e-5, 1e-4, 1e-3, 1e-2];

const ROUTE_TONE: Record<FormationRoute, string> = {
  disk: "var(--cyan)",
  capture: "var(--amber)",
  impact: "var(--magenta)",
};

function formatRatio(ratio: number): string {
  const exponent = Math.floor(Math.log10(ratio));
  const mantissa = ratio / 10 ** exponent;
  return `${mantissa.toFixed(1)}e${exponent}`;
}

export function SatelliteMassBudget({ caption, className }: SatelliteMassBudgetProps) {
  const t = useTranslations("viz.satelliteMassBudget");
  const uid = useId();

  const [hostMassJup, setHostMassJup] = useState(DEFAULT_HOST_JUP);
  const [moonMassEarth, setMoonMassEarth] = useState(PANDORA_MASS_EARTH);
  const [route, setRoute] = useState<FormationRoute>("disk");

  const budget = massBudget(hostMassJup, moonMassEarth);
  const tone =
    budget.verdict === "withinCeiling"
      ? "var(--teal)"
      : budget.verdict === "strained"
        ? "var(--amber)"
        : "var(--magenta)";

  const ceilingY = yForRatio(DISK_MASS_RATIO);
  const pointX = xForHost(hostMassJup);
  const pointY = yForRatio(budget.ratio);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`route.${route}.hint`)}
      caption={caption}
      tone={budget.verdict === "withinCeiling" ? "teal" : "magenta"}
      controls={
        <SegmentedToggle
          ariaLabel={t("routeLabel")}
          value={route}
          onChange={setRoute}
          options={[
            { value: "disk", label: t("route.disk.name"), tone: ROUTE_TONE.disk },
            { value: "capture", label: t("route.capture.name"), tone: ROUTE_TONE.capture },
            { value: "impact", label: t("route.impact.name"), tone: ROUTE_TONE.impact },
          ]}
        />
      }
      className={className}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full"
        role="img"
        aria-label={`${t("aria")} — ${t(`verdict.${budget.verdict}`)}`}
      >
        <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />

        {/* the region a circumplanetary disk can actually deliver */}
        <rect
          x={PLOT_X}
          y={ceilingY}
          width={PLOT_W}
          height={PLOT_BOTTOM - ceilingY}
          fill="var(--teal)"
          fillOpacity={0.07}
        />
        <line
          x1={PLOT_X}
          y1={ceilingY}
          x2={PLOT_X + PLOT_W}
          y2={ceilingY}
          stroke="var(--teal)"
          strokeWidth={1.5}
          strokeDasharray="5 3"
        />
        <VizText x={PLOT_X + PLOT_W} y={ceilingY - 5} size="micro" tone="teal" anchor="end">
          {t("ceiling")}
        </VizText>

        {/* the three real systems that define the line */}
        {REFERENCE_SYSTEMS.map((system) => {
          const rx = xForHost(system.hostMassJup);
          const ry = yForRatio(referenceRatio(system));
          return (
            <g key={system.id}>
              <circle
                cx={rx}
                cy={ry}
                r={4}
                fill="var(--void)"
                stroke="var(--foreground)"
                strokeWidth={1.4}
                strokeOpacity={0.75}
              />
              <VizText x={rx} y={ry + 13} size="micro" tone="muted" anchor="middle">
                {t(`system.${system.id}`)}
              </VizText>
            </g>
          );
        })}

        {/* the moon under examination */}
        <line
          x1={pointX}
          y1={pointY}
          x2={pointX}
          y2={ceilingY}
          style={{ stroke: tone }}
          strokeWidth={1}
          strokeDasharray="2 2"
          strokeOpacity={0.7}
        />
        <circle
          cx={pointX}
          cy={pointY}
          r={6}
          style={{ fill: tone }}
          filter={glowUrl(uid, "bloom-strong")}
        />
        <VizText x={pointX + 10} y={pointY - 5} size="small" tone={tone}>
          {t("subject")}
        </VizText>

        {/* axes */}
        <line
          x1={PLOT_X}
          y1={PLOT_BOTTOM}
          x2={PLOT_X + PLOT_W}
          y2={PLOT_BOTTOM}
          stroke="var(--border)"
          strokeWidth={0.8}
        />
        <line
          x1={PLOT_X}
          y1={PLOT_TOP}
          x2={PLOT_X}
          y2={PLOT_BOTTOM}
          stroke="var(--border)"
          strokeWidth={0.8}
        />
        {HOST_TICKS.map((jup) => (
          <VizTick key={jup} x={xForHost(jup)} y={PLOT_BOTTOM + 12}>
            {jup < 1 ? jup.toFixed(2) : String(jup)}
          </VizTick>
        ))}
        {RATIO_TICKS.map((ratio) => (
          <VizText
            key={ratio}
            x={PLOT_X - 5}
            y={yForRatio(ratio) + 3}
            size="micro"
            anchor="end"
            tone="muted"
            numeric
          >
            {formatRatio(ratio)}
          </VizText>
        ))}
        <VizText x={PLOT_X + PLOT_W} y={PLOT_BOTTOM + 26} size="micro" anchor="end" tone="muted">
          {t("hostAxis")}
        </VizText>
        <VizText x={PLOT_X - 5} y={PLOT_TOP - 5} size="micro" anchor="end" tone="muted">
          {t("ratioAxis")}
        </VizText>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <VizReadout
          label={t("verdictLabel")}
          value={t(`verdict.${budget.verdict}`)}
          tone={tone}
          tinted
        />
        <VizReadout
          label={t("overshootLabel")}
          value={`${budget.overshoot < 10 ? budget.overshoot.toFixed(1) : Math.round(budget.overshoot)}×`}
          note={t("overshootNote")}
          tone="var(--magenta)"
        />
        <VizReadout
          label={t("permittedLabel")}
          value={budget.permittedMoonEarth.toFixed(3)}
          note={t("permittedNote")}
          tone="var(--teal)"
        />
      </div>

      <p className="mt-3 font-sans text-xs leading-relaxed text-subtle">
        {t("requiredHost", {
          mass: Math.round(budget.requiredHostJup),
        })}
      </p>

      <div className="mt-4 space-y-3">
        <VizSlider
          label={t("hostLabel")}
          min={HOST_MIN}
          max={HOST_MAX}
          step={0.01}
          value={hostMassJup}
          display={`${hostMassJup.toFixed(2)} MJ`}
          tone="var(--cyan)"
          onChange={setHostMassJup}
        />
        <VizSlider
          label={t("moonLabel")}
          min={0.005}
          max={1}
          step={0.005}
          value={moonMassEarth}
          display={`${moonMassEarth.toFixed(3)} ME`}
          tone="var(--magenta)"
          onChange={setMoonMassEarth}
        />
      </div>

      <p
        className="mt-3 rounded-lg border px-3 py-2 font-sans text-xs leading-relaxed"
        style={{
          borderColor: `color-mix(in oklab, ${ROUTE_TONE[route]} 35%, transparent)`,
          background: `color-mix(in oklab, ${ROUTE_TONE[route]} 8%, transparent)`,
          color: "var(--muted)",
        }}
      >
        <span className="font-600" style={{ color: ROUTE_TONE[route] }}>
          {t(`route.${route}.name`)}
        </span>{" "}
        — {t(`route.${route}.cost`)}
      </p>
    </VizFigure>
  );
}
