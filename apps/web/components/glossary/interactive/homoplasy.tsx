"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// The counterfeit signature. Homoplasy is similarity that was not inherited from a
// common ancestor — a coincidence arrived at twice, not a trait passed down. It is
// the great enemy of tree-building because it looks exactly like real kinship. It
// creeps in through convergence, parallelism, or reversal. Highlight the trait and
// watch it flare on two far-apart tips of the tree with no shared branch between
// them: telling this apart from true homology is the whole art of cladistics.
const TIPS = [
  { key: "t1", x: 20, hasTrait: false },
  { key: "t2", x: 36, hasTrait: true }, // independent gain #1
  { key: "t3", x: 52, hasTrait: false },
  { key: "t4", x: 68, hasTrait: false },
  { key: "t5", x: 84, hasTrait: true }, // independent gain #2
];

export default function Homoplasy() {
  const t = useTranslations("viz.homoplasy");
  const [show, setShow] = useState(false);

  const tipY = 30;
  const rootY = 82;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShow(false)}
      allowFullscreen={false}
      caption={
        show ? (
          <span className="text-magenta">{t("twoIndependentGains")}</span>
        ) : (
          <span className="text-muted">{t("highlightHint")}</span>
        )
      }
    >
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={t("title")}
        >
          {/* a simple balanced cladogram: root splits, then splits again */}
          {/* root stem */}
          <line x1="52" y1={rootY} x2="52" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          {/* first split */}
          <line x1="28" y1="70" x2="76" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="28" y1="70" x2="28" y2="56" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="76" y1="70" x2="76" y2="56" stroke="var(--border-strong)" strokeWidth="1" />
          {/* left clade split */}
          <line x1="20" y1="56" x2="36" y2="56" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="20" y1="56" x2="20" y2={tipY} stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="36" y1="56" x2="36" y2={tipY} stroke="var(--border-strong)" strokeWidth="1" />
          {/* right clade split (three tips) */}
          <line x1="52" y1="56" x2="52" y2={tipY} stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="68" y1="56" x2="84" y2="56" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="68" y1="56" x2="68" y2={tipY} stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="84" y1="56" x2="84" y2={tipY} stroke="var(--border-strong)" strokeWidth="1" />

          {/* tips with trait markers */}
          {TIPS.map((tip) => {
            const lit = show && tip.hasTrait;
            return (
              <g key={tip.key}>
                <circle
                  cx={tip.x}
                  cy={tipY}
                  r={lit ? 4 : 2.6}
                  fill={lit ? "var(--magenta)" : "var(--surface)"}
                  stroke={tip.hasTrait && show ? "var(--magenta)" : "var(--border-strong)"}
                  strokeWidth="0.6"
                  opacity={lit ? 0.9 : 0.7}
                />
                {lit &&
                  Array.from({ length: 2 }, (_, k) => (
                    <circle
                      key={k}
                      cx={tip.x}
                      cy={tipY}
                      r={5 + k * 2.5}
                      fill="none"
                      stroke="var(--magenta)"
                      strokeWidth="0.3"
                      opacity={0.4 - k * 0.15}
                    />
                  ))}
                <text
                  x={tip.x}
                  y={tipY - 6}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.6,
                    fontFamily: "monospace",
                    fill: lit ? "var(--magenta)" : "var(--muted)",
                  }}
                >
                  {t(tip.key)}
                </text>
              </g>
            );
          })}

          {/* the deceptive "shared" look annotation */}
          {show && (
            <path
              d="M36 24 Q 60 16 84 24"
              fill="none"
              stroke="var(--magenta)"
              strokeWidth="0.4"
              strokeDasharray="2 2"
              opacity="0.5"
            />
          )}
          {show && (
            <text
              x="60"
              y="14"
              textAnchor="middle"
              style={{ fontSize: 2.8, fontFamily: "monospace", fill: "var(--magenta)" }}
            >
              {t("looksShared")}
            </text>
          )}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("origins")}
            value={show ? "2×" : "?"}
            accent={show ? "magenta" : "foreground"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md transition-colors"
            style={{
              borderColor: show ? "var(--magenta)" : "var(--border-strong)",
              color: show ? "var(--magenta)" : "var(--muted)",
              background: show
                ? "color-mix(in oklab, var(--magenta) 12%, transparent)"
                : "var(--void)",
            }}
          >
            {show ? t("hideTrait") : t("highlightTrait")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
