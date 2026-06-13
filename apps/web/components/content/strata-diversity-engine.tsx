"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizReadout } from "@/components/content/viz/viz-readout";
import { VizSlider } from "@/components/content/viz/viz-slider";
import { VizText, VizTick } from "@/components/content/viz/viz-svg-text";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";

// Deterministic random
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function StrataDiversityEngine({ caption, className }: { caption?: string; className?: string }) {
  const uid = useId();
  const t = useTranslations("viz.strataDiversity");
  const [height, setHeight] = useState(50);

  const niches = Math.floor(10 * Math.pow(height / 50, 2.5));

  const W_SVG = 340;
  const H_SVG = 260;
  const PAD_B = 30;
  const PAD_T = 20;
  const yGround = H_SVG - PAD_B;

  const yFor = (m: number) => Number((yGround - (m / 300) * (H_SVG - PAD_T - PAD_B)).toFixed(1));

  const strata = [
    { key: "emergent", min: 220, max: 300, tone: "amber", color: "var(--amber)" },
    { key: "canopy", min: 120, max: 220, tone: "teal", color: "var(--teal)" },
    { key: "understory", min: 20, max: 120, tone: "cyan", color: "var(--cyan)" },
    { key: "floor", min: 0, max: 20, tone: "subtle", color: "var(--subtle)" },
  ];

  const dots = useMemo(() => {
    const d = [];
    for (let i = 0; i < 150; i++) {
      const r1 = seededRandom(i);
      const r2 = seededRandom(i + 1000);
      const h = 300 * Math.pow(r1, 1.5); // Bias towards higher up
      const x = 70 + r2 * 200;
      d.push({ h, x, id: i });
    }
    return d;
  }, []);

  const canopyPath = useMemo(() => {
    const pts = [];
    pts.push(`M 170 ${yFor(height) - 10}`);
    pts.push(`Q 100 ${yFor(height) + 20} 120 ${yFor(height * 0.4)}`);
    pts.push(`Q 170 ${yFor(height * 0.1)} 220 ${yFor(height * 0.4)}`);
    pts.push(`Q 240 ${yFor(height) + 20} 170 ${yFor(height) - 10}`);
    return pts.join(" ");
  }, [height]);

  return (
    <VizFigure
      title={t("title")}
      subtitle={t("subtitle")}
      hint={t("hint")}
      caption={caption}
      tone={height > 220 ? "amber" : "teal"}
      className={className}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-stretch">
        <svg viewBox={`0 0 ${W_SVG} ${H_SVG}`} className="w-full sm:w-[55%]" role="img" aria-label={t("title")}>
          <GlowDefs idBase={uid} tones={["teal", "cyan", "amber", "magenta"]} />

          {/* Background Strata zones */}
          {strata.map((s) => {
            const yTop = yFor(s.max);
            const yBot = yFor(s.min);
            const active = height >= s.min;
            const opacity = active ? (height >= s.max ? 1 : (height - s.min) / (s.max - s.min)) : 0;

            return (
              <g key={s.key} style={{ opacity: Math.max(0.05, opacity), transition: "opacity 0.5s ease" }}>
                <rect
                  x={45}
                  y={yTop}
                  width={W_SVG - 45}
                  height={yBot - yTop}
                  fill={`color-mix(in oklab, ${s.color} 8%, transparent)`}
                />
                <line x1={45} y1={yTop} x2={W_SVG} y2={yTop} stroke={s.color} strokeOpacity={0.3} strokeDasharray="3 3" />
                <VizText x={50} y={yBot - 6} size="micro" tone={s.tone as any} weight={700}>
                  {t(s.key)}
                </VizText>
              </g>
            );
          })}

          {/* Trunk */}
          <line
            x1={170} y1={yGround} x2={170} y2={yFor(height)}
            stroke="color-mix(in oklab, var(--teal) 40%, var(--foreground))"
            strokeWidth={14} strokeLinecap="round"
            style={{ transition: "y2 0.3s ease" }}
          />
          <line
            x1={170} y1={yGround} x2={170} y2={yFor(height)}
            stroke="var(--void)"
            strokeWidth={4} strokeLinecap="round" strokeOpacity={0.5}
            style={{ transition: "y2 0.3s ease" }}
          />

          {/* Foliage */}
          <path
            d={canopyPath}
            fill="color-mix(in oklab, var(--teal) 15%, transparent)"
            stroke="var(--teal)"
            strokeWidth={2}
            filter={glowUrl(uid, "bloom")}
            style={{ transition: "d 0.3s ease" }}
          />

          {/* Niches dots */}
          {dots.map((d) => {
            if (d.h > height) return null;
            const toneStr = d.h > 220 ? "amber" : d.h > 120 ? "teal" : "cyan";
            return (
              <circle
                key={d.id}
                cx={Number(d.x.toFixed(1))}
                cy={Number(yFor(d.h).toFixed(1))}
                r={1.5}
                fill={`var(--${toneStr})`}
                filter={glowUrl(uid, "bloom")}
              />
            );
          })}

          {/* Y Axis */}
          <line x1={35} y1={PAD_T} x2={35} y2={yGround} stroke="var(--border)" strokeWidth={1} />
          <line x1={30} y1={yGround} x2={W_SVG} y2={yGround} stroke="var(--border-strong)" strokeWidth={2} />
          {[0, 100, 200, 300].map((m) => (
            <g key={m}>
              <line x1={30} y1={yFor(m)} x2={35} y2={yFor(m)} stroke="var(--border-strong)" />
              <VizTick x={25} y={yFor(m) + 3} anchor="end">
                {m}
              </VizTick>
            </g>
          ))}
          <VizText x={25} y={PAD_T - 5} size="micro" tone="subtle" anchor="end">
            m
          </VizText>
        </svg>

        <div className="flex flex-col justify-center gap-6 sm:w-[45%]">
          <VizSlider
            label={t("treeHeight")}
            display={`${height} m`}
            min={50}
            max={300}
            step={5}
            value={height}
            onChange={setHeight}
            tone={height > 220 ? "var(--amber)" : "var(--teal)"}
          />
          <div className="mt-2">
            <VizReadout
              label={t("niches")}
              value={niches.toString()}
              tone={height > 220 ? "var(--amber)" : "var(--teal)"}
              tinted
            />
          </div>
        </div>
      </div>
    </VizFigure>
  );
}
