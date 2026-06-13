"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

interface FlightCeilingLabProps {
  caption?: string;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────
// SCIENCE MODEL
// Power supply from muscle scales as M^0.73.
// Power demanded by flight scales as M^1.17.
// Where demand crosses supply = flight ceiling (heaviest possible flier).
// Pandora's lower gravity (0.8) and dense air (1.2) reduce the power
// demanded, sliding the crossing point to a heavier mass.
// ─────────────────────────────────────────────────────────────────────

const SUPPLY_EXP = 0.73;
const DEMAND_EXP = 1.17;
const SUPPLY_K = 4.2;
const DEMAND_K_EARTH = 0.95;

function supply(m: number): number {
  return SUPPLY_K * m ** SUPPLY_EXP;
}

function demand(m: number, g: number, rho: number): number {
  // Demand scales with g^1.5 / sqrt(rho)
  const gFactor = Math.pow(g, 1.5);
  const rhoFactor = 1 / Math.sqrt(rho);
  return DEMAND_K_EARTH * gFactor * rhoFactor * m ** DEMAND_EXP;
}

function ceilingMass(g: number, rho: number): number {
  // SUPPLY_K * M^0.73 = D_K * M^1.17 => M^0.44 = SUPPLY_K / D_K
  const dk = (DEMAND_K_EARTH * Math.pow(g, 1.5)) / Math.sqrt(rho);
  return Math.pow(SUPPLY_K / dk, 1 / (DEMAND_EXP - SUPPLY_EXP));
}

// Pre-defined presets
const PRESETS = {
  earth: { g: 1.0, rho: 1.0 },
  pandora: { g: 0.8, rho: 1.2 },
};

// Real animal masses
const ANIMALS = [
  { key: "sparrow", m: 0.03, yOffset: -12 },
  { key: "swan", m: 12, yOffset: 12 },
  { key: "argentavis", m: 72, yOffset: -12 },
  { key: "quetz", m: 250, yOffset: 12 },
  { key: "ikran", m: 450, yOffset: -12 },
  { key: "toruk", m: 800, yOffset: 12 },
];

const W_SVG = 380;
const H_SVG = 220;
const PAD_L = 20;
const PAD_R = 20;
const PAD_T = 20;
const PAD_B = 24;
const MASS_MAX = 900; // kg

export function FlightCeilingLab({ caption, className }: FlightCeilingLabProps) {
  const uid = useId();
  const t = useTranslations("viz.flightLab");
  const [mode, setMode] = useState<"earth" | "pandora" | "custom">("pandora");
  const [customG, setCustomG] = useState(0.8);
  const [customRho, setCustomRho] = useState(1.2);

  const g = mode === "custom" ? customG : PRESETS[mode].g;
  const rho = mode === "custom" ? customRho : PRESETS[mode].rho;

  const ceiling = ceilingMass(g, rho);
  const pMax = supply(MASS_MAX) * 1.2;

  const xFor = (m: number) => PAD_L + (m / MASS_MAX) * (W_SVG - PAD_L - PAD_R);
  const yFor = (p: number) => H_SVG - PAD_B - (p / pMax) * (H_SVG - PAD_T - PAD_B);

  // Supply curve (teal)
  const supplyPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const m = (i / 50) * MASS_MAX;
      pts.push(`${i === 0 ? "M" : "L"} ${xFor(m).toFixed(1)} ${yFor(supply(m)).toFixed(1)}`);
    }
    return pts.join(" ");
  }, [pMax]);

  // Demand curve (amber)
  const demandPath = useMemo(() => {
    const pts: string[] = [];
    for (let i = 0; i <= 50; i++) {
      const m = (i / 50) * MASS_MAX;
      pts.push(
        `${i === 0 ? "M" : "L"} ${xFor(m).toFixed(1)} ${yFor(demand(m, g, rho)).toFixed(1)}`,
      );
    }
    return pts.join(" ");
  }, [g, rho, pMax]);

  // Surplus glow (the area between the curves before crossing)
  const surplusPath = useMemo(() => {
    const limit = Math.min(ceiling, MASS_MAX);
    const top: string[] = [];
    const bot: string[] = [];
    for (let i = 0; i <= 30; i++) {
      const m = (i / 30) * limit;
      top.push(`${i === 0 ? "M" : "L"} ${xFor(m).toFixed(1)} ${yFor(supply(m)).toFixed(1)}`);
      bot.unshift(`L ${xFor(m).toFixed(1)} ${yFor(demand(m, g, rho)).toFixed(1)}`);
    }
    return top.join(" ") + " " + bot.join(" ") + " Z";
  }, [ceiling, g, rho, pMax]);

  const cx = xFor(ceiling);
  const cy = yFor(supply(ceiling));

  return (
    <VizFigure
      title={t("title")}
      hint={t("hint")}
      caption={caption}
      tone="amber"
      className={className}
      controls={
        <SegmentedToggle
          ariaLabel={t("mode")}
          value={mode}
          onChange={(v) => {
            setMode(v);
            if (v !== "custom") {
              setCustomG(PRESETS[v].g);
              setCustomRho(PRESETS[v].rho);
            }
          }}
          options={[
            { value: "earth", label: t("earth"), tone: "var(--cyan)" },
            { value: "pandora", label: t("pandora"), tone: "var(--teal)" },
            { value: "custom", label: t("custom"), tone: "var(--amber)" },
          ]}
        />
      }
    >
      <svg viewBox={`0 0 ${W_SVG} ${H_SVG}`} className="w-full" role="img" aria-label={t("title")}>
        <GlowDefs idBase={uid} tones={["teal", "amber", "cyan"]} />

        <rect
          x={PAD_L}
          y={PAD_T}
          width={W_SVG - PAD_L - PAD_R}
          height={H_SVG - PAD_T - PAD_B}
          fill={glowUrl(uid, "grid")}
          opacity={0.5}
        />

        <line
          x1={PAD_L}
          y1={H_SVG - PAD_B}
          x2={W_SVG - PAD_R}
          y2={H_SVG - PAD_B}
          stroke="var(--border-strong)"
          strokeWidth={1}
        />
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={H_SVG - PAD_B}
          stroke="var(--border-strong)"
          strokeWidth={1}
        />

        {/* Surplus glow */}
        <path
          d={surplusPath}
          fill="color-mix(in oklab, var(--teal) 15%, transparent)"
          stroke="none"
          filter={glowUrl(uid, "bloom")}
          style={{ transition: "d 0.5s ease" }}
        />

        {/* Curves */}
        <path
          d={supplyPath}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={2.5}
          filter={glowUrl(uid, "bloom")}
        />
        <path
          d={demandPath}
          fill="none"
          stroke="var(--amber)"
          strokeWidth={2.5}
          filter={glowUrl(uid, "bloom")}
          style={{ transition: "d 0.5s ease" }}
        />

        {/* Crossing marker */}
        {cx <= W_SVG - PAD_R && (
          <g style={{ transition: "transform 0.5s ease" }} transform={`translate(${cx},0)`}>
            <line
              x1={0}
              y1={PAD_T}
              x2={0}
              y2={H_SVG - PAD_B}
              stroke="var(--cyan)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              strokeOpacity={0.8}
            />
            <circle cx={0} cy={cy} r={6} fill="var(--cyan)" filter={glowUrl(uid, "bloom-strong")} />
            <VizText x={-6} y={PAD_T + 12} size="micro" tone="cyan" weight={700} anchor="end">
              {t("ceiling")}
            </VizText>
          </g>
        )}

        {/* Animals */}
        {ANIMALS.map((a) => {
          const ax = xFor(a.m);
          const isGrounded = a.m > ceiling;
          return (
            <g
              key={a.key}
              transform={`translate(${ax}, ${H_SVG - PAD_B})`}
              style={{ transition: "transform 0.5s ease" }}
            >
              <line
                x1={0}
                y1={0}
                x2={0}
                y2={a.yOffset}
                stroke={isGrounded ? "var(--subtle)" : "var(--foreground)"}
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              <VizTick x={0} y={a.yOffset > 0 ? a.yOffset + 10 : a.yOffset - 4} anchor="middle">
                {a.key}
              </VizTick>
              <circle
                cx={0}
                cy={0}
                r={3}
                fill={isGrounded ? "var(--subtle)" : "var(--foreground)"}
              />
            </g>
          );
        })}

        <VizText x={W_SVG - PAD_R} y={H_SVG - PAD_B + 16} size="micro" anchor="end">
          {t("massAxis")}
        </VizText>
      </svg>

      {mode === "custom" && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <VizSlider
            label={t("gLabel")}
            display={`${customG.toFixed(2)}g`}
            min={0.5}
            max={1.5}
            step={0.05}
            value={customG}
            onChange={setCustomG}
            tone="var(--amber)"
          />
          <VizSlider
            label={t("rhoLabel")}
            display={`×${customRho.toFixed(2)}`}
            min={0.5}
            max={2.0}
            step={0.05}
            value={customRho}
            onChange={setCustomRho}
            tone="var(--amber)"
          />
        </div>
      )}

      <VizReadout
        className="mt-4"
        label={t("ceilingLabel")}
        value={`${Math.round(ceiling)} kg`}
        tone="var(--cyan)"
        tinted
      />
    </VizFigure>
  );
}
