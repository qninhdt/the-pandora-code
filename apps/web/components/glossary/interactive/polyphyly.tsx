"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// A basket, not a limb. Two distant tips look alike and get circled together
// while their true roots stay far apart on separate branches.
const TIPS = [
  { id: "A", x: 22, y: 30, branch: "L", fake: false },
  { id: "B", x: 40, y: 30, branch: "L", fake: true },
  { id: "C", x: 62, y: 30, branch: "R", fake: false },
  { id: "D", x: 80, y: 30, branch: "R", fake: true },
];

export default function Polyphyly() {
  const t = useTranslations("viz.polyphyly");
  const [show, setShow] = useState(true);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShow(true)}
      allowFullscreen={false}
      caption={
        <span className={show ? "text-amber" : "text-cyan"}>
          {show ? t("poly") : t("trueRoots")}
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
          <line x1="50" y1="86" x2="50" y2="72" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="31" y1="72" x2="71" y2="72" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="31" y1="72" x2="31" y2="50" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="71" y1="72" x2="71" y2="50" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="22" y1="50" x2="40" y2="50" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="62" y1="50" x2="80" y2="50" stroke="var(--border-strong)" strokeWidth="1" />
          {TIPS.map((tip) => (
            <line
              key={`s-${tip.id}`}
              x1={tip.x}
              y1="50"
              x2={tip.x}
              y2={tip.y}
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
          ))}

          {show && (
            <ellipse
              cx="60"
              cy="30"
              rx="28"
              ry="12"
              fill="none"
              stroke="var(--amber)"
              strokeWidth="0.9"
              strokeDasharray="2 1.5"
              opacity="0.85"
            />
          )}

          {TIPS.map((tip) => {
            const lit = show && tip.fake;
            return (
              <g key={tip.id}>
                <circle
                  cx={tip.x}
                  cy={tip.y}
                  r={lit ? 3.6 : 2.6}
                  fill={lit ? "var(--amber)" : "var(--surface)"}
                  stroke="var(--border-strong)"
                  strokeWidth="0.5"
                />
                <text
                  x={tip.x}
                  y={tip.y - 7}
                  textAnchor="middle"
                  style={{
                    fontSize: 2.6,
                    fontFamily: "monospace",
                    fill: lit ? "var(--amber)" : "var(--muted)",
                  }}
                >
                  {tip.id}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={show ? t("poly") : t("trueRoots")}
            value={show ? "B+D" : "—"}
            accent={show ? "amber" : "cyan"}
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: show ? "var(--amber)" : "var(--cyan)",
              color: show ? "var(--amber)" : "var(--cyan)",
              background: "var(--void)",
            }}
          >
            {show ? t("hide") : t("show")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
