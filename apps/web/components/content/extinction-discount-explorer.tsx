"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { DEFAULTS, evaluate, surplus } from "./extinction-discount-model";

const W = 340;
const H = 230;
const PAD_L = 40;
const PAD_R = 14;
const PAD_T = 18;
const PAD_B = 34;
const plotW = W - PAD_L - PAD_R;
const plotH = H - PAD_T - PAD_B;

const SAMPLES = 72;

interface ExtinctionDiscountExplorerProps {
  caption?: string;
  className?: string;
}

// Dial the growth rate, the discount rate, the price and the cost of a hunt, and
// watch where a profit-maximising owner chooses to leave the population. Slow
// growth plus impatient capital plus a price that stays high as the stock thins
// moves that choice all the way to zero.
export function ExtinctionDiscountExplorer({
  caption,
  className,
}: ExtinctionDiscountExplorerProps) {
  const uid = useId();
  const t = useTranslations("viz.extinctionDiscount");
  const [r, setR] = useState(DEFAULTS.r);
  const [delta, setDelta] = useState(DEFAULTS.delta);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [cost, setCost] = useState(DEFAULTS.cost);

  const out = useMemo(
    () => evaluate({ ...DEFAULTS, r, delta, price, cost }),
    [r, delta, price, cost],
  );

  const xOf = (n: number) => PAD_L + (n / DEFAULTS.K) * plotW;
  const peakYield = (r * DEFAULTS.K) / 4 || 1;
  const yOf = (y: number) => PAD_T + (1 - y / (peakYield * 1.15)) * plotH;

  // Surplus-production curve: the stock's own annual increase at each abundance.
  const curve = useMemo(() => {
    const params = { ...DEFAULTS, r, delta, price, cost };
    const xFor = (n: number) => PAD_L + (n / DEFAULTS.K) * plotW;
    const peakYield = (r * DEFAULTS.K) / 4 || 1;
    const yOf = (y: number) => PAD_T + (1 - y / (peakYield * 1.15)) * plotH;
    const pts: string[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const n = (i / SAMPLES) * DEFAULTS.K;
      pts.push(`${i === 0 ? "M" : "L"}${xFor(n).toFixed(1)} ${yOf(surplus(params, n)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [r, delta, price, cost]);

  const tone =
    out.verdict === "liquidate"
      ? "var(--magenta)"
      : out.verdict === "deplete"
        ? "var(--amber)"
        : "var(--teal)";
  const figTone =
    out.verdict === "liquidate" ? "magenta" : out.verdict === "deplete" ? "amber" : "teal";
  const impatient = delta > r;

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={impatient ? t("hint.impatient") : t("hint.patient")}
      caption={caption}
      tone={figTone}
      className={className}
      controls={
        <div className="flex w-40 flex-col gap-2 sm:w-52">
          <VizSlider
            label={t("controls.growth")}
            display={`${(r * 100).toFixed(1)}%/yr`}
            min={0.005}
            max={0.2}
            step={0.005}
            value={r}
            onChange={setR}
            tone="var(--teal)"
          />
          <VizSlider
            label={t("controls.discount")}
            display={`${(delta * 100).toFixed(1)}%/yr`}
            min={0.005}
            max={0.3}
            step={0.005}
            value={delta}
            onChange={setDelta}
            tone="var(--magenta)"
          />
          <VizSlider
            label={t("controls.price")}
            display={`${price.toFixed(0)}M`}
            min={2}
            max={200}
            step={2}
            value={price}
            onChange={setPrice}
            tone="var(--amber)"
          />
          <VizSlider
            label={t("controls.cost")}
            display={`${cost.toFixed(1)}M`}
            min={0.2}
            max={12}
            step={0.1}
            value={cost}
            onChange={setCost}
            tone="var(--cyan)"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t(`aria.${out.verdict}`)}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "amber"]} />

          {/* axes */}
          <line
            x1={PAD_L}
            y1={PAD_T + plotH}
            x2={PAD_L + plotW}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD_L}
            y1={PAD_T}
            x2={PAD_L}
            y2={PAD_T + plotH}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizTick x={PAD_L} y={H - 20}>
            0
          </VizTick>
          <VizTick x={xOf(DEFAULTS.K / 2)} y={H - 20}>
            K/2
          </VizTick>
          <VizTick x={PAD_L + plotW} y={H - 20}>
            K
          </VizTick>
          <VizText x={PAD_L + plotW / 2} y={H - 6} size="small" anchor="middle" tone="var(--muted)">
            {t("axis.stock")}
          </VizText>
          <VizText
            x={12}
            y={PAD_T + plotH / 2}
            size="small"
            anchor="middle"
            tone="var(--muted)"
            transform={`rotate(-90 12 ${PAD_T + plotH / 2})`}
          >
            {t("axis.surplus")}
          </VizText>

          {/* the stock's annual surplus production */}
          <path d={curve} fill="none" stroke="var(--teal)" strokeWidth={1.8} strokeOpacity={0.9} />

          {/* K/2 - the biologist's reference point */}
          <line
            x1={xOf(out.nMsy)}
            y1={PAD_T}
            x2={xOf(out.nMsy)}
            y2={PAD_T + plotH}
            stroke="var(--cyan)"
            strokeWidth={1}
            strokeDasharray="3 3"
            strokeOpacity={0.6}
          />
          <VizText x={xOf(out.nMsy) + 4} y={PAD_T + 10} size="micro" tone="cyan">
            {t("marker.msy")}
          </VizText>

          {/* where the owner actually stops */}
          <line
            x1={xOf(out.nStar)}
            y1={PAD_T}
            x2={xOf(out.nStar)}
            y2={PAD_T + plotH}
            stroke={tone}
            strokeWidth={2}
            filter={glowUrl(uid, "bloom")}
          />
          <circle
            cx={xOf(out.nStar)}
            cy={yOf(out.yieldAtOptimum)}
            r={4}
            fill={tone}
            filter={glowUrl(uid, "bloom")}
          />
          <VizText
            x={Math.min(xOf(out.nStar) + 5, W - PAD_R - 60)}
            y={PAD_T + plotH - 8}
            size="micro"
            tone={tone}
          >
            {t("marker.optimum")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.optimum")}
            value={out.nStar < 1 ? "0" : Math.round(out.nStar).toLocaleString("en-US")}
            note={t(`verdict.${out.verdict}`)}
            tone={tone}
            tinted
          />
          <VizReadout
            label={t("readout.msy")}
            value={Math.round(out.nMsy).toLocaleString("en-US")}
            tone="var(--cyan)"
          />
          <VizReadout
            label={t("readout.margin")}
            value={`${delta > r ? "+" : "−"}${(Math.abs(delta - r) * 100).toFixed(1)}%`}
            note={impatient ? t("note.impatient") : t("note.patient")}
            tone={impatient ? "var(--magenta)" : "var(--teal)"}
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
