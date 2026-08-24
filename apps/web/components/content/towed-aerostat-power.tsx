"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface TowedAerostatPowerProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL
// A free balloon drifts with the air, so it feels no relative wind and has
// nothing to push against. Pull it across the streamlines and it immediately
// starts paying drag. Airship practice measures that drag against the two-thirds
// power of enclosed volume rather than a frontal area:
//
//   D = 0.5 * rho * V^2 * Cdv * Vol^(2/3)
//   P = D * V = 0.5 * rho * V^3 * Cdv * Vol^(2/3)
//
// Power therefore rises as the cube of speed while lift stays exactly where it
// was. Doubling the pace costs eight times the muscle - which is the whole reason
// a towed caravan is slow and a fast one is impossible.
//
// The tugs: sustained aerobic flight muscle delivers on the order of 100 W per kg
// of muscle, and roughly a fifth of a flier's mass is flight muscle. At ~70%
// propulsive efficiency a 150 kg animal contributes about 2.1 kW of useful thrust
// power.
//
// Crosswind flight is the tug's cheat: like a traction kite, a tug that flies
// across the wind moves faster than the wind and generates force in proportion to
// its own airspeed, multiplying its pull well beyond what a static tether gives.
// ─────────────────────────────────────────────────────────────────────

const RHO_AIR = 1.47; // Pandoran surface air, kg/m^3
const ENVELOPE_VOLUME = 65450; // a 50 m bell, m^3
const CDV_BLUFF = 0.4; // a jellyfish bell dragged sideways
const CDV_STREAMLINED = 0.035; // an airship hull aligned with the flow

const WINDRAY_MASS = 150; // kg
const MUSCLE_FRACTION = 0.2;
const MUSCLE_POWER = 100; // W per kg of muscle, sustained aerobic
const PROP_EFFICIENCY = 0.7;
const WINDRAY_POWER = WINDRAY_MASS * MUSCLE_FRACTION * MUSCLE_POWER * PROP_EFFICIENCY; // ~2.1 kW

/** Crosswind flight multiplies a tug's useful pull over a static tether. */
const CROSSWIND_GAIN = 3;

type Body = "bluff" | "streamlined";

function drag(speed: number, cdv: number): number {
  return 0.5 * RHO_AIR * speed ** 2 * cdv * ENVELOPE_VOLUME ** (2 / 3);
}

function power(speed: number, cdv: number): number {
  return drag(speed, cdv) * speed;
}

function windraysNeeded(speed: number, cdv: number, crosswind: boolean): number {
  const per = WINDRAY_POWER * (crosswind ? CROSSWIND_GAIN : 1);
  return Math.ceil(power(speed, cdv) / per);
}

const W = 380;
const H = 200;
const PAD_L = 32;
const PAD_R = 16;
const PAD_T = 16;
const PAD_B = 30;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const V_MAX = 12; // m/s
const P_MAX = 500_000; // W, the top of the plot

const px = (v: number) => PAD_L + (v / V_MAX) * PLOT_W;
const py = (p: number) => PAD_T + (1 - Math.min(p / P_MAX, 1)) * PLOT_H;

function powerPath(cdv: number): string {
  const N = 48;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const v = (i / N) * V_MAX;
    d += `${i === 0 ? "M" : " L"} ${px(v).toFixed(1)} ${py(power(v, cdv)).toFixed(1)}`;
  }
  return d;
}

