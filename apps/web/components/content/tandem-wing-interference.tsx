"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// Two lifting surfaces, one behind the other. The aft wing flies inside the
// forewing's trailing wake, so it meets air already deflected downward and loses
// effective angle of attack. Prandtl's biplane interference coefficient sigma
// governs how much the two surfaces spoil each other; Munk's stagger theorem says
// the induced-drag total barely moves when you slide them fore-and-aft, but
// collapses when you pull them apart vertically. Gap matters, stagger does not.
//
// Total induced drag of the pair, equal spans and equal lift share, expressed
// against a single wing of the same span b carrying the same total lift:
//   D/D_ref = (1 + sigma) / 2
// A single wing of double span (2b) would only cost D_ref/4, so a tandem pair can
// never reach a long single wing - that ratio is the figure's punchline.
// The maths stays in code; strings translate.

const W = 380;
const H = 250;
const PAD_L = 16;
const PAD_R = 14;
const PAD_T = 16;

// Wing geometry in SVG units. Span b is represented by the reference chord scale.
const SPAN_PX = 120; // stands in for span b when scaling gap/stagger
const CHORD = 44;
const FORE_X = 78;
const FORE_Y = 96;

const ALPHA_GEOM = 6; // degrees of geometric angle of attack on both surfaces
const CL_FORE = 0.8; // forewing operating lift coefficient
const AR_FORE = 6; // forewing aspect ratio

// Prandtl's interference factor for equal-span surfaces at vertical gap h/b.
// Approaches ~0.95 when coplanar (maximum mutual spoiling) and decays as the
// surfaces separate vertically.
function interference(gapRatio: number): number {
  return (1 - 0.66 * gapRatio) / (1.05 + 3.7 * gapRatio);
}

// Downwash angle the aft surface meets, in degrees. Grows with distance
// downstream (the wake sheet rolls up and steepens toward twice the forewing's
// own induced angle) and fades as the aft surface climbs clear of the sheet.
function downwashAngle(gapRatio: number, staggerRatio: number): number {
  const alphaInduced = ((CL_FORE / (Math.PI * AR_FORE)) * 180) / Math.PI;
  const streamwise = 0.5 * (1 + staggerRatio / Math.sqrt(staggerRatio ** 2 + 0.25));
  const clearance = 1 / (1 + (2.2 * gapRatio) ** 2);
  return 2 * alphaInduced * streamwise * clearance;
}

interface TandemWingInterferenceProps {
  caption?: string;
  className?: string;
}

