"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { Pause, Play } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// A four-winged flyer does not have to accept the tandem interference penalty,
// because its surfaces are not frozen in place - they beat, and the phase lag
// between the front pair and the back pair is a control the animal actually has.
// Dragonfly measurements give three useful settings:
//   psi ~ 0     both pairs together - biggest peak force, worst power bill
//   psi ~ 90-120 the aft pair crosses the forewing's shed swirl and takes energy
//                back out of it (wake recapture), the cheapest cruise
//   psi ~ 180   counter-stroking - smallest body bob, steadiest gun platform
// Peak force is modelled as constructive/destructive addition of two strokes;
// power carries a recapture credit centred near 105 degrees; body bob follows the
// same addition as force, since an unbalanced stroke throws the body around.
// The maths stays in code; strings translate.

const W = 380;
const H = 230;

const STROKE_PERIOD = 2.4; // seconds per full wingbeat at the figure's pace
const RECAPTURE_CENTRE = 105; // degrees of lag where swirl removal peaks
const RECAPTURE_WIDTH = 52; // degrees; how sharply the credit falls away
const RECAPTURE_MAX = 0.22; // best measured power saving vs a single pair

const HINGE_FORE_X = 132;
const HINGE_AFT_X = 214;
const HINGE_Y = 108;
const WING_LEN = 74;

// Vertical force relative to one isolated pair beating alone. Adding two strokes
// in phase nearly doubles the peak; pushing them apart cancels the peaks out.
function peakForce(psiDeg: number): number {
  const psi = (psiDeg * Math.PI) / 180;
  return 1 + Math.cos(psi) * 0.42 + 0.58;
}

// Aerodynamic power per unit lift, relative to one isolated pair. In-phase
// strokes cost extra because both pairs fight the same air at once; the recapture
// window buys the saving back.
function powerCost(psiDeg: number): number {
  const psi = (psiDeg * Math.PI) / 180;
  const crowding = 0.18 * (1 + Math.cos(psi)) * 0.5;
  const credit = RECAPTURE_MAX * Math.exp(-(((psiDeg - RECAPTURE_CENTRE) / RECAPTURE_WIDTH) ** 2));
  return 1 + crowding * 2 - credit;
}

// How much the body is thrown up and down over a beat. Balanced strokes cancel.
function bodyBob(psiDeg: number): number {
  const psi = (psiDeg * Math.PI) / 180;
  return Math.abs(Math.cos(psi / 2));
}

function regimeOf(psiDeg: number): "together" | "recapture" | "counter" {
  if (psiDeg < 55) return "together";
  if (psiDeg < 150) return "recapture";
  return "counter";
}

const REGIME_TONE: Record<"together" | "recapture" | "counter", string> = {
  together: "var(--amber)",
  recapture: "var(--teal)",
  counter: "var(--cyan)",
};
const REGIME_FIG: Record<"together" | "recapture" | "counter", "amber" | "teal" | "cyan"> = {
  together: "amber",
  recapture: "teal",
  counter: "cyan",
};

interface WingPhaseControllerProps {
  caption?: string;
  className?: string;
}

