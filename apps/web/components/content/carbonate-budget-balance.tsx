"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// ─────────────────────────────────────────────────────────────────────
// THE MODEL — a reef is a balance sheet, not a rock
//
// Net carbonate production (kg CaCO3 m^-2 yr^-1) decides whether the
// platform rises or dissolves:
//
//   NET = (G_coral + G_cca) - (B_erosion + D_chem)
//
// Builders scale with live coral cover and coralline-algal cover; erosion
// scales with grazing + boring intensity. Healthy Indo-Pacific reefs sit
// near +4 to +10; degraded reefs fall to -1.5 to -5 (Perry et al. 2012,
// 2018). Below ~10-15% live cover, losses overrun gains and the reef flips
// to net erosion — the ground the Metkayina stand on starts to lose mass.
// ─────────────────────────────────────────────────────────────────────

// Peak gross rates (kg CaCO3 m^-2 yr^-1) at full cover, from the note's table.
const CORAL_MAX = 15; // gross coral calcification at 100% live cover
const CCA_MAX = 3.5; // gross coralline-algal calcification at full cover
const EROSION_MAX = 8; // combined grazing + boring + dissolution at max pressure

function grossCoral(coverPct: number): number {
  return CORAL_MAX * (coverPct / 100);
}
function grossCca(ccaPct: number): number {
  return CCA_MAX * (ccaPct / 100);
}
function erosion(pressurePct: number): number {
  return EROSION_MAX * (pressurePct / 100);
}

const W = 320;
const H = 240;
const PAD = { l: 44, r: 16, t: 18, b: 40 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;

// Vertical scale runs from -8 to +20 kg so all regimes fit on one axis.
const Y_MIN = -8;
const Y_MAX = 20;
const yOf = (v: number) => PAD.t + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;
const ZERO_Y = yOf(0);

const BARS = [
  { id: "coral", x: 0.16, tone: "var(--cyan)" },
  { id: "cca", x: 0.38, tone: "var(--teal)" },
  { id: "erosion", x: 0.68, tone: "var(--magenta)" },
] as const;

interface CarbonateBudgetBalanceProps {
  caption?: string;
  className?: string;
}

// Scrub coral cover, coralline cover and bioerosion pressure and watch the
// net bar cross zero. The sign of that bar is the whole chapter: a reef that
// builds faster than it is dismantled rises; the reverse dissolves.
export function CarbonateBudgetBalance({ caption, className }: CarbonateBudgetBalanceProps) {
  const uid = useId();
  const t = useTranslations("viz.carbonateBudget");
  const [coral, setCoral] = useState(45); // % live coral cover
  const [cca, setCca] = useState(30); // % crustose coralline algae cover
  const [pressure, setPressure] = useState(35); // % bioerosion pressure

  const gCoral = grossCoral(coral);
  const gCca = grossCca(cca);
  const bEro = erosion(pressure);
  const net = gCoral + gCca - bEro;
  const accreting = net >= 0;

  const barVals: Record<string, number> = { coral: gCoral, cca: gCca, erosion: -bEro };

  const netX = PAD.l + plotW * 0.9;
  const netTone = accreting ? "var(--teal)" : "var(--magenta)";

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={accreting ? t("hint.accreting") : t("hint.eroding")}
      caption={caption}
      tone={accreting ? "teal" : "magenta"}
      className={className}
      controls={
        <div className="flex w-40 flex-col gap-2 sm:w-52">
          <VizSlider
            label={t("controls.coral")}
            display={`${coral}%`}
            min={0}
            max={100}
            step={1}
            value={coral}
            onChange={setCoral}
            tone="var(--cyan)"
          />
          <VizSlider
            label={t("controls.cca")}
            display={`${cca}%`}
            min={0}
            max={100}
            step={1}
            value={cca}
            onChange={setCca}
            tone="var(--teal)"
          />
          <VizSlider
            label={t("controls.pressure")}
            display={`${pressure}%`}
            min={0}
            max={100}
            step={1}
            value={pressure}
            onChange={setPressure}
            tone="var(--magenta)"
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("title")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta"]} />

          {/* zero line — the accrete/erode divide */}
          <line
            x1={PAD.l}
            y1={ZERO_Y}
            x2={PAD.l + plotW}
            y2={ZERO_Y}
            stroke="var(--border-strong)"
            strokeWidth={1.5}
            strokeOpacity={0.7}
          />
          <VizTick x={PAD.l - 8} y={ZERO_Y + 3} anchor="end">
            0
          </VizTick>
          <VizTick x={PAD.l - 8} y={yOf(10) + 3} anchor="end">
            +10
          </VizTick>
          <VizTick x={PAD.l - 8} y={yOf(-5) + 3} anchor="end">
            −5
          </VizTick>

          {/* builder / eroder bars */}
          {BARS.map((b) => {
            const v = barVals[b.id];
            const top = v >= 0 ? yOf(v) : ZERO_Y;
            const h = Math.abs(yOf(v) - ZERO_Y);
            const bx = PAD.l + plotW * b.x - 14;
            return (
              <g key={b.id}>
                <rect
                  x={bx}
                  y={top}
                  width={28}
                  height={Math.max(1, h)}
                  rx={2}
                  fill={b.tone}
                  opacity={0.85}
                />
                <VizText x={bx + 14} y={H - 22} size="small" anchor="middle" tone="var(--muted)">
                  {t(`bar.${b.id}`)}
                </VizText>
              </g>
            );
          })}

          {/* net result bar, glowing */}
          <rect
            x={netX - 15}
            y={net >= 0 ? yOf(net) : ZERO_Y}
            width={30}
            height={Math.max(1, Math.abs(yOf(net) - ZERO_Y))}
            rx={2}
            fill={netTone}
            filter={glowUrl(uid, "bloom")}
          />
          <VizText x={netX} y={H - 22} size="small" anchor="middle" tone={netTone}>
            {t("bar.net")}
          </VizText>
        </svg>

        <div className="flex w-full flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("readout.build")}
            value={`+${(gCoral + gCca).toFixed(1)}`}
            tone="var(--teal)"
          />
          <VizReadout
            label={t("readout.erode")}
            value={`−${bEro.toFixed(1)}`}
            tone="var(--magenta)"
          />
          <VizReadout
            label={t("readout.net")}
            value={`${net >= 0 ? "+" : "−"}${Math.abs(net).toFixed(1)}`}
            note={accreting ? t("verdict.accreting") : t("verdict.eroding")}
            tone={netTone}
            tinted
          />
          <p className="mt-1 font-sans text-xs leading-relaxed text-subtle">{t("units")}</p>
        </div>
      </div>
    </VizFigure>
  );
}
