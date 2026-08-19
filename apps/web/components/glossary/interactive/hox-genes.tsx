"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";
import { useInView } from "./shared/use-in-view";
import { useRafLoop } from "./shared/use-raf-loop";

// The genes that hand out addresses. Hox genes build nothing themselves — they
// label position along the head-to-tail axis, telling each region whether it is
// head, mid-body or tail. The uncanny part is collinearity: they sit in a row on
// the chromosome in the very same order as the body regions they govern,
// conserved from fly to mouse to human. Click a gene and its matching band lights.
const HOX = [
  { key: "lab", color: "#ff5da8" },
  { key: "pb", color: "#ff8f6b" },
  { key: "dfd", color: "#ffb454" },
  { key: "scr", color: "#d9d24a" },
  { key: "antp", color: "#2bd4a8" },
  { key: "ubx", color: "#36c5d9" },
  { key: "abda", color: "#6aa9ff" },
  { key: "abdb", color: "#9a7dff" },
];

export default function HoxGenes() {
  const t = useTranslations("viz.hox-genes");
  const { ref, inView } = useInView<HTMLDivElement>();
  const [sel, setSel] = useState<number | null>(null);
  const force = useState(0)[1];

  useRafLoop(() => force((n) => (n + 1) % 1_000_000), { active: inView });

  const n = HOX.length;
  const geneW = 74 / n;
  // the embryo is drawn as a tapering worm: wide head (left) → thin tail (right)
  const bodyX0 = 14;
  const bodyX1 = 88;
  const bodyLen = bodyX1 - bodyX0;
  const segW = bodyLen / n;
  const halfH = (i: number) => 13 - (i / (n - 1)) * 7; // taper head→tail
  const cy = 62;
  const pulse = 0.5 + 0.5 * Math.sin((Date.now() / 1000) * 3);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setSel(null)}
      allowFullscreen={false}
      caption={
        sel != null ? (
          <span style={{ color: HOX[sel].color }}>{t("collinear")}</span>
        ) : (
          <span className="text-muted">{t("clickGene")}</span>
        )
      }
    >
      <div ref={ref} className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          <defs>
            <linearGradient id="hox-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0c1424" />
              <stop offset="100%" stopColor="#080d18" />
            </linearGradient>
            <linearGradient id="hox-chr" x1="0" y1="0" x2="1" y2="0">
              {HOX.map((g, i) => (
                <stop
                  key={g.key}
                  offset={`${(i / (n - 1)) * 100}%`}
                  stopColor={g.color}
                />
              ))}
            </linearGradient>
            <filter id="hox-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="0.9" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {HOX.map((g) => (
              <radialGradient
                key={g.key}
                id={`hox-seg-${g.key}`}
                cx="40%"
                cy="30%"
                r="80%"
              >
                <stop offset="0%" stopColor={g.color} stopOpacity="0.95" />
                <stop offset="100%" stopColor={g.color} stopOpacity="0.45" />
              </radialGradient>
            ))}
          </defs>

          <rect x="0" y="0" width="100" height="100" fill="url(#hox-bg)" />

          <text
            x="13"
            y="18"
            className="fill-muted"
            style={{ fontSize: 3, fontFamily: "monospace" }}
          >
            {t("chromosome")}
          </text>

          {/* the chromosome ribbon carrying the ordered gene cluster */}
          <path
            d="M13 27 Q50 24 87 27"
            fill="none"
            stroke="url(#hox-chr)"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.55"
          />

          {/* Hox gene beads on the chromosome */}
          {HOX.map((g, i) => {
            const x = 14 + i * geneW + geneW / 2;
            const gy = 27 - Math.sin((i / (n - 1)) * Math.PI) * 2.4;
            const on = sel === i;
            const dim = sel != null && !on;
            return (
              <g
                key={g.key}
                role="button"
                tabIndex={0}
                aria-label={t(g.key)}
                aria-pressed={on}
                style={{ cursor: "pointer" }}
                onClick={() => setSel(i === sel ? null : i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSel(i === sel ? null : i);
                  }
                }}
              >
                {/* generous invisible hit target */}
                <rect
                  x={14 + i * geneW}
                  y={18}
                  width={geneW}
                  height={18}
                  fill="transparent"
                />
                {on && (
                  <circle
                    cx={x}
                    cy={gy}
                    r={4 + pulse * 1.6}
                    fill={g.color}
                    opacity={0.25}
                  />
                )}
                <circle
                  cx={x}
                  cy={gy}
                  r={on ? 3.2 : 2.4}
                  fill={g.color}
                  opacity={dim ? 0.3 : 1}
                  stroke={on ? "var(--foreground)" : "transparent"}
                  strokeWidth="0.5"
                  filter={dim ? undefined : "url(#hox-glow)"}
                />
                <text
                  x={x}
                  y={gy - 4.4}
                  textAnchor="middle"
                  fill={dim ? "var(--muted)" : g.color}
                  style={{ fontSize: 2.4, fontFamily: "monospace" }}
                  opacity={dim ? 0.4 : 1}
                >
                  {t(g.key)}
                </text>
              </g>
            );
          })}

          {/* collinearity thread from gene to its body segment */}
          {sel != null &&
            (() => {
              const gx = 14 + sel * geneW + geneW / 2;
              const sx = bodyX0 + sel * segW + segW / 2;
              return (
                <path
                  d={`M${gx} 30 C ${gx} 42 ${sx} 44 ${sx} ${cy - halfH(sel)}`}
                  fill="none"
                  stroke={HOX[sel].color}
                  strokeWidth="0.6"
                  strokeDasharray="1.6 1.6"
                  strokeDashoffset={-(Date.now() / 1000) * 4}
                  opacity="0.8"
                  filter="url(#hox-glow)"
                />
              );
            })()}

          {/* the embryo — a tapering segmented worm, banded in gene order */}
          {HOX.map((g, i) => {
            const x = bodyX0 + i * segW;
            const h = halfH(i);
            const hn = halfH(Math.min(n - 1, i + 1));
            const on = sel === i;
            const dim = sel != null && !on;
            return (
              <path
                key={g.key}
                d={`M${x} ${cy - h} L${x + segW} ${cy - hn} L${x + segW} ${cy + hn} L${x} ${cy + h} Z`}
                fill={`url(#hox-seg-${g.key})`}
                opacity={dim ? 0.2 : on ? 1 : 0.75}
                stroke="#070912"
                strokeWidth="0.4"
                filter={on ? "url(#hox-glow)" : undefined}
              />
            );
          })}
          {/* head cap + eye */}
          <ellipse
            cx={bodyX0 - 1}
            cy={cy}
            rx="3"
            ry={halfH(0)}
            fill="url(#hox-seg-lab)"
            opacity={sel != null && sel !== 0 ? 0.2 : 0.9}
          />
          <circle
            cx={bodyX0 + 1.5}
            cy={cy - 2}
            r="1"
            fill="#070912"
            opacity="0.8"
          />

          <text
            x={bodyX0}
            y={cy + 20}
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("head")}
          </text>
          <text
            x={bodyX1}
            y={cy + 20}
            textAnchor="end"
            className="fill-muted"
            style={{ fontSize: 2.8, fontFamily: "monospace" }}
          >
            {t("tail")}
          </text>
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("geneLabel")}
            value={sel != null ? t(HOX[sel].key) : `${n}`}
            accent="cyan"
          />
        </div>
      </div>
    </GlossaryFrame>
  );
}
