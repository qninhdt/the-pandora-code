"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

type Hypothesis = "genetic" | "environmental" | "social";
type Verdict = "open" | "weakened" | "supported";

const hypotheses: Hypothesis[] = ["genetic", "environmental", "social"];
const steps = ["pattern", "sharedWater", "geneticOverlap", "socialDiffusion"] as const;
type Step = (typeof steps)[number];

const verdicts: Record<Step, Record<Hypothesis, Verdict>> = {
  pattern: { genetic: "open", environmental: "open", social: "open" },
  sharedWater: { genetic: "open", environmental: "weakened", social: "supported" },
  geneticOverlap: { genetic: "weakened", environmental: "weakened", social: "supported" },
  socialDiffusion: { genetic: "weakened", environmental: "weakened", social: "supported" },
};

const tones: Record<Hypothesis, string> = {
  genetic: "var(--magenta)",
  environmental: "var(--amber)",
  social: "var(--teal)",
};

const nodes = [
  { x: 18, y: 25, group: 0 },
  { x: 31, y: 17, group: 0 },
  { x: 35, y: 36, group: 0 },
  { x: 54, y: 25, group: 1 },
  { x: 67, y: 16, group: 1 },
  { x: 72, y: 35, group: 1 },
  { x: 84, y: 24, group: 1 },
] as const;

const links = [
  [0, 1],
  [0, 2],
  [1, 2],
  [2, 3],
  [3, 4],
  [3, 5],
  [4, 6],
  [5, 6],
] as const;

interface CultureTransmissionLabProps {
  caption?: string;
  className?: string;
}

export function CultureTransmissionLab({ caption, className }: CultureTransmissionLabProps) {
  const t = useTranslations("viz.cultureTransmissionLab");
  const uid = useId();
  const [active, setActive] = useState<Step>("pattern");
  const activeIndex = steps.indexOf(active);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t(`steps.${active}.hint`)}
      caption={caption ?? t("caption")}
      tone="teal"
      className={className}
    >
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
        role="tablist"
        aria-label={t("stepLabel")}
      >
        {steps.map((step, index) => (
          <button
            key={step}
            type="button"
            role="tab"
            aria-selected={active === step}
            aria-controls={`${uid}-panel`}
            onClick={() => setActive(step)}
            className={cn(
              "rounded-xl border px-3 py-2 text-left font-sans text-xs transition-colors",
              active === step
                ? "border-teal/60 bg-teal/10 text-foreground"
                : "border-border bg-void/20 text-muted hover:border-border-strong",
            )}
          >
            <span className="mr-1.5 font-mono text-[0.65rem] text-teal">
              {String(index + 1).padStart(2, "0")}
            </span>
            {t(`steps.${step}.tab`)}
          </button>
        ))}
      </div>

      <div
        id={`${uid}-panel`}
        role="tabpanel"
        className="mt-3 grid gap-3 rounded-xl border border-border bg-void/25 p-3 md:grid-cols-[1.05fr_1fr]"
      >
        <div>
          <svg
            viewBox="0 0 100 54"
            className="w-full"
            role="img"
            aria-label={t(`steps.${active}.aria`)}
          >
            <GlowDefs idBase={uid} tones={["cyan", "teal", "magenta", "amber"]} />
            <path
              d="M 8 45 C 28 39, 43 49, 60 43 S 83 38, 94 44"
              fill="none"
              stroke="var(--cyan)"
              strokeOpacity="0.18"
              strokeWidth="1"
            />
            {links.map(([a, b], index) => {
              const from = nodes[a];
              const to = nodes[b];
              const reached = activeIndex >= 3 || (activeIndex >= 1 && index < 4);
              return (
                <line
                  key={`${a}-${b}`}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={reached ? "var(--teal)" : "var(--border-strong)"}
                  strokeOpacity={reached ? 0.72 : 0.35}
                  strokeWidth={reached ? 1.2 : 0.7}
                  strokeDasharray={reached ? undefined : "2 2"}
                />
              );
            })}
            {nodes.map((node, index) => {
              const learned =
                index === 0 || (activeIndex >= 1 && index <= 3) || (activeIndex >= 3 && index <= 6);
              return (
                <g key={`${node.x}-${node.y}`}>
                  <ellipse
                    cx={node.x}
                    cy={node.y}
                    rx="5.7"
                    ry="2.5"
                    fill={learned ? "var(--teal)" : "var(--surface-raised)"}
                    stroke={learned ? "var(--teal)" : "var(--border-strong)"}
                    strokeWidth="0.8"
                    opacity={learned ? 0.92 : 0.72}
                    filter={learned ? glowUrl(uid, "bloom") : undefined}
                  />
                  <path
                    d={`M ${node.x + 5.2} ${node.y} l 3 -2 l -0.8 2 l 0.8 2 z`}
                    fill={learned ? "var(--teal)" : "var(--surface-raised)"}
                    stroke={learned ? "var(--teal)" : "var(--border-strong)"}
                    strokeWidth="0.5"
                  />
                  {index === 0 && (
                    <circle cx={node.x - 2} cy={node.y - 0.4} r="0.7" fill="var(--amber)" />
                  )}
                </g>
              );
            })}
            <text x="18" y="50" className="fill-muted font-mono text-[3px]">
              {t("observedFirst")}
            </text>
            <text x="67" y="50" textAnchor="middle" className="fill-muted font-mono text-[3px]">
              {t("laterObservers")}
            </text>
          </svg>
          <p className="mt-1 font-serif text-sm leading-relaxed text-foreground/85">
            {t(`steps.${active}.observation`)}
          </p>
        </div>

        <div className="grid gap-2" aria-label={t("hypothesisLabel")}>
          {hypotheses.map((hypothesis) => {
            const verdict = verdicts[active][hypothesis];
            const tone = tones[hypothesis];
            return (
              <div
                key={hypothesis}
                className="rounded-lg border p-3"
                style={{
                  borderColor: `color-mix(in oklab, ${tone} ${verdict === "supported" ? 52 : 24}%, var(--border))`,
                  background: `color-mix(in oklab, ${tone} ${verdict === "supported" ? 9 : 3}%, transparent)`,
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sans text-xs font-semibold" style={{ color: tone }}>
                    {t(`hypotheses.${hypothesis}`)}
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted">
                    {t(`verdicts.${verdict}`)}
                  </span>
                </div>
                <p className="mt-1 font-serif text-xs leading-relaxed text-muted">
                  {t(`steps.${active}.results.${hypothesis}`)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </VizFigure>
  );
}