export function WingPhaseController({ caption, className }: WingPhaseControllerProps) {
  const t = useTranslations("viz.wing-phase");
  const uid = useId();
  const reduced = useReducedMotionSafe();
  const [psi, setPsi] = useState(105);
  const [playing, setPlaying] = useState(true);
  const { phase } = usePhaseLoop({ period: STROKE_PERIOD, playing, initial: 0.18 });

  const regime = regimeOf(psi);
  const tone = REGIME_TONE[regime];

  // Stroke angle of each pair over the beat, the aft pair lagging by psi.
  const foreAngle = Math.sin(phase * 2 * Math.PI) * 42;
  const aftAngle = Math.sin((phase - psi / 360) * 2 * Math.PI) * 42;

  const force = peakForce(psi);
  const power = powerCost(psi);
  const bob = bodyBob(psi);

  const wingTip = (hingeX: number, angleDeg: number, dir: -1 | 1) => {
    const a = (angleDeg * Math.PI) / 180;
    return {
      x: hingeX + dir * WING_LEN * Math.cos(a),
      y: HINGE_Y - WING_LEN * Math.sin(a),
    };
  };

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={reduced ? undefined : t(`hint.${regime}`)}
      caption={caption}
      tone={REGIME_FIG[regime]}
      className={className}
      controls={
        reduced ? undefined : (
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={playing}
            title={playing ? t("pause") : t("play")}
            className="rounded-md border border-border p-2 text-subtle transition-colors hover:text-foreground"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
        )
      }
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full md:w-3/5"
          role="img"
          aria-label={t(`aria.${regime}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber"]} />

          {/* body, riding up and down by the amount the strokes fail to cancel */}
          <ellipse
            cx={(HINGE_FORE_X + HINGE_AFT_X) / 2}
            cy={HINGE_Y + bob * Math.sin(phase * 4 * Math.PI) * 6}
            rx={62}
            ry={9}
            fill="var(--surface-raised)"
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* the two wing pairs, each drawn as an up and a down surface */}
          {(
            [
              { hinge: HINGE_FORE_X, angle: foreAngle, hue: "var(--cyan)", key: "fore" },
              { hinge: HINGE_AFT_X, angle: aftAngle, hue: tone, key: "aft" },
            ] as const
          ).map((pair) => (
            <g key={pair.key}>
              {([-1, 1] as const).map((dir) => {
                const tip = wingTip(pair.hinge, pair.angle, dir);
                return (
                  <path
                    key={dir}
                    d={`M ${pair.hinge} ${HINGE_Y} Q ${pair.hinge + dir * WING_LEN * 0.55} ${
                      HINGE_Y - WING_LEN * 0.5
                    }, ${tip.x} ${tip.y}`}
                    fill="none"
                    stroke={pair.hue}
                    strokeWidth={pair.key === "aft" ? 3 : 2.4}
                    strokeLinecap="round"
                    filter={pair.key === "aft" ? glowUrl(uid, "bloom") : undefined}
                  />
                );
              })}
              <circle cx={pair.hinge} cy={HINGE_Y} r={3} fill={pair.hue} />
            </g>
          ))}

          <VizText x={HINGE_FORE_X} y={HINGE_Y + 30} size="micro" tone="cyan" anchor="middle">
            {t("forePair")}
          </VizText>
          <VizText x={HINGE_AFT_X} y={HINGE_Y + 30} size="micro" tone={tone} anchor="middle">
            {t("aftPair")}
          </VizText>

          {/* shed swirl from the fore pair, which the aft pair may cross */}
          {regime === "recapture" && (
            <g opacity={0.8}>
              {[0, 1].map((i) => (
                <circle
                  key={i}
                  cx={HINGE_FORE_X + 34 + i * 26}
                  cy={HINGE_Y - 26 + i * 8}
                  r={9 - i * 2}
                  fill="none"
                  stroke="var(--teal)"
                  strokeWidth={1.3}
                  strokeDasharray="3 3"
                />
              ))}
              <VizText x={HINGE_FORE_X + 30} y={HINGE_Y - 44} size="micro" tone="teal">
                {t("swirl")}
              </VizText>
            </g>
          )}

          {/* phase dial along the bottom, marking the three named settings */}
          {(() => {
            const trackY = H - 30;
            const x0 = 40;
            const x1 = W - 40;
            const at = (deg: number) => x0 + (deg / 180) * (x1 - x0);
            return (
              <g>
                <line
                  x1={x0}
                  y1={trackY}
                  x2={x1}
                  y2={trackY}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                />
                {[0, 105, 180].map((deg) => (
                  <line
                    key={deg}
                    x1={at(deg)}
                    y1={trackY - 4}
                    x2={at(deg)}
                    y2={trackY + 4}
                    stroke="var(--border-strong)"
                    strokeWidth={1}
                  />
                ))}
                <VizText x={x0} y={trackY + 15} size="micro" tone="subtle">
                  {t("dial.together")}
                </VizText>
                <VizText x={at(105)} y={trackY + 15} size="micro" tone="subtle" anchor="middle">
                  {t("dial.recapture")}
                </VizText>
                <VizText x={x1} y={trackY + 15} size="micro" tone="subtle" anchor="end">
                  {t("dial.counter")}
                </VizText>
                <circle cx={at(psi)} cy={trackY} r={5} fill={tone} filter={glowUrl(uid, "bloom")} />
              </g>
            );
          })()}
        </svg>

        <div className="flex w-full flex-col gap-2 md:w-2/5">
          <VizSlider
            label={t("psiLabel")}
            display={t("degrees", { n: Math.round(psi) })}
            min={0}
            max={180}
            step={1}
            value={psi}
            onChange={setPsi}
            tone={tone}
          />
          <VizReadout
            label={t("readout.force")}
            value={t("times", { n: force.toFixed(2) })}
            tone={tone}
          />
          <VizReadout label={t("readout.bob")} value={`${Math.round(bob * 100)}%`} tone={tone} />
          <VizReadout
            label={t("readout.power")}
            value={t("times", { n: power.toFixed(2) })}
            note={t(`verdict.${regime}`)}
            tone={tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