export function TandemWingInterference({ caption, className }: TandemWingInterferenceProps) {
  const t = useTranslations("viz.tandem-wing");
  const uid = useId();
  const [gapRatio, setGapRatio] = useState(0.05);
  const [staggerRatio, setStaggerRatio] = useState(0.55);

  const sigma = interference(gapRatio);
  const epsilon = downwashAngle(gapRatio, staggerRatio);
  const aftLoss = Math.min(100, (epsilon / ALPHA_GEOM) * 100);
  // Against a single wing of double span, which is what the pair is really
  // competing with: (1+sigma)/2 divided by 1/4.
  const dragVsLongWing = 2 * (1 + sigma);

  const verdict = sigma > 0.6 ? "spoiled" : sigma > 0.35 ? "partial" : "cleared";
  const tone =
    verdict === "spoiled"
      ? "var(--magenta)"
      : verdict === "partial"
        ? "var(--amber)"
        : "var(--teal)";
  const figTone: "magenta" | "amber" | "teal" =
    verdict === "spoiled" ? "magenta" : verdict === "partial" ? "amber" : "teal";

  const gapPx = gapRatio * SPAN_PX;
  const staggerPx = staggerRatio * SPAN_PX;
  const aftX = FORE_X + CHORD + staggerPx;
  const aftY = FORE_Y - gapPx;

  // The wake sheet leaves the forewing trailing edge and sinks as it travels.
  const wakeStartX = FORE_X + CHORD;
  const wakeEndX = PAD_L + (W - PAD_L - PAD_R) - 6;
  const wakeSink = 26;
  const wakePath = `M ${wakeStartX} ${FORE_Y} C ${wakeStartX + 40} ${FORE_Y + wakeSink * 0.5}, ${wakeEndX - 50} ${FORE_Y + wakeSink}, ${wakeEndX} ${FORE_Y + wakeSink}`;

  // A thin cambered aerofoil in side elevation, nose at (x, y).
  const foil = (x: number, y: number) =>
    `M ${x} ${y} C ${x + CHORD * 0.3} ${y - 7}, ${x + CHORD * 0.7} ${y - 6}, ${x + CHORD} ${y - 1} C ${x + CHORD * 0.7} ${y + 1}, ${x + CHORD * 0.35} ${y + 3}, ${x} ${y} Z`;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`hint.${verdict}`)}
      caption={caption}
      tone={figTone}
      className={className}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full md:w-3/5"
          role="img"
          aria-label={t(`aria.${verdict}`)}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "amber", "magenta"]} />

          {/* oncoming airflow */}
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1={PAD_L}
              y1={FORE_Y - 22 + i * 22}
              x2={FORE_X - 8}
              y2={FORE_Y - 22 + i * 22}
              stroke="var(--cyan)"
              strokeOpacity={0.35}
              strokeWidth={1}
              strokeDasharray="5 4"
            />
          ))}
          <VizText x={PAD_L} y={FORE_Y - 32} size="micro" tone="subtle">
            {t("freestream")}
          </VizText>

          {/* the forewing's wake sheet, sinking as it goes downstream */}
          <path
            d={wakePath}
            fill="none"
            stroke="var(--magenta)"
            strokeOpacity={0.5}
            strokeWidth={1.6}
            strokeDasharray="4 3"
          />
          <VizText x={wakeEndX} y={FORE_Y + wakeSink + 13} size="micro" tone="subtle" anchor="end">
            {t("wakeSheet")}
          </VizText>

          {/* forewing */}
          <path d={foil(FORE_X, FORE_Y)} fill="var(--cyan)" fillOpacity={0.85} />
          <VizText x={FORE_X + CHORD / 2} y={FORE_Y - 14} size="micro" tone="cyan" anchor="middle">
            {t("forewing")}
          </VizText>

          {/* aft wing, displaced by stagger and gap */}
          <path
            d={foil(aftX, aftY)}
            fill={tone}
            fillOpacity={0.85}
            filter={glowUrl(uid, "bloom")}
          />
          <VizText x={aftX + CHORD / 2} y={aftY - 14} size="micro" tone={tone} anchor="middle">
            {t("aftwing")}
          </VizText>

          {/* gap dimension */}
          <line
            x1={aftX + CHORD + 8}
            y1={aftY}
            x2={aftX + CHORD + 8}
            y2={FORE_Y}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizText x={aftX + CHORD + 12} y={(aftY + FORE_Y) / 2 + 3} size="micro" tone="subtle">
            {t("gapMark")}
          </VizText>

          {/* stagger dimension */}
          <line
            x1={FORE_X + CHORD}
            y1={FORE_Y + 40}
            x2={aftX}
            y2={FORE_Y + 40}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizText
            x={(FORE_X + CHORD + aftX) / 2}
            y={FORE_Y + 52}
            size="micro"
            tone="subtle"
            anchor="middle"
          >
            {t("staggerMark")}
          </VizText>

          {/* downwash arrows striking the aft wing, scaled by the deficit */}
          {epsilon > 0.15 &&
            [0, 1].map((i) => {
              const ax = aftX + 10 + i * 20;
              const len = 8 + epsilon * 3.2;
              return (
                <line
                  key={i}
                  x1={ax}
                  y1={aftY - 26}
                  x2={ax}
                  y2={aftY - 26 + len}
                  stroke="var(--magenta)"
                  strokeWidth={1.6}
                  strokeOpacity={0.75}
                  markerEnd=""
                />
              );
            })}

          {/* drag comparison strip */}
          <line
            x1={PAD_L}
            y1={H - 62}
            x2={W - PAD_R}
            y2={H - 62}
            stroke="var(--border)"
            strokeWidth={1}
          />
          <VizText x={PAD_L} y={H - 50} size="micro" tone="subtle">
            {t("dragStrip")}
          </VizText>
          {(() => {
            const barY = H - 40;
            const barH = 11;
            const maxRatio = 4;
            const fullW = W - PAD_L - PAD_R - 96;
            const rows: { key: string; ratio: number; hue: string }[] = [
              { key: "longWing", ratio: 1, hue: "var(--teal)" },
              { key: "tandem", ratio: dragVsLongWing, hue: tone },
            ];
            return rows.map((r, i) => (
              <g key={r.key}>
                <rect
                  x={PAD_L + 90}
                  y={barY + i * (barH + 7)}
                  width={Math.min(fullW, (r.ratio / maxRatio) * fullW)}
                  height={barH}
                  rx={3}
                  fill={r.hue}
                  fillOpacity={0.55}
                />
                <VizText x={PAD_L} y={barY + i * (barH + 7) + barH - 2} size="micro" tone="subtle">
                  {t(`bar.${r.key}`)}
                </VizText>
                <VizText
                  x={PAD_L + 94 + Math.min(fullW, (r.ratio / maxRatio) * fullW)}
                  y={barY + i * (barH + 7) + barH - 2}
                  size="micro"
                  tone={r.hue}
                  numeric
                >
                  {t("times", { n: r.ratio.toFixed(1) })}
                </VizText>
              </g>
            ));
          })()}
        </svg>

        <div className="flex w-full flex-col gap-2 md:w-2/5">
          <VizSlider
            label={t("gapLabel")}
            display={gapRatio.toFixed(2)}
            min={0}
            max={0.6}
            step={0.01}
            value={gapRatio}
            onChange={setGapRatio}
            tone={tone}
          />
          <VizSlider
            label={t("staggerLabel")}
            display={staggerRatio.toFixed(2)}
            min={0}
            max={1.1}
            step={0.01}
            value={staggerRatio}
            onChange={setStaggerRatio}
            tone="var(--cyan)"
          />
          <VizReadout label={t("readout.sigma")} value={sigma.toFixed(2)} tone={tone} />
          <VizReadout
            label={t("readout.aftLoss")}
            value={`${Math.round(aftLoss)}%`}
            note={t(`aftNote.${verdict}`)}
            tone={tone}
          />
          <VizReadout
            label={t("readout.drag")}
            value={t("times", { n: dragVsLongWing.toFixed(1) })}
            note={t("dragNote")}
            tone={tone}
            tinted
          />
        </div>
      </div>
    </VizFigure>
  );
}
