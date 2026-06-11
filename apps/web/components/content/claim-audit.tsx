"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { usePhaseLoop } from "@/components/content/viz/use-phase-loop";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

// The honesty spine of the wood-wide-web chapter, audited claim by claim. The
// popular "the forest is connected" story collapses three very different claims
// into one; this figure pulls them apart into three confidence gauges whose
// needles fall the further you go — strong evidence for a shared fungal web,
// thinner evidence for resource transfer, none at all for purposeful sharing.
// Pick a claim to read what the evidence does and does not show. Claim copy
// arrives via props (EN authored in MDX, VI in the translate pass); only the
// chrome and labels come from i18n.

type Verdict = "well-supported" | "demonstrated-under-conditions" | "contested";

// Each verdict maps to an epistemic hue + a 0..1 confidence the gauge fills to.
const verdictTone: Record<Verdict, string> = {
  "well-supported": "var(--real-science)",
  "demonstrated-under-conditions": "var(--inference)",
  contested: "var(--speculation)",
};
const verdictFill: Record<Verdict, number> = {
  "well-supported": 0.92,
  "demonstrated-under-conditions": 0.55,
  contested: 0.18,
};

export interface ClaimRung {
  /** Short name of the claim, e.g. "Physical connection". */
  level: string;
  /** The claim being graded, one sentence. */
  claim: string;
  /** Which of the three confidence bands this claim earns. */
  verdict: Verdict;
  /** What the evidence does show. */
  evidence: string;
  /** The caveat that keeps the claim honest. */
  caution: string;
}

interface ClaimAuditProps {
  rungs?: ClaimRung[];
  caption?: string;
  className?: string;
}

// Default claims (English). The chapter passes its own copy for the second,
// captioned instance; this set backs the first, prop-less usage and the VI file
// overrides both via translated props.
const DEFAULT_RUNGS: ClaimRung[] = [
  {
    level: "Physical connection",
    claim: "One fungus links the roots of many trees at once.",
    verdict: "well-supported",
    evidence:
      "Shown in the lab and seen in the field; a single mycelium colonising several trees is not in doubt.",
    caution:
      "Mapping continuous networks across wild forest is rare, and the links break and regrow constantly.",
  },
  {
    level: "Resource transfer",
    claim: "Carbon, nutrients and water move between trees through the link.",
    verdict: "demonstrated-under-conditions",
    evidence:
      "Isotope tracing proves molecules can cross from one plant to another, sometimes along a source-sink gradient.",
    caution:
      "The amount is often tiny, and it is hard to prove the carbon went through the fungus rather than leaking into soil.",
  },
  {
    level: "Purposeful sharing",
    claim: "Mother trees deliberately nurture kin, sending resources and warnings to seedlings.",
    verdict: "contested",
    evidence: "Hugely popular and influential — the emotional heart of the wood-wide web story.",
    caution:
      "Zero peer-reviewed field evidence supports the kin-directed claim. This is story, not data.",
  },
];

// Gauge geometry — a top semicircle (180°→0°) whose needle sweeps to confidence.
const GW = 132;
const GH = 78;
const GCX = GW / 2;
const GCY = 66;
const GR = 50;