export function TowedAerostatPower({ caption, className }: TowedAerostatPowerProps) {
  const t = useTranslations("viz.towed-aerostat-power");
  const uid = useId();
  const [speed, setSpeed] = useState(3);
  const [body, setBody] = useState<Body>("bluff");
  const [crosswind, setCrosswind] = useState(true);

  const cdv = body === "bluff" ? CDV_BLUFF : CDV_STREAMLINED;
  const p = power(speed, cdv);
  const teams = windraysNeeded(speed, cdv, crosswind);
  const feasible = teams <= 12;

  const tone: "teal" | "amber" | "magenta" = speed === 0 ? "teal" : feasible ? "teal" : "magenta";
  const toneVar = `var(--${tone})`;

  const bluffPath = useMemo(() => powerPath(CDV_BLUFF), []);
  const streamPath = useMemo(() => powerPath(CDV_STREAMLINED), []);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={speed === 0 ? t("hint.drifting") : feasible ? t("hint.feasible") : t("hint.impossible")}
      caption={caption}
      tone={tone}
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("bodyLabel")}
          value={body}
          onChange={setBody}
          options={[
            { value: "bluff", label: t("body.bluff"), tone: "var(--magenta)" },
            { value: "streamlined", label: t("body.streamlined"), tone: "var(--cyan)" },
          ]}
        />
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full md:w-3/5"
          role="img"
          aria-label={t("aria", { n: teams, v: speed })}
        >
          <GlowDefs idBase={uid} tones={["teal", "amber", "magenta"]} />
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={glowUrl(uid, "grid")} />

          {/* what a plausible team of tugs can actually deliver */}
          <line
            x1={PAD_L}
            y1={py(WINDRAY_POWER * (crosswind ? CROSSWIND_GAIN : 1) * 8)}
            x2={PAD_L + PLOT_W}
            y2={py(WINDRAY_POWER * (crosswind ? CROSSWIND_GAIN : 1) * 8)}
            stroke="var(--foreground)"
            strokeOpacity={0.25}
            strokeDasharray="3 4"
            strokeWidth={1}
          />
          <VizText
            x={PAD_L + PLOT_W}
            y={py(WINDRAY_POWER * (crosswind ? CROSSWIND_GAIN : 1) * 8) - 4}
            size="micro"
            tone="subtle"
            anchor="end"
          >
            {t("teamLine")}
          </VizText>

          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T + PLOT_H}
            x2={PAD_L + PLOT_W}
            y2={PAD_T + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          <path
            d={bluffPath}
            fill="none"
            stroke="var(--magenta)"
            strokeWidth={body === "bluff" ? 2.6 : 1.2}
            strokeOpacity={body === "bluff" ? 1 : 0.25}
            strokeLinecap="round"
            filter={body === "bluff" ? glowUrl(uid, "bloom") : undefined}
          />
          <path
            d={streamPath}
            fill="none"
            stroke="var(--cyan)"
            strokeWidth={body === "streamlined" ? 2.6 : 1.2}
            strokeOpacity={body === "streamlined" ? 1 : 0.25}
            strokeLinecap="round"
            filter={body === "streamlined" ? glowUrl(uid, "bloom") : undefined}
          />

          <g style={{ transition: "transform 0.3s ease" }} transform={`translate(${px(speed)},0)`}>
            <line
              x1={0}
              y1={PAD_T}
              x2={0}
              y2={PAD_T + PLOT_H}
              stroke={toneVar}
              strokeWidth={1.4}
              strokeOpacity={0.55}
            />
            <circle cx={0} cy={py(p)} r={5} fill={toneVar} filter={glowUrl(uid, "bloom-strong")} />
          </g>

          <VizTick x={PAD_L} y={PAD_T + PLOT_H + 14} anchor="start">
            0
          </VizTick>
          <VizTick x={PAD_L + PLOT_W} y={PAD_T + PLOT_H + 14} anchor="end">
            {t("speedMax")}
          </VizTick>
          <VizText x={PAD_L + PLOT_W / 2} y={H - 4} size="micro" tone="subtle" anchor="middle">
            {t("xAxis")}
          </VizText>
          <VizText
            x={11}
            y={PAD_T + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 11 ${PAD_T + PLOT_H / 2})`}
          >
            {t("yAxis")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 md:w-2/5">
          <VizReadout
            label={t("readout.drag")}
            value={`${(drag(speed, cdv) / 1000).toFixed(1)} kN`}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("readout.power")}
            value={`${(p / 1000).toFixed(1)} kW`}
            note={t("readout.cubeNote")}
            tone="var(--amber)"
          />
          <VizReadout
            label={t("readout.windrays")}
            value={speed === 0 ? t("readout.none") : `${teams}`}
            note={speed === 0 ? t("readout.driftNote") : t("readout.perAnimal")}
            tone={toneVar}
            tinted
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
        <VizSlider
          className="flex-1"
          label={t("speedLabel")}
          display={`${speed.toFixed(1)} m/s`}
          min={0}
          max={V_MAX}
          step={0.5}
          value={speed}
          onChange={setSpeed}
          tone={toneVar}
        />
        <SegmentedToggle
          ariaLabel={t("towLabel")}
          value={crosswind ? "crosswind" : "static"}
          onChange={(v) => setCrosswind(v === "crosswind")}
          options={[
            { value: "static", label: t("tow.static"), tone: "var(--magenta)" },
            { value: "crosswind", label: t("tow.crosswind"), tone: "var(--teal)" },
          ]}
        />
      </div>
    </VizFigure>
  );
}
