"use client";

import { GlowDefs, glowUrl } from "@/components/content/viz/glow-defs";
import { VizFigure } from "@/components/content/viz/viz-figure";
import { VizText } from "@/components/content/viz/viz-svg-text";
import { useLocale, useTranslations } from "next-intl";
import { useId, useState } from "react";

interface HoxColinearityMapProps {
  caption?: string;
  className?: string;
}

// Scientific data stays in code. The Hox genes sit in a row on the chromosome,
// and their order matches the order of the body regions they label, head to
// tail. Hover/click a gene to light up the body band it addresses, in the same
// colour — colinearity made literal. Each gene is a label-maker, not a builder.
interface Gene {
  color: string;
  vi: { gene: string; region: string };
  en: { gene: string; region: string };
}

const GENES: Gene[] = [
  {
    color: "var(--cyan)",
    en: { gene: "Hox-1", region: "Head end" },
    vi: { gene: "Hox-1", region: "Đầu" },
  },
  {
    color: "var(--teal)",
    en: { gene: "Hox-2", region: "Neck" },
    vi: { gene: "Hox-2", region: "Cổ" },
  },
  {
    color: "var(--amber)",
    en: { gene: "Hox-3", region: "Forelimb zone" },
    vi: { gene: "Hox-3", region: "Vùng chi trước" },
  },
  {
    color: "var(--accent-soft)",
    en: { gene: "Hox-4", region: "Mid-body" },
    vi: { gene: "Hox-4", region: "Thân giữa" },
  },
  {
    color: "var(--magenta)",
    en: { gene: "Hox-5", region: "Hindlimb zone" },
    vi: { gene: "Hox-5", region: "Vùng chi sau" },
  },
  {
    color: "var(--speculation)",
    en: { gene: "Hox-6", region: "Tail end" },
    vi: { gene: "Hox-6", region: "Đuôi" },
  },
];

const W = 320;
const HVB = 160;
const SHELF_Y = 22;
const SHELF_H = 30;
const BODY_Y = 104;
const BODY_H = 34;
const X0 = 24;
const SLOT = (W - X0 * 2) / GENES.length;

export function HoxColinearityMap({ caption, className }: HoxColinearityMapProps) {
  const uid = useId();
  const t = useTranslations("viz.hoxMap");
  const locale = useLocale() as "vi" | "en";
  const [active, setActive] = useState<number | null>(null);

  const slotX = (i: number) => X0 + SLOT * i + SLOT / 2;
  const current = active !== null ? GENES[active][locale] : null;

  return (
    <VizFigure title={t("title")} caption={caption} className={className} hint={t("hint")}>
      <div className="rounded-xl border border-border bg-void/30 p-2">
        <svg viewBox={`0 0 ${W} ${HVB}`} className="w-full" role="img" aria-label={t("title")}>
          <GlowDefs idBase={uid} />

          {/* shelf label */}
          <VizText x={X0} y={SHELF_Y - 7} size="small" tone="subtle">
            {t("shelf")}
          </VizText>
          {/* gene "books" on the shelf */}
          {GENES.map((g, i) => {
            const isOn = active === i;
            const bx = X0 + SLOT * i + 3;
            const bw = SLOT - 6;
            return (
              <g
                key={g.en.gene}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(isOn ? null : i)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={bx}
                  y={SHELF_Y}
                  width={bw}
                  height={SHELF_H}
                  rx={4}
                  fill={isOn ? g.color : `color-mix(in oklab, ${g.color} 26%, transparent)`}
                  stroke={g.color}
                  strokeWidth={isOn ? 2 : 1}
                  strokeOpacity={isOn ? 1 : 0.6}
                  filter={isOn ? glowUrl(uid, "bloom") : undefined}
                />
                {/* inset top highlight gives the block depth */}
                <rect
                  x={bx + 1.5}
                  y={SHELF_Y + 1.5}
                  width={bw - 3}
                  height={SHELF_H / 2}
                  rx={3}
                  fill={`color-mix(in oklab, ${isOn ? "white" : g.color} ${isOn ? "30%" : "18%"}, transparent)`}
                  pointerEvents="none"
                />
                <VizText
                  x={slotX(i)}
                  y={SHELF_Y + SHELF_H / 2 + 4}
                  size="small"
                  anchor="middle"
                  tone={isOn ? "void" : g.color}
                  weight={700}
                >
                  {g[locale].gene}
                </VizText>
              </g>
            );
          })}

          {/* the embryo body, head (left) to tail (right) */}
          <VizText x={X0} y={BODY_Y - 8} size="small" tone="subtle">
            {t("body")}
          </VizText>
          {GENES.map((g, i) => {
            const isOn = active === i;
            const bx = X0 + SLOT * i;
            return (
              <g key={`band-${g.en.gene}`}>
                <rect
                  x={bx + 1}
                  y={BODY_Y}
                  width={SLOT - 2}
                  height={BODY_H}
                  rx={3}
                  fill={isOn ? g.color : `color-mix(in oklab, ${g.color} 14%, transparent)`}
                  stroke={isOn ? g.color : "var(--border)"}
                  strokeWidth={isOn ? 2 : 0.5}
                  strokeOpacity={isOn ? 1 : 0.7}
                  style={{ transition: "all 0.2s ease" }}
                  filter={isOn ? glowUrl(uid, "bloom") : undefined}
                />
                {/* inset top highlight on the active band for depth */}
                {isOn ? (
                  <rect
                    x={bx + 2.5}
                    y={BODY_Y + 1.5}
                    width={SLOT - 5}
                    height={BODY_H / 2}
                    rx={2}
                    fill="color-mix(in oklab, white 28%, transparent)"
                    pointerEvents="none"
                  />
                ) : null}
                {/* connector line from gene to band when active */}
                {isOn ? (
                  <line
                    x1={slotX(i)}
                    y1={SHELF_Y + SHELF_H}
                    x2={slotX(i)}
                    y2={BODY_Y}
                    stroke={g.color}
                    strokeWidth={1.5}
                    strokeDasharray="3 2"
                  />
                ) : null}
              </g>
            );
          })}
          {/* head marker */}
          <circle
            cx={X0 + 6}
            cy={BODY_Y + BODY_H / 2}
            r={4}
            fill="var(--surface-overlay)"
            stroke="var(--border-strong)"
            strokeWidth={1}
          />
        </svg>
      </div>

      <div className="mt-2 min-h-[2.5rem] rounded-lg border border-border bg-void/30 px-3 py-2">
        {current ? (
          <p className="font-sans text-sm">
            <span className="font-700 text-foreground">{current.gene}</span>
            <span className="text-subtle"> → </span>
            <span className="text-teal">{current.region}</span>
          </p>
        ) : (
          <p className="font-sans text-sm text-subtle">{t("prompt")}</p>
        )}
      </div>
    </VizFigure>
  );
}