function polar(deg: number): { x: number; y: number } {
  const a = (deg * Math.PI) / 180;
  return { x: GCX + GR * Math.cos(a), y: GCY - GR * Math.sin(a) };
}
// Arc from startDeg down to endDeg over the top of the dial (clockwise sweep).
function arcPath(startDeg: number, endDeg: number): string {
  const s = polar(startDeg);
  const e = polar(endDeg);
  const large = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${GR} ${GR} 0 ${large} 1 ${e.x} ${e.y}`;
}

export function ClaimAudit({ rungs = DEFAULT_RUNGS, caption, className }: ClaimAuditProps) {
  const uid = useId();
  const t = useTranslations("viz.claimAudit");
  const [sel, setSel] = useState(0);
  const active = rungs[sel];
  const c = verdictTone[active.verdict];

  // A slow scan that rides the selected gauge's filled arc — pure enhancement,
  // frozen under reduced motion by usePhaseLoop.
  const { phase } = usePhaseLoop({ period: 2.6, playing: true, initial: 0 });

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      caption={caption}
      tone="cyan"
      hint={t(`hint.${active.verdict}`)}
      className={className}
    >
      {/* gauge cards — click one to audit its evidence */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {rungs.map((r, i) => {
          const tone = verdictTone[r.verdict];
          const conf = verdictFill[r.verdict];
          const isSel = i === sel;
          const endDeg = 180 - 180 * conf;
          const needle = polar(endDeg);
          // scan dot rides the filled arc on the selected card
          const scanDeg = 180 - 180 * conf * phase;
          const scan = polar(scanDeg);
          return (
            <button
              key={r.level}
              type="button"
              aria-pressed={isSel}
              onClick={() => setSel(i)}
              className="group/card relative overflow-hidden rounded-xl border p-3 text-left transition-all"
              style={{
                borderColor: isSel
                  ? `color-mix(in oklab, ${tone} 55%, transparent)`
                  : "var(--border)",
                background: isSel
                  ? `color-mix(in oklab, ${tone} 10%, var(--void))`
                  : "color-mix(in oklab, var(--void) 30%, transparent)",
                boxShadow: isSel ? `0 8px 30px -16px ${tone}` : "none",
              }}
            >
              <svg
                viewBox={`0 0 ${GW} ${GH}`}
                className="w-full"
                role="img"
                aria-label={`${r.level}: ${t(`verdict.${r.verdict}`)}`}
              >
                <GlowDefs idBase={`${uid}-${i}`} tones={["cyan", "teal", "amber", "magenta"]} />
                {/* track */}
                <path
                  d={arcPath(180, 0)}
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth={6}
                  strokeOpacity={0.5}
                  strokeLinecap="round"
                />
                {/* confidence fill */}
                <path
                  d={arcPath(180, endDeg)}
                  fill="none"
                  stroke={tone}
                  strokeWidth={6}
                  strokeOpacity={isSel ? 0.95 : 0.55}
                  strokeLinecap="round"
                  filter={isSel ? glowUrl(`${uid}-${i}`, "bloom") : undefined}
                  style={{ transition: "stroke-opacity 0.25s ease" }}
                />
                {/* needle */}
                <line
                  x1={GCX}
                  y1={GCY}
                  x2={needle.x}
                  y2={needle.y}
                  stroke={tone}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeOpacity={0.9}
                />
                <circle cx={GCX} cy={GCY} r={3.5} fill={tone} />
                {/* scan dot on the selected gauge */}
                {isSel && (
                  <circle
                    cx={scan.x}
                    cy={scan.y}
                    r={3}
                    fill={tone}
                    filter={glowUrl(`${uid}-${i}`, "bloom-strong")}
                  />
                )}
                {/* confidence percentage */}
                <text
                  x={GCX}
                  y={GCY - 12}
                  textAnchor="middle"
                  className="font-display"
                  style={{ fill: tone, fontSize: 17, fontWeight: 700 }}
                >
                  {Math.round(conf * 100)}%
                </text>
              </svg>
              <p
                className="mt-1 font-sans text-xs font-600 leading-snug"
                style={{ color: isSel ? "var(--foreground)" : "var(--muted)" }}
              >
                {r.level}
              </p>
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 font-sans text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{
                  color: tone,
                  background: `color-mix(in oklab, ${tone} 14%, transparent)`,
                  boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tone} 38%, transparent)`,
                }}
              >
                {t(`verdict.${r.verdict}`)}
              </span>
            </button>
          );
        })}
      </div>

      {/* detail panel for the selected claim */}
      <div
        className="mt-3 overflow-hidden rounded-xl border bg-void/30 p-4"
        style={{
          borderColor: `color-mix(in oklab, ${c} 30%, transparent)`,
          boxShadow: `0 0 28px -22px ${c}`,
        }}
      >
        <span className="font-serif text-[0.95rem] leading-snug text-foreground/90">
          {active.claim}
        </span>
        <dl className="mt-3 grid gap-3 border-t border-border/60 pt-3 sm:grid-cols-2">
          <div>
            <dt className="font-sans text-xs uppercase tracking-[0.18em] text-subtle">
              {t("evidenceLabel")}
            </dt>
            <dd className="mt-1 font-serif text-sm leading-relaxed text-foreground/85">
              {active.evidence}
            </dd>
          </div>
          <div>
            <dt
              className="font-sans text-xs uppercase tracking-[0.18em]"
              style={{ color: "var(--magenta)" }}
            >
              {t("cautionLabel")}
            </dt>
            <dd className="mt-1 font-serif text-sm leading-relaxed text-foreground/85">
              {active.caution}
            </dd>
          </div>
        </dl>
      </div>
    </VizFigure>
  );
}
