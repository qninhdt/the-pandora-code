"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// Hurdle 3, the hard one, made visible. Adult tissue keeps its build program
// sealed (canalization) because reopening it without exquisite spatial control
// yields a tumour, not an organ. The reader sets a bioelectric "pattern
// coherence" — how well-organized the voltage blueprint imposed on the patch is
// (Levin's bioelectric morphogenesis). Too low: cells proliferate into a
// disorganized mass. Just right: an organized blastema forms and extends into a
// queue. This dramatizes why a NEW organ on an adult is the speculative leap:
// the window between "nothing happens" and "cancer" is narrow. Deterministic.

const W = 320;
const H = 180;

type Outcome = "dormant" | "tumour" | "organ";

function outcomeFor(coherence: number): Outcome {
  // coherence 0..100. Below ~20 the program never reopens (dormant/safe).
  // 20..70 it reopens WITHOUT enough spatial control -> disorganized growth.
  // Above ~70 the pattern is coherent enough to channel growth into an organ.
  if (coherence < 20) return "dormant";
  if (coherence < 70) return "tumour";
  return "organ";
}

export function OrganogenesisGate({ className }: { className?: string }) {
  const t = useTranslations("viz.organogenesisGate");
  const uid = useId();
  const [coherence, setCoherence] = useState(85);
  const outcome = useMemo(() => outcomeFor(coherence), [coherence]);
  const tone = outcome === "organ" ? "cyan" : outcome === "tumour" ? "magenta" : "teal";
  const toneVar = `var(--${tone})`;

  // A cluster of cells rendered as dots. In "organ" mode they line up along a
  // growing axis; in "tumour" mode they scatter; dormant they sit quiet.
  const cells = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const cx = W / 2;
    const cy = H / 2;
    for (let i = 0; i < 40; i++) {
      // deterministic pseudo-position from index
      const a = (i * 2.399963) % (Math.PI * 2);
      const rr = 8 + (i % 8) * 5;
      if (outcome === "organ") {
        // arrange along a vertical growing queue axis
        const t2 = i / 39;
        pts.push({ x: cx + Math.sin(i) * 6, y: cy + 40 - t2 * 120 });
      } else if (outcome === "tumour") {
        pts.push({ x: cx + Math.cos(a) * rr * 1.4, y: cy + Math.sin(a) * rr });
      } else {
        pts.push({ x: cx + Math.cos(a) * 10, y: cy + Math.sin(a) * 8 });
      }
    }
    return pts;
  }, [outcome]);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      tone={tone}
      hint={t(`hint.${outcome}`)}
      className={className}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full sm:w-3/5"
          role="img"
          aria-label={t("aria")}
        >
          <GlowDefs idBase={uid} tones={["cyan", "magenta", "teal"]} />
          {/* tissue patch baseline */}
          <line
            x1={20}
            y1={H - 24}
            x2={W - 20}
            y2={H - 24}
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
          <VizText x={20} y={H - 10} size="micro" tone="subtle">
            {t("tissueLabel")}
          </VizText>

          {cells.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={outcome === "organ" ? 3 : 4}
              fill={toneVar}
              opacity={outcome === "dormant" ? 0.4 : 0.85}
              filter={outcome === "dormant" ? undefined : glowUrl(uid, "bloom")}
              style={{ transition: "cx 0.3s, cy 0.3s" }}
            />
          ))}

          <VizText x={W / 2} y={20} size="small" tone={tone} anchor="middle">
            {t(`outcome.${outcome}`)}
          </VizText>
        </svg>

        <div className="flex flex-col gap-2 sm:w-2/5">
          <VizReadout
            label={t("outcomeLabel")}
            value={t(`outcome.${outcome}`)}
            tone={toneVar}
            tinted
          />
          <VizSlider
            label={t("coherenceSlider")}
            display={`${coherence}%`}
            min={0}
            max={100}
            step={1}
            value={coherence}
            onChange={setCoherence}
            tone={toneVar}
          />
          <p className="font-sans text-[0.7rem] uppercase tracking-wider text-subtle">
            {t("windowNote")}
          </p>
        </div>
      </div>
    </VizFigure>
  );
}
