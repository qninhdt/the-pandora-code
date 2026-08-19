"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { GlossaryFrame } from "./shared/frame";
import { Readout } from "./shared/readout";

// Ancestral default on every tip. True, ancient, and useless for grouping —
// a trait everyone carries cannot say who is whose close relative.
const TIPS = [18, 34, 50, 66, 82];

export default function Plesiomorphy() {
  const t = useTranslations("viz.plesiomorphy");
  const [show, setShow] = useState(false);

  return (
    <GlossaryFrame
      title={t("title")}
      category={t("category")}
      infoText={t("info")}
      onReset={() => setShow(false)}
      allowFullscreen={false}
      caption={
        <span className={show ? "text-muted" : "text-muted"}>
          {show ? t("noSignal") : t("hint")}
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
          <line x1="50" y1="84" x2="50" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          <line x1="18" y1="70" x2="82" y2="70" stroke="var(--border-strong)" strokeWidth="1" />
          {TIPS.map((x) => (
            <line
              key={`s-${x}`}
              x1={x}
              y1="70"
              x2={x}
              y2="32"
              stroke="var(--border-strong)"
              strokeWidth="1"
            />
          ))}

          {/* basal mark at root */}
          {show && (
            <circle cx="50" cy="70" r="5" fill="var(--teal)" opacity="0.35" />
          )}

          {TIPS.map((x, i) => (
            <g key={x}>
              <circle
                cx={x}
                cy="32"
                r="2.8"
                fill="var(--surface)"
                stroke="var(--border-strong)"
                strokeWidth="0.5"
              />
              {show && (
                <rect
                  x={x - 2.5}
                  y="24"
                  width="5"
                  height="3"
                  rx="0.5"
                  fill="var(--teal)"
                  opacity="0.7"
                />
              )}
              <text
                x={x}
                y="18"
                textAnchor="middle"
                style={{ fontSize: 2.4, fontFamily: "monospace", fill: "var(--muted)" }}
              >
                {String.fromCharCode(65 + i)}
              </text>
            </g>
          ))}

          {show && (
            <text
              x="50"
              y="90"
              textAnchor="middle"
              style={{ fontSize: 2.6, fontFamily: "monospace", fill: "var(--teal)" }}
            >
              {t("everywhere")}
            </text>
          )}
        </svg>

        <div className="absolute right-3 top-16">
          <Readout
            label={t("ancestral")}
            value={show ? "5/5" : "—"}
            accent="teal"
          />
        </div>

        <div className="absolute inset-x-3 bottom-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="rounded-lg border px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide backdrop-blur-md"
            style={{
              borderColor: show ? "var(--teal)" : "var(--border-strong)",
              color: show ? "var(--teal)" : "var(--muted)",
              background: "var(--void)",
            }}
          >
            {t("hint")}
          </button>
        </div>
      </div>
    </GlossaryFrame>
  );
}
