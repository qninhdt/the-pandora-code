"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — the seawater itself decides whether a skeleton can form
//
// As atmospheric CO2 rises, the surface ocean absorbs it, pH falls and
// the carbonate-ion pool shrinks, dropping the aragonite saturation
// state Omega_arag. Below a critical threshold (~3.0-3.3) gross reef
// calcification can no longer outrun bioerosion and the framework
// dissolves. Anchor points from the note (Part C):
//
//   pre-industrial : pCO2 ~280   pH ~8.18   Omega ~4.4
//   today          : pCO2 ~425   pH ~8.05   Omega ~3.65
//   2100 (high)    : pCO2 ~900   pH ~7.77   Omega ~2.1
//
// pH and Omega are interpolated log-linearly in pCO2 across these anchors
// so the dial reads correctly at the three canonical states.
// ─────────────────────────────────────────────────────────────────────

const OMEGA_THRESHOLD = 3.1; // net-accretion floor (~3.0-3.3)
const PCO2_MIN = 280;
const PCO2_MAX = 1000;

// Log-linear fit through the three anchor points.
function phAt(pco2: number): number {
  return 8.18 - 0.324 * Math.log2(pco2 / 280);
}
function omegaAt(pco2: number): number {
  // 4.4 at 280, ~2.0 near 1000: scale with the carbonate-ion drawdown.
  return Math.max(0.8, 4.4 - 1.9 * Math.log2(pco2 / 280));
}

const ANCHORS = [
  { id: "preindustrial", pco2: 280, tone: "var(--teal)" },
  { id: "today", pco2: 425, tone: "var(--cyan)" },
  { id: "future", pco2: 900, tone: "var(--magenta)" },
] as const;

const W = 320;
const H = 230;
const PAD = { l: 44, r: 16, t: 20, b: 42 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

const OMEGA_TOP = 5;
const OMEGA_BOT = 0.5;
const xOf = (pco2: number) => PAD.l + ((pco2 - PCO2_MIN) / (PCO2_MAX - PCO2_MIN)) * plotW;
const yOf = (om: number) => PAD.t + (1 - (om - OMEGA_BOT) / (OMEGA_TOP - OMEGA_BOT)) * plotH;

function curvePath(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 100; i += 1) {
    const p = PCO2_MIN + ((PCO2_MAX - PCO2_MIN) * i) / 100;
    pts.push(`${i === 0 ? "M" : "L"}${xOf(p).toFixed(1)},${yOf(omegaAt(p)).toFixed(1)}`);
  }
  return pts.join(" ");
}
const OMEGA_PATH = curvePath();

interface AragoniteThresholdDialProps {
  caption?: string;
  className?: string;
}

// Push atmospheric CO2 up and watch the saturation curve sink through the
// dashed threshold. The moment it crosses, the reef stops being able to
// build — the substrate the Metkayina live on starts to lose to the water.
export function AragoniteThresholdDial({ caption, className }: AragoniteThresholdDialProps) {
  const uid = useId();
  const t = useTranslations("viz.aragoniteThreshold");
  const [pco2, setPco2] = useState(425); // present day

  const ph = phAt(pco2);
  const omega = omegaAt(pco2);
  const accreting = omega >= OMEGA_THRESHOLD;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={accreting ? t("hint.accreting") : t("hint.dissolving")}
      caption={caption}
      tone={accreting ? "cyan" : "magenta"}
      className={className}
      controls={
        <div className="w-40 sm:w-52">
          <VizSlider
            label={t("controls.pco2")}
            display={`${Math.round(pco2)} µatm`}
            min={PCO2_MIN}
            max={PCO2_MAX}
            step={5}
            value={pco2}
            onChange={setPco2}
            tone={accreting ? "var(--cyan)" : "var(--magenta)"}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full sm:w-3/5" role="img" aria-label={t("title")}>
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta"]} />

          {/* dissolution zone below the threshold */}
          <rect
            x={PAD.l}
            y={yOf(OMEGA_THRESHOLD)}
            width={plotW}
            height={PAD.t + plotH - yOf(OMEGA_THRESHOLD)}
            fill="var(--magenta)"
            opacity={0.08}
          />
          <line
            x1={PAD.l}
            y1={yOf(OMEGA_THRESHOLD)}
            x2={PAD.l + plotW}
            y2={yOf(OMEGA_THRESHOLD)}
            stroke="var(--magenta)"
            strokeWidth={1.4}
            strokeOpacity={0.7}
            strokeDasharray="4 3"
          />
          <VizText x={PAD.l + 4} y={yOf(OMEGA_THRESHOLD) - 4} size="micro" tone="var(--magenta)">
            {t("thresholdLabel")}
          </VizText>

          {/* axes */}
          <VizTick x={PAD.l - 8} y={yOf(4) + 3} anchor="end">
            4
          </VizTick>
          <VizTick x={PAD.l - 8} y={yOf(2) + 3} anchor="end">
            2
          </VizTick>
          <VizText x={11} y={PAD.t + plotH / 2} size="small" anchor="middle" tone="var(--muted)" transform={`rotate(-90 11 ${PAD.t + plotH / 2})`}>
            {t("axis.omega")}
          </VizText>
          <VizText x={PAD.l + plotW / 2} y={H - 8} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.pco2")}
          </VizText>

          <path d={OMEGA_PATH} fill="none" stroke="var(--cyan)" strokeWidth={2.2} />

          {ANCHORS.map((a) => (
            <circle
              key={a.id}
              cx={xOf(a.pco2)}
              cy={yOf(omegaAt(a.pco2))}
              r={2.6}
              fill={a.tone}
              opacity={0.85}
            />
          ))}

          {/* live marker */}
          <line
            x1={xOf(pco2)}
            y1={PAD.t}
            x2={xOf(pco2)}
            y2={PAD.t + plotH}
            stroke={accreting ? "var(--cyan)" : "var(--magenta)"}
            strokeWidth={1.2}
            strokeOpacity={0.6}
            strokeDasharray="3 3"
          />
          <circle
            cx={xOf(pco2)}
            cy={yOf(omega)}
            r={4.5}
            fill={accreting ? "var(--cyan)" : "var(--magenta)"}
            filter={glowUrl(uid, "bloom")}
          />
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout label={t("readout.ph")} value={ph.toFixed(2)} tone="var(--teal)" />
          <VizReadout
            label={t("readout.omega")}
            value={`Ω ${omega.toFixed(1)}`}
            note={accreting ? t("verdict.accreting") : t("verdict.dissolving")}
            tone={accreting ? "var(--cyan)" : "var(--magenta)"}
            tinted
          />
          <ul className="mt-1 flex flex-col gap-1">
            {ANCHORS.map((a) => (
              <li key={a.id} className="flex items-baseline gap-2 font-sans text-xs">
                <span aria-hidden className="mt-1 inline-block size-1.5 shrink-0 rounded-full" style={{ backgroundColor: a.tone }} />
                <span className="text-muted">{t(`anchor.${a.id}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </VizFigure>
  );
}
