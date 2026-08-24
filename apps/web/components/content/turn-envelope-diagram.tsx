"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Agility is not a vibe, it is an envelope with two walls. Below a certain speed
// a flyer simply cannot pull hard without stalling - the wing runs out of lift.
// Above it, the limit is structural: bone, membrane and blood vessels cap how many
// g the animal survives. The two walls meet at corner speed, and that intersection
// is the tightest, fastest turn the animal owns.
//
//   n_stall(V) = 0.5 * rho * V^2 * CLmax / (W/S)      lift-limited
//   n <= n_max                                        structure-limited
//   turn rate  = g * sqrt(n^2 - 1) / V
//   V_corner   = sqrt( 2 * n_max * (W/S) / (rho * CLmax) )
//
// Sustained turning is a separate, lower wall: it is where muscle power can still
// pay the drag bill, so the flyer holds the turn instead of bleeding speed.
// The Earth/Pandora switch changes only rho and g, which is the whole point - the
// same animal gets a tighter envelope on Pandora without changing a single gene.
// The maths stays in code; strings translate.

const W_SVG = 400;
const H_SVG = 250;
const PAD_L = 34;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 34;
const PLOT_W = W_SVG - PAD_L - PAD_R;
const PLOT_H = H_SVG - PAD_T - PAD_B;

const V_MAX = 70; // m/s on the airspeed axis
const RATE_MAX = 90; // deg/s on the turn-rate axis

const RHO_EARTH = 1.225;
const RHO_PANDORA = 1.47;
const G_EARTH = 9.81;
const G_PANDORA = 7.85;

type World = "earth" | "pandora";
type Flyer = "nightwraith" | "ikran" | "peregrine" | "albatross";

interface FlyerSpec {
  /** Wing loading in N/m^2, quoted at Earth gravity so the world switch can scale it. */
  loadingEarth: number;
  clMax: number;
  nMax: number;
  /** Fraction of n_max the animal can hold without losing airspeed. */
  sustainedShare: number;
  tone: string;
}

const FLYERS: Record<Flyer, FlyerSpec> = {
  nightwraith: {
    loadingEarth: 281,
    clMax: 2.4,
    nMax: 9.5,
    sustainedShare: 0.55,
    tone: "var(--magenta)",
  },
  ikran: { loadingEarth: 225, clMax: 1.9, nMax: 7.8, sustainedShare: 0.6, tone: "var(--cyan)" },
  peregrine: { loadingEarth: 75, clMax: 1.6, nMax: 12, sustainedShare: 0.42, tone: "var(--amber)" },
  albatross: { loadingEarth: 145, clMax: 1.5, nMax: 2.8, sustainedShare: 0.8, tone: "var(--teal)" },
};

const px = (v: number) => PAD_L + (v / V_MAX) * PLOT_W;
const py = (rate: number) => PAD_T + (1 - rate / RATE_MAX) * PLOT_H;

function envelope(spec: FlyerSpec, world: World) {
  const rho = world === "pandora" ? RHO_PANDORA : RHO_EARTH;
  const g = world === "pandora" ? G_PANDORA : G_EARTH;
  // Weight scales with gravity, so the same body loads its wing less on Pandora.
  const loading = spec.loadingEarth * (g / G_EARTH);
  const cornerV = Math.sqrt((2 * spec.nMax * loading) / (rho * spec.clMax));
  return { rho, g, loading, cornerV };
}

function turnRate(n: number, v: number, g: number): number {
  if (n <= 1 || v <= 0) return 0;
  return ((g * Math.sqrt(n * n - 1)) / v) * (180 / Math.PI);
}

function loadFactorAt(v: number, spec: FlyerSpec, rho: number, loading: number): number {
  const stallLimited = (0.5 * rho * v * v * spec.clMax) / loading;
  return Math.min(stallLimited, spec.nMax);
}

function envelopePath(spec: FlyerSpec, world: World, share: number): string {
  const { rho, g, loading } = envelope(spec, world);
  const N = 90;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const v = (i / N) * V_MAX;
    const n = loadFactorAt(v, spec, rho, loading) * share;
    const rate = Math.min(RATE_MAX, turnRate(n, v, g));
    d += `${i === 0 ? "M" : " L"} ${px(v).toFixed(1)} ${py(rate).toFixed(1)}`;
  }
  return d;
}

interface TurnEnvelopeDiagramProps {
  caption?: string;
  className?: string;
}

