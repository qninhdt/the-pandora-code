"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { SegmentedToggle } from "@/components/content/viz/segmented-toggle";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { useReducedMotionSafe } from "@/components/motion/use-reduced-motion-safe";
import { cn } from "@/lib/utils";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  PHOS_CAP,
  type Partner,
  TRUST_START,
  type TradeResult,
  cubicAt,
  tradeStep,
} from "./mycorrhizal-market-model";

// Kiers' biological market, made tangible and repeatable. The reader plays the
// plant: choose how much carbon to pay a fungal partner and whether that partner
// is generous or a cheat, then run the trade round after round. An honest partner
// fairly paid grows more generous (trust compounds); underpay it and it cools;
// a cheat hoards no matter what and the plant learns to starve it. Reciprocal
// reward and sanction keep the deal fair with nobody coordinating it — the point
// the figure should make the reader *feel* over time, not read in a caption.
// Trade math lives in mycorrhizal-market-model.ts; all strings come from i18n.

const W = 320;
const H = 180;
const PLANT_X = 64;
const FUNGUS_X = W - 64;
const MID_Y = 78;
// Carbon arc (plant→fungus) and phosphorus arc (fungus→plant) control points.
const CARBON_ARC: [number, number][] = [
  [PLANT_X, MID_Y - 10],
  [W / 2, MID_Y - 38],
  [W / 2, MID_Y - 38],
  [FUNGUS_X, MID_Y - 10],
];
const PHOS_ARC: [number, number][] = [
  [FUNGUS_X, MID_Y + 10],
  [W / 2, MID_Y + 38],
  [W / 2, MID_Y + 38],
  [PLANT_X, MID_Y + 10],
];
const HISTORY_MAX = 12;

interface MarketState {
  trust: number;
  round: number;
  net: number;
  phosphorus: number;
  verdict: TradeResult["verdict"];
  history: number[]; // net benefit per round, for the sparkline
}

const initialState: MarketState = {
  trust: TRUST_START,
  round: 0,
  net: 0,
  phosphorus: 0,
  verdict: "reward",
  history: [],
};

