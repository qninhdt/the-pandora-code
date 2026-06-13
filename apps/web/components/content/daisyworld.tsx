"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import {
  L_MAX,
  L_MIN,
  T_OPT,
  bareTempC,
  solveDaisyworld,
  temperatureCurves,
} from "./daisyworld-model";

interface DaisyworldProps {
  caption?: string;
  className?: string;
}

// Plot geometry in fixed SVG user units so the figure stays crisp at any width.
const VIEW_W = 460;
const VIEW_H = 250;
const PAD = { left: 40, right: 14, top: 18, bottom: 34 };
const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;

// Temperature axis range (°C) the plot spans vertically.
const T_MIN = -15;
const T_MAX = 80;

const DEFAULT_L = 1.0; // start at Sun-like luminosity

function lx(l: number): number {
  return PAD.left + ((l - L_MIN) / (L_MAX - L_MIN)) * PLOT_W;
}
function ty(tempC: number): number {
  const clamped = Math.max(T_MIN, Math.min(T_MAX, tempC));
  return PAD.top + (1 - (clamped - T_MIN) / (T_MAX - T_MIN)) * PLOT_H;
}

function pathFrom(points: { x: number; y: number }[]): string {
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
}

// Lovelock & Watson's Daisyworld, made drivable. The reader slides the sun from
// dim to blazing; the regulated curve (a planet with daisies) holds nearly flat
// across a wide band while the bare-rock curve climbs straight through it. Black
// daisies dominate the cold early world and warm it; white daisies take the hot
// late world and cool it — homeostasis from selfish competition, no controller.
// Pure SVG + range input: deterministic on the server, no motion, reduced-motion
// safe by construction.
export function Daisyworld({ caption, className }: DaisyworldProps) {
  const t = useTranslations("viz.daisyworld");
  const uid = useId();
  const [luminosity, setLuminosity] = useState(DEFAULT_L);

  const curves = useMemo(() => temperatureCurves(64), []);
  const regulatedPath = useMemo(
    () => pathFrom(curves.map((c) => ({ x: lx(c.l), y: ty(c.regulated) }))),
    [curves],
  );
  const barePath = useMemo(
    () => pathFrom(curves.map((c) => ({ x: lx(c.l), y: ty(c.bare) }))),
    [curves],
  );

  const state = solveDaisyworld(luminosity);
  const bare = bareTempC(luminosity);
  const lifeCover = state.black + state.white;
  const alive = lifeCover > 0.05;

  // How tightly is the planet regulated right now? Gap between living and bare.
  const regulationGap = bare - state.tempC;
  const verdict = !alive
    ? t("dead")
    : Math.abs(state.tempC - T_OPT) < 8
      ? t("regulated")
      : t("struggling");
  const verdictTone = !alive ? "--amber" : Math.abs(state.tempC - T_OPT) < 8 ? "--teal" : "--cyan";

  const cx = lx(luminosity);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      hint={alive ? t("hintAlive") : t("hintDead")}
      tone="teal"
      className={className}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber"]} />

          {/* grid backdrop */}
          <rect
            x={PAD.left}
            y={PAD.top}
            width={PLOT_W}
            height={PLOT_H}
            fill={glowUrl(uid, "grid")}
            opacity={0.5}
          />

          {/* the comfortable-temperature band the daisies prefer */}
          <rect
            x={PAD.left}
            y={ty(T_OPT + 12)}
            width={PLOT_W}
            height={ty(T_OPT - 12) - ty(T_OPT + 12)}
            fill="color-mix(in oklab, var(--teal) 14%, transparent)"
          />
          <VizText x={PAD.left + 4} y={ty(T_OPT) - 3} size="micro" tone="teal">
            {t("comfortBand")}
          </VizText>

          {/* axes */}
          <line
            x1={PAD.left}
            y1={PAD.top}
            x2={PAD.left}
            y2={PAD.top + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <line
            x1={PAD.left}
            y1={PAD.top + PLOT_H}
            x2={PAD.left + PLOT_W}
            y2={PAD.top + PLOT_H}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />

          {/* y ticks */}
          {[0, 25, 50, 75].map((tk) => (
            <g key={tk}>
              <line
                x1={PAD.left - 3}
                y1={ty(tk)}
                x2={PAD.left}
                y2={ty(tk)}
                stroke="var(--border-strong)"
                strokeWidth={1}
              />
              <VizTick x={PAD.left - 7} y={ty(tk) + 4} anchor="end">
                {tk}
              </VizTick>
            </g>
          ))}
          <VizText
            x={PAD.left - 30}
            y={PAD.top + PLOT_H / 2}
            size="micro"
            tone="subtle"
            anchor="middle"
            transform={`rotate(-90 ${PAD.left - 30} ${PAD.top + PLOT_H / 2})`}
          >
            {t("tempAxis")}
          </VizText>
          <VizText
            x={PAD.left + PLOT_W / 2}
            y={VIEW_H - 4}
            size="micro"
            tone="subtle"
            anchor="middle"
          >
            {t("lumAxis")}
          </VizText>

          {/* bare-rock curve — the lifeless world, climbing straight up */}
          <path
            d={barePath}
            fill="none"
            stroke="var(--border-strong)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <VizText
            x={lx(L_MAX) - 4}
            y={ty(bareTempC(L_MAX)) - 6}
            size="micro"
            tone="subtle"
            anchor="end"
          >
            {t("bareLine")}
          </VizText>

          {/* regulated curve — the living world, held nearly flat */}
          <path
            d={regulatedPath}
            fill="none"
            stroke="var(--teal)"
            strokeWidth={2.4}
            filter={glowUrl(uid, "bloom")}
          />

          {/* current-luminosity marker line + dots on both curves */}
          <line
            x1={cx}
            y1={PAD.top}
            x2={cx}
            y2={PAD.top + PLOT_H}
            stroke="var(--amber)"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <circle cx={cx} cy={ty(bare)} r={3.5} fill="var(--border-strong)" />
          <circle
            cx={cx}
            cy={ty(state.tempC)}
            r={5}
            fill={`var(${verdictTone})`}
            filter={glowUrl(uid, "bloom")}
          />
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout
            label={t("planetTemp")}
            value={`${state.tempC.toFixed(1)}°C`}
            tone={`var(${verdictTone})`}
            tinted={alive}
            note={alive ? `${t("bareWould")}: ${bare.toFixed(0)}°C` : undefined}
          />
          <VizReadout
            label={t("verdictLabel")}
            value={verdict}
            tone={`var(${verdictTone})`}
            tinted={alive}
            note={alive ? `${t("heldBy")}: ${regulationGap.toFixed(0)}°C` : undefined}
          />
          {/* daisy population bars — black seizes cold worlds, white the hot */}
          <div className="rounded-lg border border-border px-3 py-2">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-sans text-xs text-muted">{t("blackDaisy")}</span>
              <span className="font-display text-sm font-700 tabular-nums text-foreground">
                {Math.round(state.black * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-void/60">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${state.black * 100}%`,
                  background: "var(--foreground)",
                  opacity: 0.55,
                }}
              />
            </div>
            <div className="mb-1 mt-2 flex items-baseline justify-between">
              <span className="font-sans text-xs text-muted">{t("whiteDaisy")}</span>
              <span
                className="font-display text-sm font-700 tabular-nums"
                style={{ color: "var(--cyan)" }}
              >
                {Math.round(state.white * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-void/60">
              <div
                className="h-full rounded-full"
                style={{ width: `${state.white * 100}%`, background: "var(--cyan)" }}
              />
            </div>
          </div>
          <VizSlider
            label={t("lumSlider")}
            display={`${luminosity.toFixed(2)} L☉`}
            min={L_MIN}
            max={L_MAX}
            step={0.01}
            value={luminosity}
            onChange={setLuminosity}
            tone="var(--amber)"
            className="mt-1"
          />
        </div>
      </div>
    </VizFigure>
  );
}
