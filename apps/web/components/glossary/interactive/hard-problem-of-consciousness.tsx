"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ControlButton } from "./shared/control-button";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

const PROCESSES = [
  { id: "spike", x: 18, y: 36 },
  { id: "syn", x: 34, y: 28 },
  { id: "net", x: 28, y: 52 },
  { id: "gm", x: 42, y: 44 },
] as const;

// Map every physical process; the qualia side stays unbridged — that's the hard problem.
export default function HardProblemOfConsciousness() {
  const t = useTranslations("viz.hard-problem-of-consciousness");
  const [mapped, setMapped] = useState(0);

  const allMapped = mapped >= PROCESSES.length;
  const fill = mapped / PROCESSES.length;

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setMapped(0)}
      allowFullscreen={false}
      caption={
        <span className="text-magenta">
          {t("gap")}: {t("bridged")}
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
          {/* split */}
          <line
            x1="50"
            y1="18"
            x2="50"
            y2="78"
            stroke="var(--border-strong)"
            strokeWidth="0.5"
            strokeDasharray="2 2"
          />

          {/* objective panel */}
          <rect
            x="8"
            y="20"
            width="38"
            height="56"
            rx="2"
            fill="var(--surface)"
            opacity={0.35}
            stroke="var(--cyan)"
            strokeWidth="0.5"
          />
          <text
            x="27"
            y="28"
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--cyan)" }}
          >
            {t("neural")}
          </text>

          {PROCESSES.map((p, i) => {
            const lit = i < mapped;
            return (
              <g key={p.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill={lit ? "var(--cyan)" : "var(--void)"}
                  stroke="var(--cyan)"
                  strokeWidth="0.6"
                  opacity={lit ? 0.9 : 0.35}
                />
                {lit &&
                  i > 0 && (
                    <line
                      x1={PROCESSES[i - 1].x}
                      y1={PROCESSES[i - 1].y}
                      x2={p.x}
                      y2={p.y}
                      stroke="var(--teal)"
                      strokeWidth="0.7"
                      opacity={0.7}
                    />
                  )}
              </g>
            );
          })}

          {/* progress bar */}
          <rect x="12" y="68" width="30" height="3" rx="1" fill="var(--void)" stroke="var(--border-strong)" strokeWidth="0.3" />
          <rect x="12" y="68" width={30 * fill} height="3" rx="1" fill="var(--cyan)" opacity={0.8} />

          {/* subjective panel — always empty-ish */}
          <rect
            x="54"
            y="20"
            width="38"
            height="56"
            rx="2"
            fill="var(--surface)"
            opacity={0.2}
            stroke="var(--magenta)"
            strokeWidth="0.5"
          />
          <text
            x="73"
            y="28"
            textAnchor="middle"
            style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            {t("qualia")}
          </text>

          {/* irreducible glow that never fills */}
          <circle
            cx="73"
            cy="50"
            r={6 + fill * 4}
            fill="var(--magenta)"
            opacity={0.15 + fill * 0.1}
          />
          <text
            x="73"
            y="52"
            textAnchor="middle"
            style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--magenta)" }}
          >
            ?
          </text>

          {/* gap arrow — never completes */}
          <path
            d="M46 48 L54 48"
            stroke="var(--amber)"
            strokeWidth="0.8"
            strokeDasharray="1.5 1.5"
            markerEnd="url(#arrow)"
          />
          <text
            x="50"
            y="44"
            textAnchor="middle"
            style={{ fontSize: 2.2, fontFamily: "monospace", fill: "var(--amber)" }}
          >
            {t("gap")}
          </text>
        </svg>

        <div className="absolute right-3 top-14">
          <Readout
            label={t("bridged")}
            value={allMapped ? "…" : `${mapped}/${PROCESSES.length}`}
            accent="magenta"
          />
        </div>

        <div className="absolute left-3 top-14 flex gap-1">
          <ControlButton
            onClick={() => setMapped((m) => Math.min(PROCESSES.length, m + 1))}
            className="px-2 py-1"
            variant="accent"
            disabled={allMapped}
          >
            {t("map")}
          </ControlButton>
          <ControlButton onClick={() => setMapped(0)} className="px-2 py-1">
            {t("reset")}
          </ControlButton>
        </div>
      </div>
    </GlossaryFrame>
  );
}
