"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Shared derived novelty — the hard evidence of a clade. Pick the mark that
// appears only on one limb's descendants; that limb lights as a valid clade.
const TIPS = [
  { id: 0, x: 20, has: false },
  { id: 1, x: 36, has: true },
  { id: 2, x: 52, has: true },
  { id: 3, x: 68, has: false },
  { id: 4, x: 84, has: false },
];

export default function Synapomorphy() {
  const t = useTranslations("viz.synapomorphy");
  const [show, setShow] = useState(false);
  const members = TIPS.filter((tip) => tip.has).length;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShow(false)}
      allowFullscreen={false}
      caption={
        <span className={show ? "text-cyan" : "text-muted"}>
          {show ? t("valid") : t("hint")}
        </span>
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
          <line x1="52" y1="84" x2="52" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="28" y1="70" x2="76" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="28" y1="70" x2="28" y2="52" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="76" y1="70" x2="76" y2="52" stroke="var(--border-strong)" strokeWidth="1" />
          <line
            x1="20"
            y1="52"
            x2="52"
            y2="52"
            stroke={show ? "var(--cyan)" : "var(--border-strong)"}
            strokeWidth={show ? 1.5 : 1}
          />
          <line x1="68" y1="52" x2="84" y2="52" stroke="var(--border-strong)" strokeWidth="1" />

          {TIPS.map((tip) => {
            const lit = show && tip.has;
            return (
              <g key={tip.id}>
                <line
                  x1={tip.x}
                  y1="52"
                  x2={tip.x}
                  y2="30"
                  stroke={lit ? "var(--cyan)" : "var(--border-strong)"}
                  strokeWidth={lit ? 1.5 : 1}
                />
                <circle
                  cx={tip.x}
                  cy="30"
                  r={lit ? 3.6 : 2.6}
                  fill={lit ? "var(--cyan)" : "var(--surface)"}
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                {lit && (
                  <>
                    <rect
                      x={tip.x - 2.4}
                      y="20"
                      width="4.8"
                      height="3"
                      rx="0.5"
                      fill="var(--cyan)"
                    />
                    <circle
                      cx={tip.x}
                      cy="30"
                      r="7"
                      fill="none"
                      stroke="var(--cyan)"
                      strokeWidth="0.35"
                      opacity="0.45"
                    />
                  </>
                )}
                <text
                  x={tip.x}
                  y="14"
                  textAnchor="middle"
                  style={{
                    fontSize: 2.5,
                    fontFamily: "monospace",
                    fill: lit ? "var(--cyan)" : "var(--muted)",
                  }}
                >
                  {String.fromCharCode(65 + tip.id)}
                </text>
              </g>
            );
          })}

          {/* origin node of the synapomorphy */}
          {show && (
            <circle cx="36" cy="52" r="3.2" fill="var(--cyan)" opacity="0.9" />
          )}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("sharedDerived")}
            value={show ? `${members}` : "—"}
            accent="cyan"
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: show ? "var(--cyan)" : "var(--border-strong)",
              color: show ? "var(--cyan)" : "var(--muted)",
              background: show
                ? "color-mix(in oklab, var(--cyan) 12%, transparent)"
                : "var(--void)",
            }}
          >
            {show ? t("cladeLit") : t("hint")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