export function TurnEnvelopeDiagram({ caption, className }: TurnEnvelopeDiagramProps) {
  const t = useTranslations("viz.turn-envelope");
  const uid = useId();
  const [world, setWorld] = useState<World>("pandora");
  const [flyer, setFlyer] = useState<Flyer>("nightwraith");
  const [speed, setSpeed] = useState(30);

  const spec = FLYERS[flyer];
  const { rho, g, loading, cornerV } = envelope(spec, world);
  const nHere = loadFactorAt(speed, spec, rho, loading);
  const rateHere = turnRate(nHere, speed, g);
  const radiusHere =
    nHere > 1 ? (speed * speed) / (g * Math.sqrt(nHere * nHere - 1)) : Number.POSITIVE_INFINITY;
  const limitedBy =
    (0.5 * rho * speed * speed * spec.clMax) / loading < spec.nMax ? "lift" : "structure";

  const tone = spec.tone;
  const figTone: "cyan" | "teal" | "magenta" | "amber" =
    flyer === "nightwraith"
      ? "magenta"
      : flyer === "ikran"
        ? "cyan"
        : flyer === "peregrine"
          ? "amber"
          : "teal";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${limitedBy}`)}
      caption={caption}
      tone={figTone}
      className={className}
      controls={
        <SegmentedToggle
          options={[
            { value: "earth" as World, label: t("world.earth"), tone: "var(--muted)" },
            { value: "pandora" as World, label: t("world.pandora"), tone: "var(--teal)" },
          ]}
          value={world}
          onChange={setWorld}
          ariaLabel={t("worldLabel")}
        />
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg
          viewBox={`0 0 ${W_SVG} ${H_SVG}`}
          className="w-full md:w-3/5"
          role="img"
          aria-label={t(`aria.${limitedBy}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} fill={glowUrl(uid, "grid")} />

          {/* the other flyers, dimmed, so the guild reads as one morphospace */}
          {(Object.keys(FLYERS) as Flyer[])
            .filter((f) => f !== flyer)
            .map((f) => (
              <path
                key={f}
                d={envelopePath(FLYERS[f], world, 1)}
                fill="none"
                stroke={FLYERS[f].tone}
                strokeWidth={1.1}
                strokeOpacity={0.2}
              />
            ))}

          {/* sustained boundary - what the animal can hold */}
          <path
            d={envelopePath(spec, world, spec.sustainedShare)}
            fill="none"
            stroke={tone}
            strokeWidth={1.4}
            strokeOpacity={0.5}
            strokeDasharray="4 3"
          />

          {/* instantaneous boundary - what it can snatch for a moment */}
          <path
            d={envelopePath(spec, world, 1)}
            fill="none"
            stroke={tone}
            strokeWidth={2.6}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />

          {/* corner speed: where the lift wall meets the structural ceiling */}
          <line
            x1={px(cornerV)}
            y1={PAD_T}
            x2={px(cornerV)}
            y2={PAD_T + PLOT_H}
            stroke="var(--foreground)"
            strokeOpacity={0.25}
            strokeDasharray="3 4"
            strokeWidth={1}
          />
          <VizText x={px(cornerV) + 4} y={PAD_T + 10} size="micro" tone="subtle">
            {t("cornerSpeed")}
          </VizText>

          {/* the reader's chosen operating point */}
          <circle
            cx={px(speed)}
            cy={py(Math.min(RATE_MAX, rateHere))}
            r={5.5}
            fill={tone}
            filter={glowUrl(uid, "bloom-strong")}
          />

          {/* axes */}
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
          {[0, 20, 40, 60].map((v) => (
            <VizTick key={v} x={px(v)} y={PAD_T + PLOT_H + 13}>
              {v}
            </VizTick>
          ))}
          {[30, 60, 90].map((r) => (
            <VizTick key={r} x={PAD_L - 6} y={py(r) + 3} anchor="end">
              {r}
            </VizTick>
          ))}
          <VizText x={PAD_L + PLOT_W / 2} y={H_SVG - 6} size="micro" tone="subtle" anchor="middle">
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
          <SegmentedToggle
            options={(Object.keys(FLYERS) as Flyer[]).map((f) => ({
              value: f,
              label: t(`flyer.${f}`),
              tone: FLYERS[f].tone,
            }))}
            value={flyer}
            onChange={setFlyer}
            ariaLabel={t("flyerLabel")}
          />
          <VizSlider
            label={t("speedLabel")}
            display={t("speedValue", { n: Math.round(speed) })}
            min={6}
            max={V_MAX}
            step={1}
            value={speed}
            onChange={setSpeed}
            tone={tone}
          />
          <VizReadout
            label={t("readout.load")}
            value={t("gees", { n: nHere.toFixed(1) })}
            tone={tone}
          />
          <VizReadout
            label={t("readout.radius")}
            value={
              Number.isFinite(radiusHere) ? t("metres", { n: Math.round(radiusHere) }) : t("noTurn")
            }
            tone={tone}
          />
          <VizReadout
            label={t("readout.rate")}
            value={t("degPerSec", { n: Math.round(rateHere) })}
            note={t(`limitNote.${limitedBy}`)}
            tone={tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