export function MycorrhizalMarket({ className }: { className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.mycorrhizalMarket");
  const reduced = useReducedMotionSafe();

  const [carbon, setCarbon] = useState(60); // 0..100 sugar paid per round
  const [partner, setPartner] = useState<Partner>("generous");
  const [state, setState] = useState<MarketState>(initialState);
  const [playing, setPlaying] = useState(false);

  // Flow particles animate along the arcs while the market is live.
  const { phase } = usePhaseLoop({ period: 2.4, playing: playing && !reduced, initial: 0 });

  // Commit one trade round, advancing trust and the net-benefit history.
  const runRound = useCallback(() => {
    setState((s) => {
      const r = tradeStep(s.trust, carbon, partner);
      return {
        trust: r.trust,
        round: s.round + 1,
        net: r.net,
        phosphorus: r.phosphorus,
        verdict: r.verdict,
        history: [...s.history, r.net].slice(-HISTORY_MAX),
      };
    });
  }, [carbon, partner]);

  const reset = useCallback(() => {
    setPlaying(false);
    setState(initialState);
  }, []);

  // While playing, commit a trade round on a steady interval. The phase loop
  // above only drives the visual flow particles; rounds advance here so trust
  // and history mutate exactly once per beat (never during render).
  useEffect(() => {
    if (!playing || reduced) return;
    const id = setInterval(runRound, 1200);
    return () => clearInterval(id);
  }, [playing, reduced, runRound]);

  // Preview of the *next* round at the current dials (what the readouts show
  // before the first commit, and the live target the plant is steering toward).
  const preview = useMemo(
    () => tradeStep(state.trust, carbon, partner),
    [state.trust, carbon, partner],
  );

  const shownPhos = state.round > 0 ? state.phosphorus : preview.phosphorus;
  const shownNet = state.round > 0 ? state.net : preview.net;
  const verdictKey = state.round > 0 ? state.verdict : preview.verdict;
  const goodDeal = shownNet > 0;

  const flowTone = partner === "generous" ? "var(--teal)" : "var(--magenta)";
  const carbonW = Math.max((carbon / 100) * 10, 1.5);
  const phosW = Math.max((shownPhos / PHOS_CAP) * 10, 1.5);

  // Particle counts scale with flow magnitude; positions ride the phase loop.
  const carbonDots = Math.max(2, Math.round(carbon / 22));
  const phosDots = Math.max(2, Math.round(shownPhos / 34));

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={partner === "generous" ? "teal" : "magenta"}
      hint={t(`verdict.${verdictKey}`)}
      className={className}
      controls={
        <div className="flex items-center gap-2">
          <SegmentedToggle<Partner>
            ariaLabel={t("partnerLabel")}
            value={partner}
            onChange={(p) => {
              setPartner(p);
              reset();
            }}
            options={[
              { value: "generous", label: t("generous"), tone: "var(--teal)" },
              { value: "cheat", label: t("cheat"), tone: "var(--magenta)" },
            ]}
          />
          {!reduced && (
            <button
              type="button"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? t("pause") : t("play")}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-void/40 text-teal transition-all hover:border-teal/60 hover:bg-void/70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
            >
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-2/3"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["teal", "magenta", "cyan", "amber"]} />

          {/* carbon flow: plant → fungus (sugar) */}
          <path
            d={`M ${CARBON_ARC[0][0]} ${CARBON_ARC[0][1]} C ${CARBON_ARC[1][0]} ${CARBON_ARC[1][1]}, ${CARBON_ARC[2][0]} ${CARBON_ARC[2][1]}, ${CARBON_ARC[3][0]} ${CARBON_ARC[3][1]}`}
            fill="none"
            stroke="var(--amber)"
            strokeWidth={carbonW}
            strokeOpacity={0.7}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />
          {/* phosphorus flow: fungus → plant (return) */}
          <path
            d={`M ${PHOS_ARC[0][0]} ${PHOS_ARC[0][1]} C ${PHOS_ARC[1][0]} ${PHOS_ARC[1][1]}, ${PHOS_ARC[2][0]} ${PHOS_ARC[2][1]}, ${PHOS_ARC[3][0]} ${PHOS_ARC[3][1]}`}
            fill="none"
            stroke={flowTone}
            strokeWidth={phosW}
            strokeOpacity={0.75}
            strokeLinecap="round"
            filter={glowUrl(uid, "bloom")}
          />

          {/* travelling trade particles (frozen at rest under reduced motion) */}
          {Array.from({ length: carbonDots }, (_, i) => {
            const tt = (phase + i / carbonDots) % 1;
            const pt = cubicAt(CARBON_ARC[0], CARBON_ARC[1], CARBON_ARC[2], CARBON_ARC[3], tt);
            return (
              <circle
                key={`c-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={2.4}
                fill="var(--amber)"
                filter={glowUrl(uid, "bloom")}
              />
            );
          })}
          {Array.from({ length: phosDots }, (_, i) => {
            const tt = (phase + i / phosDots) % 1;
            const pt = cubicAt(PHOS_ARC[0], PHOS_ARC[1], PHOS_ARC[2], PHOS_ARC[3], tt);
            return (
              <circle
                key={`p-${i}`}
                cx={pt.x}
                cy={pt.y}
                r={2.4}
                fill={flowTone}
                filter={glowUrl(uid, "bloom")}
              />
            );
          })}

          {/* plant node */}
          <circle cx={PLANT_X} cy={MID_Y} r={20} fill={glowUrl(uid, "wash-cyan")} />
          <circle
            cx={PLANT_X}
            cy={MID_Y}
            r={13}
            fill="var(--cyan)"
            fillOpacity={0.9}
            filter={glowUrl(uid, "bloom")}
          />
          <text
            x={PLANT_X}
            y={MID_Y + 38}
            textAnchor="middle"
            className="font-sans"
            style={{ fill: "var(--muted)", fontSize: 12, fontWeight: 600 }}
          >
            {t("plant")}
          </text>

          {/* fungus node — radius swells with trust to show the relationship warming */}
          <circle
            cx={FUNGUS_X}
            cy={MID_Y}
            r={20}
            fill={glowUrl(uid, `wash-${partner === "generous" ? "teal" : "magenta"}`)}
          />
          <circle
            cx={FUNGUS_X}
            cy={MID_Y}
            r={11 + state.trust * 5}
            fill={flowTone}
            fillOpacity={0.9}
            filter={glowUrl(uid, "bloom")}
          />
          <text
            x={FUNGUS_X}
            y={MID_Y + 38}
            textAnchor="middle"
            className="font-sans"
            style={{ fill: "var(--muted)", fontSize: 12, fontWeight: 600 }}
          >
            {t("fungus")}
          </text>

          <text
            x={W / 2}
            y={MID_Y - 30}
            textAnchor="middle"
            className="font-sans"
            style={{ fill: "var(--amber)", fontSize: 11, fontWeight: 600 }}
          >
            {t("carbonFlow")}
          </text>
          <text
            x={W / 2}
            y={MID_Y + 44}
            textAnchor="middle"
            className="font-sans"
            style={{ fill: flowTone, fontSize: 11, fontWeight: 600 }}
          >
            {t("phosphorusFlow")}
          </text>
        </svg>

        <div className="flex flex-col gap-2 sm:w-1/3">
          <VizReadout label={t("phosphorusBack")} value={shownPhos} tone={flowTone} />
          <VizReadout
            label={t("netLabel")}
            value={`${shownNet > 0 ? "+" : ""}${shownNet}`}
            tone={goodDeal ? "var(--teal)" : "var(--magenta)"}
            tinted
          />
          <VizReadout
            label={t("trust")}
            value={`${Math.round(state.trust * 100)}%`}
            tone={partner === "generous" ? "var(--teal)" : "var(--magenta)"}
            note={`${t("round")} ${state.round}`}
          />
          <NetSparkline history={state.history} tone={flowTone} label={t("historyLabel")} />
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block font-sans text-xs uppercase tracking-wider text-subtle">
          {t("carbonSlider")} · {carbon}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={carbon}
          onChange={(e) => setCarbon(Number(e.target.value))}
          aria-label={t("carbonSlider")}
          className={cn(
            "viz-range w-full cursor-pointer rounded-full outline-none",
            "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
          )}
          style={{
            background: `linear-gradient(to right, var(--amber) ${carbon}%, var(--border) ${carbon}%)`,
            ["--viz-thumb" as string]: "var(--amber)",
          }}
        />
      </label>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={runRound}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-void/40 px-3 py-2 font-sans text-xs font-600 text-foreground transition-all hover:border-teal/60 hover:bg-void/70 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <StepForward size={13} /> {t("step")}
        </button>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-sans text-xs font-600 text-subtle transition-all hover:text-foreground active:scale-95"
        >
          <RotateCcw size={13} /> {t("reset")}
        </button>
      </div>
    </VizFigure>
  );
}

// Tiny inline sparkline of net benefit per round — green above the zero line,
// magenta below, so a souring relationship reads at a glance.
function NetSparkline({
  history,
  tone,
  label,
}: { history: number[]; tone: string; label: string }) {
  const w = 120;
  const h = 34;
  if (history.length < 2) {
    return (
      <div className="rounded-lg border border-border px-3 py-2">
        <span className="font-sans text-xs text-muted">{label}</span>
        <p className="mt-1 font-sans text-[0.7rem] uppercase tracking-wider text-subtle">—</p>
      </div>
    );
  }
  const max = Math.max(1, ...history.map((v) => Math.abs(v)));
  const stepX = w / (history.length - 1);
  const y = (v: number) => h / 2 - (v / max) * (h / 2 - 3);
  const d = history.map((v, i) => `${i === 0 ? "M" : "L"} ${i * stepX} ${y(v)}`).join(" ");
  return (
    <div className="rounded-lg border border-border px-3 py-2">
      <span className="font-sans text-xs text-muted">{label}</span>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-1 w-full" role="img" aria-label={label}>
        <line
          x1={0}
          y1={h / 2}
          x2={w}
          y2={h / 2}
          stroke="var(--border)"
          strokeWidth={0.5}
          strokeDasharray="2 2"
        />
        <path d={d} fill="none" stroke={tone} strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
}
